import type { PageServerLoad } from './$types';
import { prisma } from '$lib/prisma';
import { superValidate } from 'sveltekit-superforms/server';
import { fail, type Actions } from '@sveltejs/kit';
import { zod } from 'sveltekit-superforms/adapters';
import { createMessageSchema, refreshAssistantDocumentSchema } from '$lib/schema';
import { findSearchThreadById } from '$lib/features/search/repositories/searchQuery';
import { message } from 'sveltekit-superforms/server';
import { newUserMessageCreateInput } from '$lib/dtos';

export const load = (async ({ locals, params }) => {
  const refreshAssistantDocumentForm = await superValidate(zod(refreshAssistantDocumentSchema));

  const threadId = params.id;
  const thread = await findSearchThreadById(prisma, locals.userId, threadId);
  const pageTitle = `ファイル検索：${thread.title}`;

  const userLastMessage = thread.messages.filter((m) => m.role === 'USER').slice(-1)[0];
  const createMessageForm = await superValidate(zod(createMessageSchema), {
    defaults: {
      contents: userLastMessage.contents,
      threadId: threadId,
      modelType: 'GPT_35_TURBO', // なんでもいい
    },
  });

  return {
    pageTitle: pageTitle,
    thread: thread,
    createMessageForm: createMessageForm,
    refreshAssistantDocumentForm: refreshAssistantDocumentForm,
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  createMessage: async ({ locals, request }) => {
    const form = await superValidate(request, zod(createMessageSchema));
    if (!form.valid) {
      return fail(400, { form });
    }

    const newMessageInput = newUserMessageCreateInput({
      userId: locals.userId,
      threadId: form.data.threadId,
      contents: form.data.contents,
    });
    await prisma.message.create({
      data: newMessageInput,
    });

    return message(form, 'success');
  },

  refreshAssistantDocument: async ({ request }) => {
    const form = await superValidate(request, zod(refreshAssistantDocumentSchema));
    if (!form.valid) {
      return fail(400, { refreshAssistantDocumentSchema });
    }

    await prisma.assistant.update({
      where: {
        id: form.data.assistantId,
      },
      data: {
        assistantStatus: 'PREPARING',
      },
    });
    return message(form, 'success');
  },
};

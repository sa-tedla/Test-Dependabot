import type { PageServerLoad } from './$types';
import { prisma } from '$lib/prisma';
import { type Actions, fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { createMessageSchema } from '$lib/schema';
import { newUserMessageCreateInput } from '$lib/dtos';
import { message } from 'sveltekit-superforms';

export const load = (async ({ locals, params }) => {
  const form = await superValidate(zod(createMessageSchema));

  const thread = await prisma.thread.findUniqueOrThrow({
    where: {
      id: params.id,
      userId: locals.userId,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: 'asc',
        },
        include: {
          messageDocuments: true,
        },
      },
    },
  });
  const assistant = await prisma.assistant.findFirst({
    where: {
      id: thread.assistantId,
    },
  });

  const pageTitle = `一般利用：${thread.title}`;
  return {
    pageTitle: pageTitle,
    form: form,
    assistant: assistant,
    thread: thread,
    messages: thread.messages,
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  default: async ({ locals, request }) => {
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
};

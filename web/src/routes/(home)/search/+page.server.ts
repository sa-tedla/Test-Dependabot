import type { PageServerLoad } from './$types';
import { prisma } from '$lib/prisma';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { findSearchAssistantsByUserId } from '$lib/features/search/repositories/searchQuery';
import { refreshAssistantDocumentSchema, updateSearchAssistantSchema } from '$lib/schema';
import { type Actions, fail, redirect } from '@sveltejs/kit';
import { newThreadCreateInput } from '$lib/dtos';
import { newUserMessageCreateInput } from '$lib/dtos';
import { message } from 'sveltekit-superforms/server';
import { generateUniqueID } from '$lib/utils/generateUniqueID';
import { createSearchThreadSchema } from '$lib/features/search/search_schema';
import { findGroupByUserID } from '$lib/features/group/repositories/groupQuery';

export const load = (async ({ locals }) => {
  const refreshAssistantDocumentForm = await superValidate(zod(refreshAssistantDocumentSchema));
  const createThreadForm = await superValidate(zod(createSearchThreadSchema));
  const updateSearchAssistantForm = await superValidate(zod(updateSearchAssistantSchema));

  const assistants = await findSearchAssistantsByUserId(prisma, locals.userId);
  const groups = await findGroupByUserID(prisma, locals.userId);

  return {
    groups: groups,
    assistants: assistants,
    createThreadForm: createThreadForm,
    updateSearchAssistantForm: updateSearchAssistantForm,
    refreshAssistantDocumentForm: refreshAssistantDocumentForm,
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  createThread: async ({ request, locals }) => {
    const form = await superValidate(request, zod(createSearchThreadSchema));
    if (!form.valid) {
      return fail(400, { form });
    }

    const thread = newThreadCreateInput({
      userId: locals.userId,
      assistantId: form.data.assistantId,
      contents: form.data.contents,
      modelType: form.data.modelType,
    });
    const message = newUserMessageCreateInput({
      userId: locals.userId,
      threadId: thread.id,
      contents: form.data.contents,
    });
    await prisma.$transaction(async (tx) => {
      await tx.thread.create({
        data: thread,
      });
      await tx.message.create({
        data: message,
      });
    });

    redirect(302, `/thread/search/${thread.id}`);
  },

  refreshAssistantDocument: async ({ request }) => {
    const form = await superValidate(request, zod(refreshAssistantDocumentSchema));
    if (!form.valid) {
      return fail(400, { form });
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

  updateSearchAssistant: async ({ request, locals }) => {
    const form = await superValidate(request, zod(updateSearchAssistantSchema));
    if (!form.valid) {
      return fail(400, { form });
    }

    // ソースの事前処理: 重複削除, URLクエリの削除
    const newSources = Array.from(new Set(form.data.sources.map((s) => s.split('?')[0])));

    await prisma.$transaction(async (tx) => {
      // アシスタントの更新
      await tx.assistant.update({
        where: {
          id: form.data.assistantId,
        },
        data: {
          name: form.data.name,
          description: form.data.description,
          icon: form.data.icon,
          assistantStatus: 'PREPARING',
        },
      });
      // 公開範囲の更新
      const groups = await findGroupByUserID(tx, locals.userId);
      await tx.groupAssistantRelation.deleteMany({
        where: {
          assistantId: form.data.assistantId,
          groupId: {
            in: groups.map((group) => group.id),
          },
        },
      });
      if (form.data.groupIds.length > 0) {
        await tx.groupAssistantRelation.createMany({
          data: form.data.groupIds.map((groupId) => ({
            assistantId: form.data.assistantId,
            groupId: groupId,
          })),
        });
      }
      // IndexSourcesの更新
      await tx.indexSource.deleteMany({
        where: {
          indexId: form.data.indexId,
        },
      });
      await tx.indexSource.createMany({
        data: newSources.map((source) => ({
          id: generateUniqueID(),
          indexId: form.data.indexId,
          source: source,
          syncedAt: new Date(0),
        })),
      });
    });

    return message(form, 'success');
  },
};

import type { PageServerLoad } from './$types';
import { prisma } from '$lib/prisma';
import type { Prisma } from '@prisma/client';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { refreshAssistantDocumentSchema } from '$lib/schema';
import { type Actions, fail, redirect } from '@sveltejs/kit';
import { newMessageDocumentCreateInput, newThreadCreateInput } from '$lib/dtos';
import { newUserMessageCreateInput } from '$lib/dtos';
import { message } from 'sveltekit-superforms/server';
import { findGroupByUserID } from '$lib/features/group/repositories/groupQuery';
import { generateUniqueID } from '$lib/utils/generateUniqueID';
import {
  createQAndAThreadSchema,
  updateQAndAAssistantSchema,
} from '$lib/features/q_and_a/qAndASchema';
import { findQAndAAssistantsById } from '$lib/features/q_and_a/repositories/qAndAQuery';
import { FileProcessingService } from '$lib/features/message_document/services/fileProcessingService';
import { type FileProcessingResult } from '$lib/features/message_document/messageDocumentDto';

export const load = (async ({ locals }) => {
  const createThreadForm = await superValidate(zod(createQAndAThreadSchema));
  const refreshAssistantDocumentForm = await superValidate(zod(refreshAssistantDocumentSchema));
  const updateQandAAssistantForm = await superValidate(zod(updateQAndAAssistantSchema));

  const assistants = await findQAndAAssistantsById(prisma, locals.userId);
  const groups = await findGroupByUserID(prisma, locals.userId);

  return {
    groups: groups,
    assistants: assistants,
    createThreadForm: createThreadForm,
    updateQAndAAssistantForm: updateQandAAssistantForm,
    refreshAssistantDocumentForm: refreshAssistantDocumentForm,
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  createThread: async ({ request, locals }) => {
    const form = await superValidate(request, zod(createQAndAThreadSchema));
    if (!form.valid) {
      return fail(400, { form });
    }

    const files = form.data.files ?? [];
    // 各ファイルのアップロードとパース処理
    const fileProcessingResults: FileProcessingResult[] = await Promise.all(
      files.map(async (file) => {
        const shouldParse = FileProcessingService.shouldParseFile(file);
        return FileProcessingService.processFile(file, shouldParse);
      })
    );

    const errorResult = FileProcessingService.handleFileProcessingErrors(
      fileProcessingResults,
      form
    );
    if (errorResult.hasError) {
      return fail(errorResult.status!, { form });
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
    const messageDocuments = FileProcessingService.createMessageDocumentInputs(
      fileProcessingResults,
      message.id
    ).map((input) => newMessageDocumentCreateInput(input));

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.thread.create({
        data: thread,
      });
      await tx.message.create({
        data: message,
      });

      if (messageDocuments.length > 0) {
        await tx.messageDocument.createMany({
          data: messageDocuments,
        });
      }
    });
    redirect(302, `/thread/q-and-a/${thread.id}`);
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

  updateQAndAAssistant: async ({ request, locals }) => {
    const form = await superValidate(request, zod(updateQAndAAssistantSchema));
    if (!form.valid) {
      return fail(400, { form });
    }

    // ソースの事前処理: 重複削除, URLクエリの削除
    const newSources = Array.from(new Set(form.data.sources.map((s) => s.split('?')[0])));

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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
      await tx.qAndAAssistant.update({
        where: {
          assistantId: form.data.assistantId,
        },
        data: {
          systemPrompt: form.data.systemPrompt,
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

import type { PageServerLoad } from './$types';
import { prisma } from '$lib/prisma';
import type { Prisma } from '@prisma/client';
import { superValidate } from 'sveltekit-superforms/server';
import { fail, type Actions, error } from '@sveltejs/kit';
import { zod } from 'sveltekit-superforms/adapters';
import {
  createMessageSchema,
  refreshAssistantDocumentSchema,
  userFeedbackV2Schema,
} from '$lib/schema';
import { message } from 'sveltekit-superforms/server';
import { newMessageDocumentCreateInput, newUserMessageCreateInput } from '$lib/dtos';
import { findQAndAThreadById } from '$lib/features/q_and_a/repositories/qAndAQuery';
import { env } from '$env/dynamic/private';
import { FileProcessingService } from '$lib/features/message_document/services/fileProcessingService';
import type { FileProcessingResult } from '$lib/features/message_document/messageDocumentDto';

export const load = (async ({ locals, params }) => {
  const refreshAssistantDocumentForm = await superValidate(zod(refreshAssistantDocumentSchema));
  const userFeedbackForm = await superValidate(zod(userFeedbackV2Schema));

  const threadId = params.id;
  const thread = await findQAndAThreadById(prisma, locals.userId, threadId);

  const createMessageForm = await superValidate(zod(createMessageSchema), {
    defaults: {
      contents: '',
      threadId: threadId,
      modelType: 'GPT_35_TURBO', // なんでもいい
    },
  });

  const pageTitle = `Q&A：${thread.title}`;
  return {
    pageTitle: pageTitle,
    thread: thread,
    createMessageForm: createMessageForm,
    refreshAssistantDocumentForm: refreshAssistantDocumentForm,
    userFeedbackForm: userFeedbackForm,
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  createMessage: async ({ locals, request }) => {
    const form = await superValidate(request, zod(createMessageSchema));
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

    const newMessageInput = newUserMessageCreateInput({
      userId: locals.userId,
      threadId: form.data.threadId,
      contents: form.data.contents,
    });

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const message = await tx.message.create({
        data: newMessageInput,
      });

      const messageDocuments = FileProcessingService.createMessageDocumentInputs(
        fileProcessingResults,
        message.id
      ).map((input) => newMessageDocumentCreateInput(input));

      if (messageDocuments.length > 0) {
        await tx.messageDocument.createMany({
          data: messageDocuments,
        });
      }
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

  saveUserFeedback: async ({ request, locals }) => {
    const form = await superValidate(request, zod(userFeedbackV2Schema));
    if (!form.valid) {
      return fail(400, { userFeedbackV2Schema });
    }

    const result = await fetch(`${env.API_ENDPOINT}/v1/save_user_feedback`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.API_AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: locals.userId,
        assistant_id: form.data.assistantId,
        question: form.data.question,
        answer: form.data.answer,
        source: form.data.source,
        source_page: form.data.sourcePage != null ? String(form.data.sourcePage) : null,
      }),
    });
    if (result.status !== 200) {
      return error(500, 'Failed to create user feedback');
    }

    return message(form, 'success');
  },
};

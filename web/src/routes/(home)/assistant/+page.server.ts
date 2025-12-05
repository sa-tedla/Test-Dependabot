import type { PageServerLoad } from './$types';
import { prisma } from '$lib/prisma';
import { type Actions, fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { createThreadSchema } from '$lib/schema';
import { newMessageDocumentCreateInput, newThreadCreateInput } from '$lib/dtos';
import { newUserMessageCreateInput } from '$lib/dtos';
import { findConversationAssistants } from '$lib/features/assistant/repositories/assistantQuery';
import { newEmptyAssistantInput } from '$lib/features/assistant/assistantDto';
import { env } from '$env/dynamic/private';
import {
  uploadMessageDocumentResponse,
  parseMessageDocumentResponse,
  FileProcessingSuccess,
  FileProcessingFailure,
  type FileProcessingResult,
} from '$lib/features/message_document/messageDocumentDto';

export const load = (async ({ locals }) => {
  const form = await superValidate(zod(createThreadSchema));
  const assistants = await findConversationAssistants(prisma, locals.userId);
  return {
    form: form,
    assistants: assistants,
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  default: async ({ locals, request }) => {
    const form = await superValidate(request, zod(createThreadSchema));
    if (!form.valid) {
      form.data.file = undefined; // 返却時のエラー回避（"Cannot stringify arbitrary non-POJOs"）
      return fail(400, { form });
    }

    const fileProcessingResult: FileProcessingResult = await (async () => {
      const file = form.data.file;
      if (file === undefined) {
        return new FileProcessingSuccess(undefined);
      }
      const formData = new FormData();
      formData.append('uploadFile', file);

      const options = {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.API_AUTH_TOKEN}`,
        },
        body: formData,
      };

      const uploadRes = await fetch(`${env.API_ENDPOINT}/v1/upload_message_document`, options);
      if (uploadRes.status !== 200) {
        return new FileProcessingFailure(uploadRes.status);
      }
      const uploadResJson = await uploadRes.json();
      const uploadResResult = uploadMessageDocumentResponse.safeParse(uploadResJson);
      if (!uploadResResult.success) {
        return new FileProcessingFailure(500);
      }

      const parseRes = await fetch(`${env.API_ENDPOINT}/v1/parse_message_document`, options);
      if (parseRes.status !== 200) {
        return new FileProcessingFailure(parseRes.status);
      }
      const parseResJson = await parseRes.json();
      const parseResResult = parseMessageDocumentResponse.safeParse(parseResJson);
      if (!parseResResult.success) {
        return new FileProcessingFailure(500);
      }

      return new FileProcessingSuccess({
        ...uploadResResult.data,
        ...parseResResult.data,
      });
    })();
    if (fileProcessingResult instanceof FileProcessingFailure) {
      const status =
        400 <= fileProcessingResult.status && fileProcessingResult.status <= 599
          ? fileProcessingResult.status
          : 500;
      form.data.file = undefined; // 返却時のエラー回避（"Cannot stringify arbitrary non-POJOs"）
      return fail(status, { form });
    }

    // アシスタントを選択されていない場合、EMPTYアシスタントを作る
    let assistantId = form.data.assistantId;
    if (!assistantId) {
      const assistant = newEmptyAssistantInput(locals.userId);
      await prisma.assistant.create({
        data: assistant,
      });
      assistantId = assistant.id;
    }

    const thread = newThreadCreateInput({
      userId: locals.userId,
      assistantId: assistantId!,
      contents: form.data.contents,
      modelType: form.data.modelType,
    });
    const message = newUserMessageCreateInput({
      userId: locals.userId,
      threadId: thread.id,
      contents: form.data.contents,
    });
    const messageDocument =
      fileProcessingResult.data === undefined
        ? undefined
        : newMessageDocumentCreateInput({
            messageId: message.id,
            filename: fileProcessingResult.data.filename,
            content: fileProcessingResult.data.content,
            source: fileProcessingResult.data.source,
          });
    await prisma.$transaction(async (tx) => {
      await tx.thread.create({
        data: thread,
      });
      await tx.message.create({
        data: message,
      });
      if (messageDocument !== undefined) {
        await tx.messageDocument.create({
          data: messageDocument,
        });
      }
    });

    redirect(302, `/thread/assistant/${thread.id}`);
  },
};

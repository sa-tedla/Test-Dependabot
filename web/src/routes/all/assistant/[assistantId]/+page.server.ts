import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/prisma';
import type { Prisma } from '@prisma/client';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { newThreadCreateInput } from '$lib/dtos';
import { newMessageDocumentCreateInput, newUserMessageCreateInput } from '$lib/dtos';
import { retrieveCompanyWideAssistantWorkflow } from '$lib/features/companyWide/workflows/retrieveCompanyWideAssistant';
import { toFindCompanyWideAssistant } from '$lib/features/companyWide/repositories/companyWideAssistantQuery';
import { createQAndAThreadSchemaForAll } from '$lib/features/all/schema';
import { FileProcessingService } from '$lib/features/message_document/services/fileProcessingService';
import { type FileProcessingResult } from '$lib/features/message_document/messageDocumentDto';

export const load = (async ({ params }) => {
  const createThreadForm = await superValidate(zod(createQAndAThreadSchemaForAll));

  const event = await retrieveCompanyWideAssistantWorkflow(toFindCompanyWideAssistant(prisma), {
    assistantId: params.assistantId,
  });

  return {
    form: createThreadForm,
    assistant: event.companyWiddeAssistant,
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const form = await superValidate(request, zod(createQAndAThreadSchemaForAll));
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
    return redirect(302, `/all/assistant/${form.data.assistantId}/thread/${thread.id}`);
  },
};

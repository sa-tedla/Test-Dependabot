import { prisma } from '$lib/prisma';
import type { Prisma } from '@prisma/client';
import { type Actions, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { newUserMessageCreateInput, newMessageDocumentCreateInput } from '$lib/dtos';
import { retrieveCompanyWideThreadWorkflow } from '$lib/features/companyWide/workflows/retrieveCompanyWideThread';
import { toFindCompanyWideThread } from '$lib/features/companyWide/repositories/companyWideThreadQuery';
import { createMessageSchemaForAll } from '$lib/features/all/schema';

import { FileProcessingService } from '$lib/features/message_document/services/fileProcessingService';
import { type FileProcessingResult } from '$lib/features/message_document/messageDocumentDto';

export const load = (async ({ params, locals }) => {
  const form = await superValidate(zod(createMessageSchemaForAll));
  const event = await retrieveCompanyWideThreadWorkflow(toFindCompanyWideThread(prisma), {
    userId: locals.userId,
    threadId: params.threadId,
  });
  return {
    form: form,
    companyWideThread: event.companyWideThread,
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  default: async ({ locals, request }) => {
    const form = await superValidate(request, zod(createMessageSchemaForAll));
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
};

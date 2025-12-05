import type { RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import {
  runSearchAssistantRequest,
  runSearchAssistantResponse,
} from '$lib/features/search/searchDto';
import { newSearchAssistantMessageInput } from '$lib/features/search/searchDto';
import { prisma } from '$lib/prisma';
import { newMessageReferenceCreateInput } from '$lib/dtos';

export const POST: RequestHandler = async ({ request, locals }) => {
  const reqJson = await request.json();
  const reqResult = runSearchAssistantRequest.safeParse(reqJson);
  if (!reqResult.success) {
    throw new Error(`Invalid request data: ${reqResult.error.toString()}`);
  }

  const body = {
    threadId: reqResult.data.threadId,
  };

  const res = await fetch(`${env.API_ENDPOINT}/v1/run_search_assistant`, {
    headers: {
      Authorization: `Bearer ${env.API_AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error('Response is Failed');
  }
  const resJson = await res.json();
  const resResult = runSearchAssistantResponse.safeParse(resJson);
  if (!resResult.success) {
    throw new Error(`Invalid request data: ${resResult.error.toString()}`);
  }

  const messageInput = newSearchAssistantMessageInput({
    userId: locals.userId,
    threadId: reqResult.data.threadId,
  });
  const referencesInput = resResult.data.data.map((r) => {
    return newMessageReferenceCreateInput({
      messageId: messageInput.id,
      source: r.source,
      name: r.name,
      contents: r.contents,
    });
  });
  await prisma.$transaction(async (tx) => {
    await tx.message.create({
      data: messageInput,
    });
    await tx.messageReference.createMany({
      data: referencesInput,
    });
  });

  return json(resResult.data);
};

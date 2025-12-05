import type { RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { CustomStream } from '$lib/stream/custom_stream';
import { StreamingTextResponse } from 'ai';
import { splitToJsons } from '$lib/utils/splitToJsons';
import { prisma } from '$lib/prisma';
import { newAssistantMessageCreateInput, newMessageReferenceCreateInput } from '$lib/dtos';
import { runQAndAAssistantRequest } from '$lib/features/q_and_a/qAndADtos';
import type {
  StreamingMessage,
  StreamingMessageReference,
} from '$lib/features/assistant/entities/StreamingMessage';

export const POST: RequestHandler = async ({ request, locals }) => {
  const reqJson = await request.json();
  const reqResult = runQAndAAssistantRequest.safeParse(reqJson);
  if (!reqResult.success) {
    throw new Error(`Invalid request data: ${reqResult.error.toString()}`);
  }

  const body = {
    threadId: reqResult.data.threadId,
  };
  const streamResponse = await fetch(`${env.API_ENDPOINT}/v1/run_q_and_a_assistant`, {
    headers: {
      Authorization: `Bearer ${env.API_AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!streamResponse.ok) {
    throw new Error('Response is Failed');
  }

  let newHyperMeter = '';
  let contents = '';
  let references: StreamingMessageReference[] = [];
  const stream = CustomStream(streamResponse, {
    onToken: async (token) => {
      const [responses, hypermeter]: [StreamingMessage[], string] = splitToJsons(
        newHyperMeter + token
      );
      newHyperMeter = hypermeter;
      for (const res of responses) {
        if (res.message && res.message.content) {
          contents += res.message.content;
        }
        if (res.message && res.message.references) {
          references = res.message.references;
        }
      }
    },
    onFinal: async () => {
      const messageInput = newAssistantMessageCreateInput({
        id: reqResult.data.messageId,
        userId: locals.userId,
        threadId: reqResult.data.threadId,
        contents: contents,
      });
      const referencesInput = references.map((r) => {
        return newMessageReferenceCreateInput({
          messageId: messageInput.id,
          source: r.source,
          name: r.name,
          contents: r.content,
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
    },
  });

  return new StreamingTextResponse(stream);
};

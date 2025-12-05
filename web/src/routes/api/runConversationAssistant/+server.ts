import type { RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { CustomStream } from '$lib/stream/custom_stream';
import { StreamingTextResponse } from 'ai';
import { splitToJsons } from '$lib/utils/splitToJsons';
import { prisma } from '$lib/prisma';
import { newAssistantMessageCreateInput } from '$lib/dtos';
import { runConversationAssistantRequest } from '$lib/features/assistant/assistantDto';
import type { StreamingMessage } from '$lib/features/assistant/entities/StreamingMessage';

export const POST: RequestHandler = async ({ request, locals }) => {
  const reqJson = await request.json();
  const reqResult = runConversationAssistantRequest.safeParse(reqJson);
  if (!reqResult.success) {
    throw new Error(`Invalid request data: ${reqResult.error.toString()}`);
  }

  const body = {
    threadId: reqResult.data.threadId,
  };
  const streamResponse = await fetch(`${env.API_ENDPOINT}/v1/run_conversation_assistant`, {
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
  let assistantMessage = '';
  const stream = CustomStream(streamResponse, {
    onToken: async (token) => {
      const [responses, hypermeter]: [StreamingMessage[], string] = splitToJsons(
        newHyperMeter + token
      );
      newHyperMeter = hypermeter;
      assistantMessage += responses.map((r) => r.message?.content).join('\n');
    },
    onFinal: async () => {
      const input = newAssistantMessageCreateInput({
        userId: locals.userId,
        threadId: reqResult.data.threadId,
        contents: assistantMessage,
      });
      await prisma.message.create({
        data: input,
      });
    },
  });
  return new StreamingTextResponse(stream);
};

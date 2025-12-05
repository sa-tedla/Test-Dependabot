import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { generateUniqueID } from '$lib/utils/generateUniqueID';

export const runSearchAssistantRequest = z.object({
  threadId: z.string(),
});

export const runSearchAssistantResponse = z.object({
  data: z.array(
    z.object({
      name: z.string(),
      contents: z.string(),
      source: z.string(),
    })
  ),
});

export function newSearchAssistantMessageInput(args: {
  userId: string;
  threadId: string;
}): Prisma.MessageUncheckedCreateInput {
  return {
    id: generateUniqueID(),
    userId: args.userId,
    role: 'ASSISTANT',
    contents: '該当する該当のファイルが見つかりました。以下に検索結果を表示します。',
    threadId: args.threadId,
  };
}

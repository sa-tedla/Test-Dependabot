import { z } from 'zod';

export const runQAndAAssistantRequest = z.object({
  messageId: z.string(),
  threadId: z.string(),
});

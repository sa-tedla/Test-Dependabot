import { z } from 'zod';

export const upsertMessageFeedbackRequest = z.object({
  messageId: z.string(),
  feedback: z.enum(['GOOD', 'BAD']),
});

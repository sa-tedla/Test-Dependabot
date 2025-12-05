import { z } from 'zod';

export const createSearchThreadSchema = z.object({
  contents: z
    .string()
    .trim()
    .min(1, 'メッセージは1文字以上入力してください')
    .max(20000, 'メッセージは20000文字以下で入力してください'),
  assistantId: z.string(),
  modelType: z.enum(['GPT_35_TURBO', 'GPT_4', 'GPT_4_TURBO_PREVIEW', 'GPT_4O']),
});

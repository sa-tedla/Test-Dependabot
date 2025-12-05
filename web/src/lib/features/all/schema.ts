import { z } from 'zod';
import {
  ACCEPTED_FILENAME_EXTENSION_FOR_ALL,
  MAX_FILE_SIZE_IN_BYTES,
  MAX_FILE_COUNT,
  MAX_FILENAME_LENGTH,
  getSizeInMB,
} from '$lib/features/message_document/consts/fileRestrictions';

// 共通のメッセージフィールド
const commonMessageFields = {
  contents: z
    .string()
    .trim()
    .min(1, 'メッセージは1文字以上入力してください')
    .max(400, 'メッセージは400文字以下で入力してください'),
  modelType: z.enum(['GPT_35_TURBO', 'GPT_4', 'GPT_4_TURBO_PREVIEW', 'GPT_4O']),
  files: z
    .array(z.instanceof(File))
    .max(MAX_FILE_COUNT, `添付可能なファイル数は${MAX_FILE_COUNT}つまでです`)
    .optional()
    .refine(
      (files) => {
        if (!files) return true;
        return files.every((file) => file.size <= MAX_FILE_SIZE_IN_BYTES);
      },
      {
        message: `ファイルサイズの上限は${getSizeInMB(MAX_FILE_SIZE_IN_BYTES)}MBです`,
      }
    )
    .refine(
      (files) => {
        if (!files) return true;
        return files.every((file) => file.name.length <= MAX_FILENAME_LENGTH);
      },
      {
        message: `ファイル名は${MAX_FILENAME_LENGTH}文字以内で入力してください`,
      }
    )
    .refine(
      (files) => {
        if (!files) return true;
        return files.every((file) => {
          const name = file.name ?? '';
          const idx = name.lastIndexOf('.');
          const ext = idx >= 0 ? name.slice(idx).toLowerCase() : '';
          return ACCEPTED_FILENAME_EXTENSION_FOR_ALL.map((e) => e.toLowerCase()).includes(ext);
        });
      },
      {
        message: `${ACCEPTED_FILENAME_EXTENSION_FOR_ALL.join(',')}のみ可能です`,
      }
    ),
};

export const createQAndAThreadSchemaForAll = z.object({
  ...commonMessageFields,
  assistantId: z.string(),
});
export type CreateQAndAThreadForAllSchema = z.infer<typeof createQAndAThreadSchemaForAll>;

export const createMessageSchemaForAll = z.object({
  ...commonMessageFields,
  threadId: z.string(),
});

export const deleteThreadSchema = z.object({
  threadId: z.string(),
});

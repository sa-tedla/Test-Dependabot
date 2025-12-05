import { z } from 'zod';
import {
  ACCEPTED_FILENAME_EXTENSION,
  ACCEPTED_FILENAME_EXTENSION_FOR_ALL,
  MAX_FILE_SIZE_IN_BYTES,
  MAX_FILE_COUNT,
  MAX_FILENAME_LENGTH,
  getSizeInMB,
} from '$lib/features/message_document/consts/fileRestrictions';

export const developerLoginSchema = z.object({
  accountID: z.string().min(1),
});

export const createThreadSchema = z.object({
  contents: z
    .string()
    .min(1, 'メッセージは1文字以上入力してください')
    .max(20000, 'メッセージは20000文字以下で入力してください'),
  assistantId: z.string().optional(),
  modelType: z.enum(['GPT_35_TURBO', 'GPT_4', 'GPT_4_TURBO_PREVIEW', 'GPT_4O']),
  // 参考：
  // https://superforms.rocks/concepts/files
  // https://zenn.dev/kaz_z/articles/zod-image-file
  file: z
    .instanceof(File, { message: 'ファイルをアップロードしてください' })
    .optional()
    .refine((file) => file === undefined || file.size <= MAX_FILE_SIZE_IN_BYTES, {
      message: `ファイルサイズの上限は${getSizeInMB(MAX_FILE_SIZE_IN_BYTES)}MBです`,
    })
    .refine(
      (file) =>
        file === undefined ||
        ACCEPTED_FILENAME_EXTENSION.includes('.' + file.name.split('.').pop()),
      {
        message: `${ACCEPTED_FILENAME_EXTENSION.join(',')}のみ可能です`,
      }
    ),
});

export const createMessageSchema = z.object({
  contents: z
    .string()
    .trim()
    .min(1, 'メッセージは1文字以上入力してください')
    .max(400, 'メッセージは400文字以下で入力してください'),
  threadId: z.string(),
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
});

export const createAssistantSchema = z.object({
  name: z
    .string()
    .min(1, '名前は1文字以上入力してください')
    .max(20, '名前は20文字以内で入力してください'),
  icon: z.string().min(1, 'アイコンは1文字以上入力してください').default('🤖'),
  description: z
    .string()
    .min(1, '説明は1文字以上入力してください')
    .max(100, '説明は100文字以内で入力してください'),
  systemPrompt: z
    .string()
    .min(1, 'プロンプトは1文字以上入力してください')
    .max(1000, 'プロンプトは100文字以内で入力してください'),
  groupIds: z.string().array(),
});
export type CreateAssistantSchema = z.infer<typeof createAssistantSchema>;

export const updateAssistantSchema = createAssistantSchema.extend({
  assistantId: z.string(),
});

export const deleteAssistantSchema = z.object({
  assistantId: z.string(),
});

export const refreshAssistantDocumentSchema = z.object({
  assistantId: z.string(),
});

export const updateSearchAssistantSchema = z.object({
  assistantId: z.string(),
  indexId: z.string(),
  name: z
    .string()
    .min(1, '名前は1文字以上入力してください')
    .max(20, '名前は20文字以内で入力してください'),
  icon: z.string().min(1, 'アイコンは1文字以上入力してください'),
  description: z
    .string()
    .min(1, '説明は1文字以上入力してください')
    .max(100, '説明は100文字以内で入力してください'),
  sources: z
    .array(
      z
        .string()
        .startsWith('https://oriconsul.app.box.com/', 'BoxのURLを入力してください')
        .refine(
          (url) => {
            const pattern = /^https:\/\/oriconsul\.app\.box\.com\/folder\/(\d+)(\?.*)?$/;
            return pattern.test(url);
          },
          {
            message: 'BoxのディレクトリのURLを入力してください',
          }
        )
    )
    .min(1, '1つ以上入力してください'),
  groupIds: z.string().array(),
});

export const userFeedbackV2Schema = z.object({
  assistantId: z.string(),
  question: z.string().trim().min(1, '質問は必須です').max(1000, '1,000文字以内で入力してください'),
  answer: z.string().max(7000, '7,000文字以内で入力してください').optional().default(''),
  source: z
    .string()
    .trim()
    .min(1, '回答の情報元・ソースは必須です')
    .max(2048, '2,048文字以内で入力してください')
    .refine((url: string) => {
      const pattern = /^https:\/\/oriconsul\.app\.box\.com\/file\/(\d+)$/;
      return pattern.test(url);
    }, 'boxのファイルのURLを入力してください')
    .refine((url) => !url.includes('/folder/'), {
      message: 'フォルダURLは入力できません',
    })
    .refine((url: string) => !url.includes('?'), '?などの不要な文字を削除してください'),
  sourcePage: z.coerce
    .number()
    .int('整数を入力してください')
    .min(1, '1以上の値を入力してください')
    .max(1000, '1,000以下の値を入力してください')
    .optional()
    .nullable(),
});

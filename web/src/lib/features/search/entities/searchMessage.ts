import type { Message, MessageReference } from '$lib/entities';
import { generateUniqueID } from '$lib/utils/generateUniqueID';

export type SearchMessage = Message & {
  references: MessageReference[];
};

export function newSearchMessage(references: MessageReference[]): SearchMessage {
  return {
    id: generateUniqueID(),
    userId: 'dummy',
    role: 'ASSISTANT',
    contents: '該当する該当のファイルが見つかりました。以下に検索結果を表示します。',
    threadId: 'dummy',
    createdAt: new Date(),
    updatedAt: new Date(),
    references: references,
  };
}

import type { Message } from '$lib/entities';
import { generateUniqueID } from '$lib/utils/generateUniqueID';

export function newEmptyAssistantMessage(): Message {
  return {
    id: generateUniqueID(),
    userId: 'dummy',
    role: 'ASSISTANT',
    contents: '',
    threadId: 'dummy',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

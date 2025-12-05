import type { Message, MessageReference, MessageDocument } from '$lib/entities';
import { generateUniqueID } from '$lib/utils/generateUniqueID';

export type QAndAMessage = Message & {
  documents: MessageDocument[];
  references: MessageReference[];
  feedback: 'GOOD' | 'BAD' | undefined;
};

export function newEmptyQAndAMessage(): QAndAMessage {
  return {
    id: generateUniqueID(),
    userId: 'dummy',
    role: 'ASSISTANT',
    contents: '',
    threadId: 'dummy',
    documents: [],
    references: [],
    feedback: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

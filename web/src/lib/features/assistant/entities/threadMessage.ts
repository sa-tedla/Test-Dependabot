import type { Message, MessageDocument, MessageReference } from '$lib/entities';
import type { FEEDBACK } from '@prisma/client';

export type ThreadMessage = {
  message: Message;
  references: MessageReference[];
  documents: MessageDocument[];
  feedback: FEEDBACK | undefined;
};

export function buildThreadMessageFromModels(
  message: Message,
  documents: MessageDocument[],
  references: MessageReference[],
  feedback: FEEDBACK | undefined
): ThreadMessage {
  return {
    message,
    documents,
    references,
    feedback,
  };
}

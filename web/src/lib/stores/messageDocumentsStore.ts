import { writable, type Writable } from 'svelte/store';
import type { MessageDocument, Message } from '../entities';

export const messageDocumentsStore: Writable<MessageDocument[]> = writable([]);

type MessageWithMessageDocuments = Message & {
  messageDocuments: MessageDocument[];
};

export const setMessageDocumentsToMessageDocumentsStoreFromMessages = (
  messages: MessageWithMessageDocuments[]
) => {
  const messageDocuments = messages.map((m) => m.messageDocuments);
  messageDocumentsStore.set(messageDocuments.flat());
};

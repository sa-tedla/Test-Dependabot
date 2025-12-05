import { writable, type Writable } from 'svelte/store';
import type { Message } from '../entities';

export const messagesStore: Writable<Message[]> = writable([]);

export const setMessagesToMessagesStore = (messages: Message[]) => {
  messagesStore.set(messages);
};

export const addMessageToMessagesStore = (message: Message) => {
  messagesStore.update((m) => [...m, message]);
};

export const replaceMessageToMessagesStore = (message: Message) => {
  messagesStore.update((m) => {
    m.pop();
    return [...m, message];
  });
};

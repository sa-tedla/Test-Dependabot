import { writable, type Writable } from 'svelte/store';
import type { QAndAMessage } from '$lib/features/q_and_a/entities/qAndAMessage';

export const qAndAMessagesStore: Writable<QAndAMessage[]> = writable([]);

export const resetQAndAMessagesStore = () => {
  qAndAMessagesStore.set([]);
};

export const setQAndAMessagesToStore = (messages: QAndAMessage[]) => {
  qAndAMessagesStore.set(messages);
};

export const addQAndAMessageToStore = (message: QAndAMessage) => {
  qAndAMessagesStore.update((m) => [...m, message]);
};

export const replaceLastQAndAMessageInStore = (message: QAndAMessage) => {
  qAndAMessagesStore.update((m) => {
    m.pop();
    return [...m, message];
  });
};

import { writable, type Writable } from 'svelte/store';
import type { SearchMessage } from '$lib/features/search/entities/searchMessage';

export const searchAssistantMessageStore: Writable<SearchMessage | undefined> = writable(undefined);

export const resetSearchMessageStore = () => {
  searchAssistantMessageStore.set(undefined);
};

export const setSearchMessageStore = (message: SearchMessage) => {
  if (message.role !== 'ASSISTANT') {
    throw new Error('Only assistant message can be added to searchMessagesStore');
  }
  searchAssistantMessageStore.set(message);
};

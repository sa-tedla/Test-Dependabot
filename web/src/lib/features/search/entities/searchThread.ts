import type { Thread } from '$lib/entities';
import type { SearchAssistant } from '$lib/features/search/entities/searchAssistant';
import type { SearchMessage } from '$lib/features/search/entities/searchMessage';

export type SearchThread = Thread & {
  messages: SearchMessage[];
  assistant: SearchAssistant;
};

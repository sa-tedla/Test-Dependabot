import { runSearchAssistantResponse } from '$lib/features/search/searchDto';
import { setSearchMessageStore } from '$lib/stores/searchAssistantMessageStore';
import { get } from 'svelte/store';
import { newSearchMessage } from '$lib/features/search/entities/searchMessage';
import { newMessageReference } from '$lib/entities';
import { page } from '$app/stores';
import { searchAssistantRunningStatusMapStore } from '$lib/stores/assistantRunningStatusMapStore';

export function useRunSearchAssistant() {
  const runSearchAssistant = async (threadId: string) => {
    const pathnameOnRequest = get(page).url.pathname;
    searchAssistantRunningStatusMapStore.setStatus(threadId, {
      progress: 'リクエストを送信中です...',
      progressing: true,
      error: undefined,
    });

    const res = await fetch('/api/runSearchAssistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        threadId: threadId,
      }),
    });
    if (!res.ok) {
      searchAssistantRunningStatusMapStore.updateStatus(threadId, {
        progress: undefined,
        progressing: false,
      });
      throw new Error(`Server responded with status: ${res.status}`);
    }

    const resJson = await res.json();
    const result = runSearchAssistantResponse.safeParse(resJson);
    if (!result.success) {
      searchAssistantRunningStatusMapStore.updateStatus(threadId, {
        progress: undefined,
        progressing: false,
      });
      throw new Error(`Invalid request data: ${result.error.toString()}`);
    }

    const messageReferences = result.data.data.map((reference) =>
      newMessageReference({
        source: reference.source,
        name: reference.name,
        contents: reference.contents,
      })
    );
    const searchMessage = newSearchMessage(messageReferences);

    if (get(page).url.pathname === pathnameOnRequest) {
      setSearchMessageStore(searchMessage);
    }
    searchAssistantRunningStatusMapStore.updateStatus(threadId, {
      progress: undefined,
      progressing: false,
    });
  };

  return {
    runSearchAssistant,
  };
}

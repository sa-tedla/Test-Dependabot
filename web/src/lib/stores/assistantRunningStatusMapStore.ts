import { writable, type Writable } from 'svelte/store';
import type {
  ThreadId,
  AssistantRunningStatus,
  AssistantRunningStatusMap,
} from '$lib/entities/assistantRunningStatus';

const createAssistantRunningStatusMapStore = () => {
  const { subscribe, update }: Writable<AssistantRunningStatusMap> = writable(new Map());
  return {
    subscribe,
    setStatus: (threadId: ThreadId, status: AssistantRunningStatus) => {
      update((map) => map.set(threadId, status));
    },
    updateStatus: (threadId: ThreadId, newProperties: Partial<AssistantRunningStatus>) => {
      update((map) => {
        const status = map.get(threadId);
        if (status === undefined) {
          throw new Error('Invalid threadId');
        } else {
          map.set(threadId, { ...status, ...newProperties });
        }
        return map;
      });
    },
  };
};

export const conversationAssistantRunningStatusMapStore = createAssistantRunningStatusMapStore();
export const searchAssistantRunningStatusMapStore = createAssistantRunningStatusMapStore();
export const qAndAAssistantRunningStatusMapStore = createAssistantRunningStatusMapStore();

import type { Assistant, Thread } from '$lib/entities';
import type { ThreadMessage } from '$lib/features/assistant/entities/threadMessage';

export type CompanyWideThread = {
  thread: Thread;
  assistant: Assistant;
  messages: ThreadMessage[];
};

export function buildCompanyWideThread(
  thread: Thread,
  assistant: Assistant,
  messages: ThreadMessage[]
): CompanyWideThread {
  return {
    thread,
    assistant,
    messages,
  };
}

import type { Assistant, Thread } from '$lib/entities';

export type CompanyWideThreadList = CompanyWideThreadListItem[];

export function buildCompanyWideThreadList(
  items: CompanyWideThreadListItem[]
): CompanyWideThreadList {
  return items;
}

export type CompanyWideThreadListItem = {
  thread: Thread;
  assistant: Assistant;
  lastEditedAt: Date;
};

export function buildCompanyWideThreadListItem(
  thread: Thread,
  assistant: Assistant,
  lastEditedAt: Date
): CompanyWideThreadListItem {
  return {
    thread,
    assistant,
    lastEditedAt,
  };
}

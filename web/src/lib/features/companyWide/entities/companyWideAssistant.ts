import type { Assistant, Index, IndexSource } from '$lib/entities';

export type CompanyWideAssistant = Assistant & {
  index: Index;
  indexSources: IndexSource[];
};

export const buildCompanyWideAssistant = (
  assistant: Assistant,
  index: Index,
  indexSources: IndexSource[]
): CompanyWideAssistant => {
  return {
    ...assistant,
    index,
    indexSources,
  };
};

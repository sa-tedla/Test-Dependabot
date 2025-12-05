import type {
  Index as IndexModel,
  IndexSource as IndexSourceModel,
  Assistant,
  Group,
} from '$lib/entities';

export type SearchAssistant = Assistant & {
  index: IndexModel;
  indexSources: IndexSourceModel[];
  groups: Group[];
};

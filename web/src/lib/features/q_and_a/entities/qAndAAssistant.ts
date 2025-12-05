import type { UserFeedback, Assistant, User, Index, IndexSource, Group } from '$lib/entities';

export type QAndAAssistantUserFeedback = UserFeedback & {
  user: User;
};

export type QAndAAssistant = Assistant & {
  systemPrompt: string;
  index: Index;
  indexSources: IndexSource[];
  userFeedbacks: QAndAAssistantUserFeedback[];
  groups: Group[];
};

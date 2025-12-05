export type ThreadId = string;

export type AssistantRunningStatus = {
  progress: string | undefined;
  progressing: boolean;
  error: string | undefined;
};

export type AssistantRunningStatusMap = Map<ThreadId, AssistantRunningStatus>;

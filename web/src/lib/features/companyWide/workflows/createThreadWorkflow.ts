import type { Message, ModelType, Thread } from '$lib/entities';
import { newThread } from '$lib/features/assistant/entities/thread';
import { newUserMessage } from '$lib/features/assistant/entities/message';

// #####################################
// # DTO
// #####################################
export type CreateThreadCommand = {
  threadId: string;
  userId: string;
  assistantId: string;
  modelType: ModelType;
  contents: string;
};
export type CreatedThreadEvent = {
  thread: Thread;
  message: Message;
};

// #####################################
// # Types
// #####################################
export type SaveThread = (thread: Thread) => Promise<Thread>;
export type SaveMessage = (message: Message) => Promise<Message>;

// #####################################
// # Workflow
// #####################################
export const createThreadWorkflow = async (
  saveThread: SaveThread,
  saveMessage: SaveMessage,
  command: CreateThreadCommand
): Promise<CreatedThreadEvent> => {
  const thread = newThread({
    userId: command.userId,
    assistantId: command.assistantId,
    modelType: command.modelType,
    contents: command.contents,
  });
  const message = newUserMessage({
    userId: command.userId,
    threadId: thread.id,
    contents: command.contents,
  });

  await saveThread(thread);
  await saveMessage(message);

  return {
    thread,
    message,
  };
};

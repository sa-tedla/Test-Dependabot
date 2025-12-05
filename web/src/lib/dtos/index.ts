import type { ModelType, Prisma } from '@prisma/client';
import { generateUniqueID } from '$lib/utils/generateUniqueID';

export function newThreadCreateInput(args: {
  userId: string;
  assistantId: string;
  modelType: ModelType;
  contents: string;
}): Prisma.ThreadUncheckedCreateInput {
  return {
    id: generateUniqueID(),
    userId: args.userId,
    assistantId: args.assistantId,
    title: args.contents.slice(0, 100),
    modelType: args.modelType,
  };
}

export function newAssistantMessageCreateInput(args: {
  id?: string;
  userId: string;
  threadId: string;
  contents: string;
}): Prisma.MessageUncheckedCreateInput {
  return {
    id: args.id ?? generateUniqueID(),
    userId: args.userId,
    role: 'ASSISTANT',
    contents: args.contents,
    threadId: args.threadId,
  };
}

export function newUserMessageCreateInput(args: {
  userId: string;
  threadId: string;
  contents: string;
}): Prisma.MessageUncheckedCreateInput {
  return {
    id: generateUniqueID(),
    userId: args.userId,
    role: 'USER',
    contents: args.contents,
    threadId: args.threadId,
  };
}

export function newMessageReferenceCreateInput(args: {
  messageId: string;
  name: string;
  contents: string;
  source: string;
}): Prisma.MessageReferenceUncheckedCreateInput {
  return {
    id: generateUniqueID(),
    messageId: args.messageId,
    name: args.name,
    contents: args.contents,
    source: args.source,
    sourcePage: '',
  };
}

export function newMessageDocumentCreateInput(args: {
  messageId: string;
  blobName: string;
  filename: string;
  content: string;
  source: string;
}): Prisma.MessageDocumentUncheckedCreateInput {
  return {
    messageId: args.messageId,
    blobName: args.blobName,
    filename: args.filename,
    content: args.content,
    source: args.source,
  };
}

import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { generateUniqueID } from '$lib/utils/generateUniqueID';
import type { CreateAssistantSchema } from '$lib/schema';

export const runConversationAssistantRequest = z.object({
  threadId: z.string(),
});

export function newEmptyAssistantInput(userId: string): Prisma.AssistantUncheckedCreateInput {
  return {
    id: generateUniqueID(),
    name: 'Empty Assistant',
    description: 'Emtpry Assistant',
    icon: 'robot',
    assistantStatus: 'READY',
    assistantType: 'EMPTY',
    creatorId: userId,
  };
}

export type CreateConversationAssistantInput = {
  assistant: Prisma.AssistantUncheckedCreateInput;
  conversation: Prisma.ConversationAssistantUncheckedCreateInput;
};

export function newConversationAssistantCreateInput(
  userId: string,
  data: CreateAssistantSchema
): CreateConversationAssistantInput {
  const id = generateUniqueID();
  return {
    assistant: {
      id: id,
      name: data.name,
      description: data.description,
      icon: data.icon,
      assistantStatus: 'READY',
      assistantType: 'CONVERSATION',
      creatorId: userId,
    },
    conversation: {
      assistantId: id,
      systemPrompt: data.systemPrompt,
    },
  };
}

export type UpdateConversationAssistantInput = {
  assistant: Prisma.AssistantUncheckedUpdateInput;
  conversation: Prisma.ConversationAssistantUncheckedUpdateInput;
};

export function newConversationAssistantUpdateInput(
  userId: string,
  data: CreateAssistantSchema
): UpdateConversationAssistantInput {
  return {
    assistant: {
      name: data.name,
      description: data.description,
      icon: data.icon,
      assistantStatus: 'READY',
      assistantType: 'CONVERSATION',
      creatorId: userId,
    },
    conversation: {
      systemPrompt: data.systemPrompt,
    },
  };
}

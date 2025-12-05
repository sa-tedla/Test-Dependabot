import type { Thread } from '$lib/entities';
import { generateUniqueID } from '$lib/utils/generateUniqueID';
import type { ModelType } from '@prisma/client';

export const newThread = (args: {
  userId: string;
  assistantId: string;
  modelType: ModelType;
  contents: string;
}): Thread => {
  return {
    id: generateUniqueID(),
    userId: args.userId,
    assistantId: args.assistantId,
    title: args.contents.slice(0, 100),
    modelType: args.modelType,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

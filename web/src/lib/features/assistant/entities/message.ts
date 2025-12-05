import type { Message } from '$lib/entities';
import { generateUniqueID } from '$lib/utils/generateUniqueID';

export const newUserMessage = (args: {
  userId: string;
  threadId: string;
  contents: string;
}): Message => {
  return {
    id: generateUniqueID(),
    threadId: args.threadId,
    userId: args.userId,
    role: 'USER',
    contents: args.contents,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

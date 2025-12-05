import type {
  Thread as ThreadModel,
  Group as GroupModel,
  User as UserModel,
  Assistant as AssistantModel,
  Message as MessageModel,
  MessageReference as MessageReferenceModel,
  Index as IndexModel,
  IndexSource as IndexSourceModel,
  UserFeedback as UserFeedbackModel,
  ModelType as ModelTypeModel,
  MessageDocument as MessageDocumentModel,
} from '@prisma/client';
import { generateUniqueID } from '$lib/utils/generateUniqueID';

export type User = UserModel;
export type Group = GroupModel;
export type Thread = ThreadModel;
export type Assistant = AssistantModel;
export type Message = MessageModel;
export type MessageReference = MessageReferenceModel;
export type Index = IndexModel;
export type IndexSource = IndexSourceModel;
export type UserFeedback = UserFeedbackModel;
export type ModelType = ModelTypeModel;
export type MessageDocument = MessageDocumentModel;

export type ThreadForSidebar = Thread & {
  assistant?: Assistant;
};

export type DocumentModalUserFeedback = UserFeedback & {
  user: User;
};

export function newMessageReference(args: {
  name: string;
  contents: string;
  source: string;
}): MessageReference {
  return {
    id: generateUniqueID(), // Dummyでok
    messageId: generateUniqueID(), // DUmmyでok
    name: args.name,
    contents: args.contents,
    source: args.source,
    sourcePage: '1',
  };
}

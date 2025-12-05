import type { QAndAMessage } from './qAndAMessage';

export type QAndAMessagePair = {
  user: QAndAMessage | undefined;
  assistant: QAndAMessage | undefined;
};

function newEmptyQAndAMessagePair(): QAndAMessagePair {
  return {
    user: undefined,
    assistant: undefined,
  };
}

export const convertToQAndAMessagePairs = (messages: QAndAMessage[]): QAndAMessagePair[] => {
  const pairs: QAndAMessagePair[] = [];
  let currentPair = newEmptyQAndAMessagePair();
  messages.forEach((message) => {
    if (
      (message.role === 'USER' && currentPair.user !== undefined) ||
      (message.role === 'ASSISTANT' && currentPair.assistant !== undefined)
    ) {
      pairs.push(currentPair);
      currentPair = newEmptyQAndAMessagePair();
    }
    if (message.role === 'USER') {
      currentPair.user = message;
    }
    if (message.role === 'ASSISTANT') {
      currentPair.assistant = message;
    }
  });
  pairs.push(currentPair);
  return pairs;
};

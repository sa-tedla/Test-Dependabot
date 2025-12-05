import type { Thread } from '$lib/entities';
import type { QAndAMessage } from '$lib/features/q_and_a/entities/qAndAMessage';
import type { QAndAAssistant } from '$lib/features/q_and_a/entities/qAndAAssistant';

export type QAndAThread = Thread & {
  messages: QAndAMessage[];
  assistant: QAndAAssistant;
};

export type StreamingMessage = {
  progress?: string;
  message?: {
    content?: string;
    role?: 'system' | 'user' | 'assistant';
    references?: StreamingMessageReference[];
    tokenNum?: {
      prompt: number;
      completion: number;
    };
    createdAt?: Date;
  };
  error?: string;
};

export type StreamingMessageReference = {
  name: string;
  source: string;
  content: string;
};

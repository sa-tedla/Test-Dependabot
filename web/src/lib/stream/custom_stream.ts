import { AIStream } from 'ai';
import type { AIStreamParser, AIStreamCallbacksAndOptions } from 'ai';

function parseCustomStream(): AIStreamParser {
  return (data) => {
    return JSON.stringify(JSON.parse(data));
  };
}

export function CustomStream(res: Response, cb?: AIStreamCallbacksAndOptions): ReadableStream {
  return AIStream(res, parseCustomStream(), cb);
}

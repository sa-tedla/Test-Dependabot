import type { StreamingMessage } from '$lib/features/assistant/entities/StreamingMessage';

export async function parseJSONFromStream(
  stream: ReadableStream,
  callback: (json: StreamingMessage) => void
): Promise<void> {
  const reader = stream.getReader();
  let braceCount = 0;
  let buffer = '';

  const processChunk = (chunk: string) => {
    for (const char of chunk) {
      buffer += char;
      if (char === '{') {
        braceCount++;
      } else if (char === '}') {
        braceCount--;
        if (braceCount === 0) {
          const body = JSON.parse(buffer);
          callback(body); // ここでJSONごとの特定の処理を実行
          buffer = '';
        }
      }
    }
  };
  // 無限ループ代わり
  for (let i = 0; i < 1000000; i++) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    const chunk = new TextDecoder().decode(value);
    processChunk(chunk);
  }
}

// スペックの低いWindowsの場合、中途半端なJson形式となるため、字余りも返す
export function splitToJsons(jsonStr: string): [object[], string] {
  const results: object[] = [];

  let targetStr = '';
  for (const jsonChar of jsonStr) {
    targetStr += jsonChar;
    if (jsonChar === '}') {
      try {
        const parsed = JSON.parse(targetStr);
        results.push(parsed);
        targetStr = '';
      } catch (e) {
        // パースに失敗しても何もしない
      }
    }
  }

  return [results, targetStr];
}

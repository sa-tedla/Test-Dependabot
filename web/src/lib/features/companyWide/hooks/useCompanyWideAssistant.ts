import { splitToJsons } from '$lib/utils/splitToJsons';
import { newEmptyQAndAMessage } from '$lib/features/q_and_a/entities/qAndAMessage';
import {
  replaceLastQAndAMessageInStore,
  addQAndAMessageToStore,
} from '$lib/features/q_and_a/qAndAStore';
import { get, type Writable, writable } from 'svelte/store';
import { newMessageReference } from '$lib/entities';
import { sleep } from 'openai/core';
import { page } from '$app/stores';
import type { StreamingMessage } from '$lib/features/assistant/entities/StreamingMessage';

export function useRunCompanyWideAssistant() {
  const progress: Writable<string | undefined> = writable(undefined);
  const progressing = writable(false);
  const error: Writable<string | undefined> = writable(undefined);
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined = undefined;

  const resetProgress = () => {
    progress.set(undefined);
    progressing.set(false);
  };

  const runCompanyWideAssistant = async (threadId: string) => {
    const pathnameOnRequest = get(page).url.pathname;
    error.set(undefined);
    progress.set('リクエストを送信中です...');
    progressing.set(true);

    const newMessage = newEmptyQAndAMessage();
    let newHyperMeter = '';
    addQAndAMessageToStore(newMessage);

    const res = await fetch('/api/runQAndAAssistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messageId: newMessage.id,
        threadId: threadId,
      }),
    });
    if (!res.ok || !res.body) {
      resetProgress();
      throw new Error(`Server responded with status: ${res.status}`);
    }

    reader = res.body.getReader();
    const decoder = new TextDecoder();
    const read: () => Promise<void> = async () => {
      if (!reader) {
        throw new Error('Unexpected Error: reader is undefined');
      }
      const { done, value } = await reader.read();
      if (done) return;
      const decoded = newHyperMeter + decoder.decode(value);
      const [responses, hypermeter]: [StreamingMessage[], string] = splitToJsons(decoded);
      newHyperMeter = hypermeter;
      for (const res of responses) {
        await sleep(10); // 擬似的なストリーミング: OCのWindows端末だとSleepを入れないストリーミングのようにならない
        if (res.progress) {
          progress.set(res.progress);
        }
        if (res.message) {
          if (res.message.createdAt) {
            newMessage.createdAt = res.message.createdAt;
          }
          if (res.message.content) {
            newMessage.contents += res.message.content;
            // リクエスト後に別のページに遷移した場合などで処理が行われないようにする
            if (get(page).url.pathname === pathnameOnRequest) {
              replaceLastQAndAMessageInStore(newMessage);
            }
          }
          if (res.message.references) {
            const references = res.message.references.map((ref) => {
              return newMessageReference({
                name: ref.name,
                contents: ref.content,
                source: ref.source,
              });
            });
            newMessage.references = references;
          }
        }
        if (res.error) {
          error.set(res.error);
          resetProgress();
          return;
        }
      }

      return read();
    };
    await read();

    resetProgress();
  };

  const stopMessage = async () => {
    if (reader) {
      await reader.cancel();
      reader = undefined;
    }
  };

  return {
    runCompanyWideAssistant,
    progressing,
    progress,
    error,
    stopMessage,
  };
}

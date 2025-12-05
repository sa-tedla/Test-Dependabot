import { splitToJsons } from '$lib/utils/splitToJsons';
import { newEmptyAssistantMessage } from '$lib/features/assistant/entities/assistantMessage';
import { addMessageToMessagesStore, replaceMessageToMessagesStore } from '$lib/stores/messages';
import { get } from 'svelte/store';
import { sleep } from '$lib/utils/sleep';
import { page } from '$app/stores';
import { conversationAssistantRunningStatusMapStore } from '$lib/stores/assistantRunningStatusMapStore';
import type { StreamingMessage } from '$lib/features/assistant/entities/StreamingMessage';

export function useRunConversationAsssitant() {
  const runConversationAssistant = async (threadId: string) => {
    const pathnameOnRequest = get(page).url.pathname;
    conversationAssistantRunningStatusMapStore.setStatus(threadId, {
      progress: 'リクエストを送信中です...',
      progressing: true,
      error: undefined,
    });

    const newMessage = newEmptyAssistantMessage();
    let newHyperMeter = '';
    addMessageToMessagesStore(newMessage);

    const res = await fetch('/api/runConversationAssistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        threadId: threadId,
      }),
    });
    if (!res.ok || !res.body) {
      conversationAssistantRunningStatusMapStore.updateStatus(threadId, {
        progress: undefined,
        progressing: false,
        error:
          '予期せぬエラーが発生しました。\nしばらく時間を置いてから再度お試しください。\n問題が再発するようであれば、管理者に連絡してください。',
      });
      throw new Error('Unexpected Server Error');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    const read: () => Promise<void> = async () => {
      const { done, value } = await reader.read();
      if (done) return;
      const decoded = newHyperMeter + decoder.decode(value);
      const [responses, hypermeter]: [StreamingMessage[], string] = splitToJsons(decoded);
      newHyperMeter = hypermeter;
      for (const res of responses) {
        await sleep(10); // 擬似的なストリーミング: OCのWindows端末だとSleepを入れないストリーミングのようにならない
        if (res.progress) {
          conversationAssistantRunningStatusMapStore.updateStatus(threadId, {
            progress: res.progress,
          });
        }
        if (res.message) {
          if (res.message.createdAt) {
            newMessage.createdAt = res.message.createdAt;
          }
          if (res.message.content) {
            newMessage.contents += res.message.content;
            // リクエスト後に別のページに遷移した場合などで処理が行われないようにする
            if (get(page).url.pathname === pathnameOnRequest) {
              replaceMessageToMessagesStore(newMessage);
            }
          }
          // if (res.message.tokenNum) {
          //   newMessageInfo.message.promptTokenNum = res.message.tokenNum.prompt;
          //   newMessageInfo.message.completionTokenNum = res.message.tokenNum.completion;
          // }
        }
        if (res.error) {
          conversationAssistantRunningStatusMapStore.updateStatus(threadId, {
            error: res.error,
          });
          return;
        }
      }
      return read();
    };
    await read();

    conversationAssistantRunningStatusMapStore.updateStatus(threadId, {
      progress: undefined,
      progressing: false,
    });
  };

  return {
    runConversationAssistant,
  };
}

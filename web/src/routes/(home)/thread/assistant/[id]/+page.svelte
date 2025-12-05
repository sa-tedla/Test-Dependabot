<script lang="ts">
  import Send from 'svelte-material-icons/Send.svelte';
  import AssistantMessage from '$lib/components/ui/message/AssistantMessage.svelte';
  import ResizableTextArea from '$lib/components/ui/input/ResizableTextArea.svelte';
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import { createMessageSchema } from '$lib/schema';
  import { messagesStore, setMessagesToMessagesStore } from '$lib/stores/messages';
  import { useRunConversationAsssitant } from '$lib/features/assistant/hooks/useRunConversationAsssitant';
  import { page } from '$app/stores';
  import type { Page } from '@sveltejs/kit';
  import { goto } from '$app/navigation';
  import { newEmptyAssistantMessage } from '$lib/features/assistant/entities/assistantMessage';
  import { addMessageToMessagesStore } from '$lib/stores/messages';
  import {
    messageDocumentsStore,
    setMessageDocumentsToMessageDocumentsStoreFromMessages,
  } from '$lib/stores/messageDocumentsStore';
  import { conversationAssistantRunningStatusMapStore } from '$lib/stores/assistantRunningStatusMapStore';
  import type { AssistantRunningStatus } from '$lib/entities/assistantRunningStatus';
  import { browser } from '$app/environment';

  export let data;
  $: assistant = data.assistant;
  $: thread = data.thread;
  $: onChangePage($page);

  let scrollContainer: Element | undefined;
  $: scrollContainer ? scrollContainer.scrollIntoView(true) : undefined;

  let previousHref: string | undefined = undefined;

  let assistantRunningStatus: AssistantRunningStatus | undefined = undefined;
  let progress: string | undefined = undefined;
  let progressing: boolean = false;
  const refreshAssistantRunningStatus = () => {
    assistantRunningStatus = $conversationAssistantRunningStatusMapStore.get(thread?.id);
    progress = assistantRunningStatus?.progress;
    progressing = assistantRunningStatus?.progressing ?? false;
  };
  conversationAssistantRunningStatusMapStore.subscribe(() => refreshAssistantRunningStatus());

  const { runConversationAssistant } = useRunConversationAsssitant();
  const { form, submit, enhance, validateForm, allErrors } = superForm(data.form, {
    validators: zodClient(createMessageSchema),
    onUpdated: async () => {
      await runConversationAssistant(thread.id);
    },
  });

  async function onChangePage(page: Page) {
    const pageTransitioned = previousHref !== page.url.href; // previousHref を更新する前に行っておく
    previousHref = page.url.href;

    setMessagesToMessagesStore(data.messages);

    // 現状は、最初のユーザーメッセージだけファイルを持ちうるので、ここで store にセットする処理をするだけでOK
    setMessageDocumentsToMessageDocumentsStoreFromMessages(data.messages);

    // ページ遷移直後に値が空にならないようにする。
    refreshAssistantRunningStatus();

    if (
      pageTransitioned &&
      data.messages.length === 1 &&
      data.messages.slice(-1)[0]?.role === 'USER' &&
      // この部分を追加することで、
      // 新規スレッド作成
      // → このページにリダイレクト
      // → リクエストが自動実行される
      // → リクエスト中に、別の画面に遷移
      // → リクエスト中に、元の画面に遷移
      // → リクエストが再度実行される
      // が起こることを回避する。
      //
      // 初回リクエストが未実行なら status は undefined になる。
      assistantRunningStatus === undefined &&
      browser
    ) {
      await runConversationAssistant(thread.id);
      return;
    }

    // リクエスト
    // → リクエスト中に、別の画面に遷移
    // → リクエスト中に、元の画面に遷移
    // の場合に、
    // リクエスト時のユーザーメッセージが表示されるようにする。
    if (pageTransitioned && progressing) {
      const newMessage = newEmptyAssistantMessage();
      addMessageToMessagesStore(newMessage);
      return;
    }

    // リクエスト
    // → リクエスト中に、別の画面に遷移
    // → リクエスト完了後に、元の画面に遷移
    // の場合に、
    // リクエストへのレスポンスメッセージが表示されるようにする。
    if (
      pageTransitioned &&
      !progressing &&
      data.messages.slice(-1)[0]?.role === 'USER' &&
      browser
    ) {
      // +page.server.ts の load 関数をもう一度呼んで、
      // data.messages を最新のものにする。
      // 参考：
      // https://github.com/sveltejs/kit/issues/1684#issuecomment-863057876
      await goto(page.url.href, { replaceState: true, invalidateAll: true });
      return;
    }
  }

  async function handleSubmit(event: KeyboardEvent | Event) {
    event.preventDefault();
    if (progressing) {
      return;
    }
    const result = await validateForm();
    if (result.valid) {
      submit();
    }
  }
</script>

<div class="h-full flex-1 relative flex flex-col items-center overflow-auto">
  <div class="flex-1 w-full flex flex-col items-center overflow-y-auto">
    {#if !assistant}
      <div class="w-full py-9 border-b-[0.5px] border-black flex flex-col items-center">
        <div class="w-[452px] flex flex-col gap-2">
          <div class="w-full flex flex-row text-base font-bold gap-1">
            <p>🤖</p>
            <p>削除されたアシスタント</p>
          </div>
        </div>
      </div>
    {:else if assistant.assistantType !== 'EMPTY'}
      <div class="w-full py-9 border-b-[0.5px] border-black flex flex-col items-center">
        <div class="w-[452px] flex flex-col gap-2">
          <div class="w-full flex flex-row text-base font-bold gap-1">
            <p>{assistant.icon}</p>
            <p>{assistant.name}</p>
          </div>
          <p class="text-[11px] font-[#636363]">{assistant.description}</p>
        </div>
      </div>
    {/if}
    {#each $messagesStore as message}
      <div
        class="w-full border-b-[0.5px] border-black flex flex-col items-center"
        class:bg-[#EEEEEE]={message.role !== 'USER'}
      >
        <div class="w-full max-w-[624px]" bind:this={scrollContainer}>
          <AssistantMessage
            {message}
            messageDocument={$messageDocumentsStore.find((ma) => ma.messageId === message.id)}
          />
        </div>
      </div>
    {/each}
  </div>

  {#if progressing}
    <div
      class="w-full max-w-[1044px] px-[18px] z-10 my-[13px] flex items-center justify-start gap-[10px]"
    >
      <span class="text-[#737376] loading loading-spinner loading-xs h-[14px]"></span>
      <p class="text-[#737376] text-base">{progress}</p>
    </div>
  {/if}

  <div class="w-full flex flex-col items-center border-t-[1px] border-[#545454]">
    <div class="flex flex-col items-end w-full gap-6 px-32 py-8">
      <form method="POST" use:enhance class="w-full relative">
        <input type="hidden" name="threadId" value={thread.id} />
        <input type="hidden" name="modelType" value={thread.modelType} />
        <ResizableTextArea
          name="contents"
          bind:value={$form.contents}
          onPressEnter={handleSubmit}
          class="w-full px-6 py-[10px] border-black outline outline-1 outline-black rounded-[6px] max-h-[149px] resize-none"
          placeholder={assistant
            ? 'テキストを入力して会話を続ける'
            : 'アシスタントが削除されているため、会話を続けることはできません'}
          disabled={!assistant}
        />
        <button
          disabled={progressing || allErrors.length > 0}
          on:click={handleSubmit}
          class="text-[#0165A3] disabled:text-gray-300 absolute top-1/3 right-2"
        >
          <Send size="20" />
        </button>
      </form>
    </div>
  </div>
</div>

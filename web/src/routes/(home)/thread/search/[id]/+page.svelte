<script lang="ts">
  import FileOutline from 'svelte-material-icons/FileOutline.svelte';
  import { useRunSearchAssistant } from '$lib/features/search/hooks/useRunSearchAssistant';
  import Send from 'svelte-material-icons/Send.svelte';
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import { createMessageSchema } from '$lib/schema';
  import ResizableTextArea from '$lib/components/ui/input/ResizableTextArea.svelte';
  import {
    resetSearchMessageStore,
    searchAssistantMessageStore,
    setSearchMessageStore,
  } from '$lib/stores/searchAssistantMessageStore';
  import SearchAssistantMessage from '$lib/components/ui/message/SearchAssistantMessage.svelte';
  import SearchAssistantDetailDialog from '$lib/components/ui/modal/SearchAssistantDetailDialog.svelte';
  import { page } from '$app/stores';
  import type { Page } from '@sveltejs/kit';
  import { goto } from '$app/navigation';
  import { searchAssistantRunningStatusMapStore } from '$lib/stores/assistantRunningStatusMapStore.js';
  import type { AssistantRunningStatus } from '$lib/entities/assistantRunningStatus.js';
  import { browser } from '$app/environment';

  export let data;
  $: thread = data.thread;
  $: messages = data.thread.messages;
  $: assistant = data.thread.assistant;
  $: onChangePage($page);

  let previousHref: string | undefined = undefined;

  let assistantRunningStatus: AssistantRunningStatus | undefined = undefined;
  let progress: string | undefined = undefined;
  let progressing: boolean = false;
  const refreshAssistantRunningStatus = () => {
    assistantRunningStatus = $searchAssistantRunningStatusMapStore.get(thread?.id);
    progress = assistantRunningStatus?.progress;
    progressing = assistantRunningStatus?.progressing ?? false;
  };
  searchAssistantRunningStatusMapStore.subscribe(() => refreshAssistantRunningStatus());

  const MODAL_ID_DETAIL_CHAT_MODEL = 'detail-c2d5e3f4';

  const { runSearchAssistant } = useRunSearchAssistant();

  const { form, submit, enhance, validateForm } = superForm(data.createMessageForm, {
    validators: zodClient(createMessageSchema),
    resetForm: false,
    onSubmit: async () => {
      resetSearchMessageStore();
    },
    onUpdated: async () => {
      await runSearchAssistant(thread.id);
    },
  });

  async function onChangePage(page: Page) {
    const pageTransitioned = previousHref !== page.url.href; // previousHref を更新する前に行っておく
    previousHref = page.url.href;

    // ページ遷移直後に値が空にならないようにする。
    refreshAssistantRunningStatus();

    // リクエスト
    // → リクエスト中に、別のファイル検索のスレッドに遷移
    // → リクエスト中に、元の画面に遷移
    // の場合に、
    // 別画面のメッセージが元の画面に表示されるのを防ぐことも兼ねている。
    resetSearchMessageStore();

    // 新規スレッドの作成後に、
    // リダイレクトされて、この画面に遷移してきた場合
    if (
      pageTransitioned &&
      messages.length === 1 &&
      messages.slice(-1)[0]?.role === 'USER' &&
      assistantRunningStatus === undefined &&
      browser
    ) {
      await runSearchAssistant(thread.id);
      return;
    }

    // リクエスト
    // → リクエスト中に、別の画面に遷移
    // → リクエスト完了後に、元の画面に遷移
    // の場合に、
    // メッセージが表示されないのを防ぐ。
    if (pageTransitioned && !progressing && messages.slice(-1)[0]?.role === 'USER' && browser) {
      // +page.server.ts の load 関数をもう一度呼んで、
      // data.messages を最新のものにする。
      // 参考：
      // https://github.com/sveltejs/kit/issues/1684#issuecomment-863057876
      await goto(page.url.href, { replaceState: true, invalidateAll: true });
      return;
    }

    if (messages.slice(-1)[0]?.role === 'ASSISTANT') {
      setSearchMessageStore(messages.slice(-1)[0]);
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

  function showModelDetailsModal() {
    window[MODAL_ID_DETAIL_CHAT_MODEL].showModal();
  }
</script>

<div class="h-full flex-1 relative flex flex-col items-center overflow-auto">
  <div class="flex-1 w-full flex flex-col items-center overflow-y-auto">
    <div class="w-full py-9 border-b-[0.5px] border-black flex flex-col items-center">
      <div class="w-[452px] flex flex-col gap-2">
        <div class="w-full flex flex-row text-base font-bold gap-1">
          <p>{assistant.icon}</p>
          <p>{assistant.name}</p>
        </div>
        <div class="w-full flex flex-row items-center gap-2">
          <FileOutline size="18" />
          <button class="text text-gray-400 text-xs" on:click={showModelDetailsModal}>
            格納ファイルを閲覧・更新する
          </button>
        </div>
      </div>
    </div>

    <form
      method="POST"
      action="?/createMessage"
      class="w-full pb-[25px] flex flex-col items-center border-y-[1px] border-[#545454]"
      use:enhance
    >
      <div class="flex flex-col items-end w-full gap-6 px-32 py-8">
        <div class="w-full relative">
          <input type="hidden" name="threadId" value={thread.id} />
          <input type="hidden" name="modelType" value={thread.modelType} />
          <ResizableTextArea
            name="contents"
            bind:value={$form.contents}
            onPressEnter={handleSubmit}
            placeholder={'テキストを入力して検索'}
            class="w-full px-6 py-[10px] border-black outline outline-1 outline-black rounded-[6px] max-h-[149px] resize-none"
          />
          <button
            type="submit"
            disabled={$form.contents === '' || progressing}
            class="text-[#0165A3] disabled:text-gray-300 absolute top-1/3 right-2"
          >
            <Send size="20" />
          </button>
        </div>
      </div>
    </form>

    {#if $searchAssistantMessageStore}
      <SearchAssistantMessage message={$searchAssistantMessageStore} />
    {/if}

    {#if progress}
      <div
        class="w-full max-w-[1044px] px-[18px] z-10 my-[13px] flex items-center justify-start gap-[10px]"
      >
        <span class="text-[#737376] loading loading-spinner loading-xs h-[14px]"></span>
        <p class="text-[#737376] text-base">{progress}</p>
      </div>
    {/if}
  </div>
</div>

<SearchAssistantDetailDialog
  data={data.refreshAssistantDocumentForm}
  action="?/refreshAssistantDocument"
  modalId={MODAL_ID_DETAIL_CHAT_MODEL}
  {assistant}
  indexSources={assistant.indexSources}
/>

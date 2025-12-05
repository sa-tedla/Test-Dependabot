<script lang="ts">
  import FileOutline from 'svelte-material-icons/FileOutline.svelte';
  import Send from 'svelte-material-icons/Send.svelte';
  import { superForm, filesProxy } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import { createMessageSchema } from '$lib/schema';
  import ResizableTextArea from '$lib/components/ui/input/ResizableTextArea.svelte';
  import MessageDocumentInput from '$lib/components/ui/input/MessageDocumentInput.svelte';
  import { ACCEPTED_FILENAME_EXTENSION_FOR_ALL } from '$lib/features/message_document/consts/fileRestrictions';
  import UploadedFileName from '$lib/components/ui/file/UploadedFileName.svelte';
  import { useRunQAndAAssistant } from '$lib/features/q_and_a/hooks/useRunQAndAAssistant';
  import {
    qAndAMessagesStore,
    setQAndAMessagesToStore,
    addQAndAMessageToStore,
  } from '$lib/features/q_and_a/qAndAStore';
  import QAndAAssistantMessage from '$lib/components/ui/message/QAndAAssistantMessage.svelte';
  import QAndAAssistantDetailDialog from '$lib/components/ui/modal/QAndAAssistantDetailDialog.svelte';
  import UserFeedbackDialog from '$lib/components/ui/modal/UserFeedbackDialog.svelte';
  import { page } from '$app/stores';
  import type { Page } from '@sveltejs/kit';
  import { goto } from '$app/navigation';
  import { qAndAAssistantRunningStatusMapStore } from '$lib/stores/assistantRunningStatusMapStore';
  import type { AssistantRunningStatus } from '$lib/entities/assistantRunningStatus.js';
  import QAndAUserMessage from '$lib/components/ui/message/QAndAUserMessage.svelte';
  import { newEmptyQAndAMessage } from '$lib/features/q_and_a/entities/qAndAMessage.js';
  import { convertToQAndAMessagePairs } from '$lib/features/q_and_a/entities/qAndAMessagePair';
  import { browser } from '$app/environment';
  import { tick } from 'svelte';

  export let data;
  $: thread = data.thread;
  $: messages = data.thread.messages;
  $: assistant = data.thread.assistant;

  let scrollContainer: Element | undefined;
  $: scrollContainer ? scrollContainer.scrollIntoView(true) : undefined;

  let previousHref: string | undefined = undefined;

  let assistantRunningStatus: AssistantRunningStatus | undefined = undefined;
  let progress: string | undefined = undefined;
  let progressing: boolean = false;
  let error: string | undefined = undefined;
  const refreshAssistantRunningStatus = () => {
    assistantRunningStatus = $qAndAAssistantRunningStatusMapStore.get(thread?.id);
    progress = assistantRunningStatus?.progress;
    progressing = assistantRunningStatus?.progressing ?? false;
    error = assistantRunningStatus?.error;
  };
  qAndAAssistantRunningStatusMapStore.subscribe(() => refreshAssistantRunningStatus());

  const MODAL_ID_DETAIL_DIALOG = 'detail-c2d5e3f4';
  const MODAL_ID_USER_FEEDBACK = 'userfeedback-c2d5e3f4';
  let feedbackQuestion: string = '';

  const { runQAndAAssistant } = useRunQAndAAssistant();

  const { form, submit, enhance, validateForm, errors, allErrors } = superForm(
    data.createMessageForm,
    {
      validators: zodClient(createMessageSchema),
      onUpdated: async () => {
        await runQAndAAssistant(thread.id);
      },
    }
  );

  $: isSendButtonDisabled = $allErrors.length > 0 || progressing || form.processing;

  let messageDocumentInput: MessageDocumentInput;
  const fileList = filesProxy(form, 'files');

  $: onChangePage($page);

  async function onChangePage(page: Page) {
    const pageTransitioned = page.url.href !== previousHref; // previousHref を更新する前に実行する。
    previousHref = page.url.href;

    setQAndAMessagesToStore(data.thread.messages);

    // ページ遷移直後に値が空にならないようにする。
    refreshAssistantRunningStatus();

    // 新規スレッドの作成後に、
    // リダイレクトされて、この画面に遷移してきた場合
    if (
      pageTransitioned &&
      data.thread.messages.length === 1 &&
      messages.slice(-1)[0]?.role === 'USER' &&
      assistantRunningStatus === undefined &&
      browser
    ) {
      await runQAndAAssistant(thread.id);
      return;
    }

    // リクエスト
    // → リクエスト中に、別の画面に遷移
    // → リクエスト中に、元の画面に遷移
    // の場合に、
    // リクエスト時のユーザーメッセージが表示されるようにする。
    if (pageTransitioned && progressing) {
      const newMessage = newEmptyQAndAMessage();
      addQAndAMessageToStore(newMessage);
      return;
    }

    // リクエスト
    // → リクエスト中に、別の画面に遷移
    // → リクエスト完了後に、元の画面に遷移
    // の場合に、
    // メッセージが表示されないのを防ぐ
    if (pageTransitioned && !progressing && messages.slice(-1)[0]?.role === 'USER' && browser) {
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

  function showModelDetailsModal() {
    window[MODAL_ID_DETAIL_DIALOG].showModal();
  }

  async function showModalUserFeedback(question: string) {
    // 一度空にしてから値を設定することで、リアクティブステートメントを確実に発火させる
    feedbackQuestion = '';
    await tick();
    feedbackQuestion = question;
    window[MODAL_ID_USER_FEEDBACK].showModal();
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

    {#if $qAndAMessagesStore}
      <div class="w-full h-[100%] bg-[#EEEEEE]">
        <div class="flex flex-col gap-6 items-center w-full py-[39px] bg-[#EEEEEE]">
          {#each convertToQAndAMessagePairs($qAndAMessagesStore) as pair}
            <div class="bg-white rounded-xl flex flex-col gap-4 w-full max-w-[754px]">
              <div bind:this={scrollContainer}>
                <div class="border-b-[#C8C8C8] border-b-[1px]">
                  <QAndAUserMessage message={pair.user} />
                </div>
                <div>
                  <QAndAAssistantMessage
                    message={pair.assistant}
                    submitUserFeedback={() => showModalUserFeedback(pair.user?.contents ?? '')}
                  />
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  {#if progress}
    <div class="flex flex-col items-center w-full bg-[#EEEEEE]">
      <div
        class="w-full max-w-[1044px] px-[18px] z-10 my-[13px] flex items-center justify-start gap-[10px] bg-[#EEEEEE]"
      >
        <span class="text-[#737376] loading loading-spinner loading-xs h-[14px]"></span>
        <p class="text-[#737376] text-base">{progress}</p>
      </div>
    </div>
  {/if}

  {#if error}
    <div class="flex flex-col items-center w-full bg-[#EEEEEE]">
      <div
        class="w-full max-w-[1044px] px-[18px] z-10 my-[13px] flex items-center justify-start gap-[10px] bg-[#EEEEEE]"
      >
        <p class="px-5 text-red-400">{error}</p>
      </div>
    </div>
  {/if}

  <form
    method="POST"
    action="?/createMessage"
    enctype="multipart/form-data"
    class="w-full pb-[25px] flex flex-col items-center border-y-[1px] border-[#545454]"
    use:enhance
  >
    <div class="flex flex-col items-end w-full gap-6 px-32 py-8">
      {#if $errors.contents}
        <p class="w-full text-left text-red-400 leading-tight">{$errors.contents}</p>
      {/if}

      {#if $errors.files?._errors}
        <div class="w-full text-left space-y-1">
          {#each $errors.files._errors as error}
            <p class="text-red-400 leading-tight">{error}</p>
          {/each}
        </div>
      {/if}

      <div class="w-full flex flex-wrap items-start justify-start gap-3">
        {#each Array.from($fileList) as file, index}
          <UploadedFileName
            filename={file.name}
            handleClearButtonClick={() => {
              messageDocumentInput.removeFile(index);
            }}
          />
        {/each}
      </div>

      <div class="w-full relative flex gap-2">
        <input type="hidden" name="threadId" value={thread.id} />
        <input type="hidden" name="modelType" value={thread.modelType} />
        <MessageDocumentInput
          bind:this={messageDocumentInput}
          bind:fileList={$fileList}
          accept={ACCEPTED_FILENAME_EXTENSION_FOR_ALL.join(',')}
        />
        <ResizableTextArea
          name="contents"
          bind:value={$form.contents}
          onPressEnter={handleSubmit}
          placeholder={'テキストを入力して質問'}
          class="w-full pl-[48px] px-6 py-[10px] border-black outline outline-1 outline-black rounded-[6px] max-h-[149px] resize-none"
        />
        <button
          type="submit"
          disabled={isSendButtonDisabled}
          class="text-[#0165A3] disabled:text-gray-300 absolute top-1/3 right-2"
        >
          <Send size="20" />
        </button>
      </div>
    </div>
  </form>
</div>

<QAndAAssistantDetailDialog
  data={data.refreshAssistantDocumentForm}
  action="?/refreshAssistantDocument"
  modalId={MODAL_ID_DETAIL_DIALOG}
  {assistant}
  indexSources={assistant.indexSources}
  userFeedbacks={assistant.userFeedbacks}
/>

<UserFeedbackDialog
  data={data.userFeedbackForm}
  action="?/saveUserFeedback"
  modalId={MODAL_ID_USER_FEEDBACK}
  {assistant}
  bind:defaultQuestion={feedbackQuestion}
/>

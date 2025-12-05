<script lang="ts">
  import { browser } from '$app/environment';
  import RobotOutline from 'svelte-material-icons/RobotOutline.svelte';
  import Send from 'svelte-material-icons/Send.svelte';
  import { superForm, filesProxy } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import ResizableTextArea from '$lib/components/ui/input/ResizableTextArea.svelte';
  import FileOutline from 'svelte-material-icons/FileOutline.svelte';
  import { qAndAMessagesStore, setQAndAMessagesToStore } from '$lib/features/q_and_a/qAndAStore';
  import CompanyWideHeaderForThread from '$lib/components/companyWide/CompanyWideHeaderForThread.svelte';
  import { useRunCompanyWideAssistant } from '$lib/features/companyWide/hooks/useCompanyWideAssistant';
  import { onDestroy, onMount } from 'svelte';
  import { createMessageSchemaForAll } from '$lib/features/all/schema';
  import { goto } from '$app/navigation';
  import { canOpenReference, deduplicateReferences } from '$lib/utils/referenceUtils';
  import MessageDocumentInput from '$lib/components/ui/input/MessageDocumentInput.svelte';
  import { ACCEPTED_FILENAME_EXTENSION_FOR_ALL } from '$lib/features/message_document/consts/fileRestrictions.js';
  import UploadedFileName from '$lib/components/ui/file/UploadedFileName.svelte';
  import type { MessageDocument } from '$lib/entities';

  export let data;

  let scrollContainer: HTMLElement;

  $: assistant = data.companyWideThread.assistant;
  $: thread = data.companyWideThread.thread;
  $: messages = data.companyWideThread.messages;

  $: localMessageFeedback = {};

  const { runCompanyWideAssistant, progress, error, stopMessage, progressing } =
    useRunCompanyWideAssistant();

  const {
    form,
    submit,
    enhance,
    validateForm,
    errors: formErrors,
    allErrors,
  } = superForm(data.form, {
    validators: zodClient(createMessageSchemaForAll),
    onUpdated: async () => {
      scrollToBottom();
      await runCompanyWideAssistant(thread.id);
    },
  });

  $: isSendButtonDisabled = $allErrors.length > 0 || $progressing || form.processing;

  $: if (scrollContainer) {
    scrollToBottom();
  }
  $: if ($formErrors.contents) {
    setTimeout(() => {
      scrollToBottom();
    }, 10);
  }
  $: if (messages) {
    const innerMessages = messages.map((m) => ({
      ...m.message,
      documents: m.documents,
      references: m.references,
      feedback: m.feedback,
    }));
    setQAndAMessagesToStore(innerMessages);
  }

  $: if ($progress || $qAndAMessagesStore) {
    scrollToBottom();
  }

  let messageDocumentInput: MessageDocumentInput;
  const fileList = filesProxy(form, 'files');

  onMount(async () => {
    const innerMessages = messages.map((m) => ({
      ...m.message,
      documents: m.documents,
      references: m.references,
      feedback: m.feedback,
    }));
    setQAndAMessagesToStore(innerMessages);
    if (messages.slice(-1)[0]?.message.role === 'USER') {
      await runCompanyWideAssistant(thread.id);
    }
  });

  onDestroy(async () => {
    await stopMessage();
  });

  function gotoBack() {
    if (browser) history.back();
  }

  function scrollToBottom() {
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }

  async function handleSubmit(event: KeyboardEvent | Event) {
    event.preventDefault();
    if (isSendButtonDisabled) return;
    const result = await validateForm();
    if (result.valid) {
      submit();
    }
  }

  async function sendFeedback(messageId: string, fedback: 'GOOD' | 'BAD') {
    await fetch('/api/upsertMessageFeedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messageId: messageId,
        feedback: fedback,
      }),
    });
    localMessageFeedback = {
      ...localMessageFeedback,
      [messageId]: fedback,
    };
  }

  async function gotoNewThread() {
    await goto(`/all/assistant/${assistant.id}`, {
      replaceState: true,
    });
  }

  async function downloadFile(doc: MessageDocument) {
    try {
      console.log('Downloading file:', doc.filename);
      const response = await fetch(`/api/downloadMessageDocument/${doc.id}`, {
        method: 'GET',
      });

      if (!response.ok) {
        console.error('Download failed:', response.status, response.statusText);
        return;
      }

      // blobデータを取得してダウンロード
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
    }
  }
</script>

<div class="flex flex-col w-full h-full rounded-[18px]">
  <CompanyWideHeaderForThread
    title={assistant.name}
    subTitle={thread.title}
    onClickBack={gotoBack}
    onClickNewThread={gotoNewThread}
  />

  <div
    class="flex-1 w-full gap-4 flex flex-col overflow-y-scroll py-2 px-5"
    bind:this={scrollContainer}
  >
    {#each $qAndAMessagesStore as message, index (message.id)}
      {#if message.role === 'USER'}
        <div class="w-full flex flex-row-reverse mt-auto" class:mt-auto={index === 0}>
          <div class="bg-[#0165A3] px-[19px] py-4 rounded-[6px] text-white max-w-[60%]">
            <p class="text-[15px] font-normal leading-[140%] break-words whitespace-pre-wrap">
              {message.contents}
            </p>
            {#if message.documents && message.documents.length > 0}
              <div class="divider my-[7px]" />
              <div class="flex flex-col items-start text-white font-normal gap-[6px]">
                {#each message.documents as document}
                  <button
                    type="button"
                    class="flex flex-row items-center gap-[6px] text-[13px] text-left hover:text-blue-200 hover:underline"
                    on:click={() => downloadFile(document)}
                  >
                    <FileOutline class="text-[20px] text-white" />
                    {document.filename}
                  </button>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      {/if}
      {#if message.role === 'ASSISTANT' && message.contents.length > 0}
        <div class="flex flex-col gap-2">
          <div class="flex flex-row gap-[10px] items-end max-w-[60%]">
            <RobotOutline class="text-[32px] text-[#B8B8B]" />
            <div class="bg-[#F2F2F2] px-[19px] py-4 rounded-[6px] max-w-[90%]">
              <p class="text-[15px] font-normal leading-[140%] whitespace-pre-wrap break-words">
                {message.contents}
              </p>
              <div class="divider my-[7px]" />

              {#if message.references && message.references.length > 0}
                {#if new Date(message.createdAt) >= new Date('2025-08-28T19:00:00')}
                  <!-- 2025/08/28 19:00以降: deduplicateReferences実行後に3つ表示 -->
                  {#each deduplicateReferences(message.references).slice(0, 3) as ref, index (index)}
                    <div class="flex flex-row text-[#737373] font-normal items-center gap-[6px]">
                      <FileOutline class="text-[20px] min-h-[20px] min-w-[20px]" />
                      <button
                        class={`leading-[140%] text-[13px] text-start ${!canOpenReference(ref) ? 'opacity-80 select-none' : ''}`}
                        disabled={!canOpenReference(ref)}
                        on:click={() => {
                          if (canOpenReference(ref)) {
                            window.open(ref.source, '_blank');
                          }
                        }}
                      >
                        {#if ref.name === 'crm_qa_document.pdf'}
                          ITサポートデスクの対応履歴を元に回答
                        {:else}
                          {ref.name}
                        {/if}
                      </button>
                    </div>
                  {/each}
                {:else}
                  <!-- 2025/08/28 19:00以前: deduplicateReferences実行せずに[0]のみ表示 -->
                  {#if message.references[0]}
                    <div class="flex flex-row text-[#737373] font-normal items-center gap-[6px]">
                      <FileOutline class="text-[20px]" />
                      <button
                        class={`leading-[140%] text-[13px] text-start ${!canOpenReference(message.references[0]) ? 'opacity-80 select-none' : ''}`}
                        disabled={!canOpenReference(message.references[0])}
                        on:click={() => {
                          if (canOpenReference(message.references[0])) {
                            window.open(message.references[0].source, '_blank');
                          }
                        }}
                      >
                        {#if message.references[0].name === 'crm_qa_document.pdf'}
                          ITサポートデスクの対応履歴を元に回答
                        {:else}
                          {message.references[0].name}
                        {/if}
                      </button>
                    </div>
                  {/if}
                {/if}
              {/if}
            </div>
          </div>

          <!-- 最新の回答のみ、ストリーミング完了後にフィードバックボタンを表示 -->
          {#if index !== $qAndAMessagesStore.length - 1 || !$progress}
            <div class="flex gap-2 pl-[40px] text-xs">
              <button
                type="button"
                class={`border border-black rounded-xl px-3 py-1 ${
                  localMessageFeedback[message.id] === 'GOOD' ||
                  (localMessageFeedback[message.id] === undefined && message.feedback === 'GOOD')
                    ? 'bg-gray-300'
                    : ''
                }`}
                on:click={() => sendFeedback(message.id, 'GOOD')}>👍 役に立ちました</button
              >
              <button
                type="button"
                class={`border border-black rounded-xl px-3 py-1 ${
                  localMessageFeedback[message.id] === 'BAD' ||
                  (localMessageFeedback[message.id] === undefined && message.feedback === 'BAD')
                    ? 'bg-gray-300'
                    : ''
                }`}
                on:click={() => sendFeedback(message.id, 'BAD')}>👎 役に立ちませんでした</button
              >
            </div>
          {/if}
        </div>
      {/if}
    {/each}

    {#if $progress}
      <div class="flex flex-row gap-7 items-center">
        <RobotOutline class="text-[32px] text-[#B8B8B]" />
        <p class="text-[#737376] text-[15px] leading-[140%]">{$progress}</p>
      </div>
    {/if}

    {#if $error}
      <div class="px-5 flex flex-row items-end">
        <p class="text-[#FF0000] text-[13px] leading-[140%]">{$error}</p>
      </div>
    {/if}

    {#if $formErrors.contents}
      <div class="px-5 flex flex-row items-end">
        <p class="text-[#FF0000] text-[13px] leading-[140%]">{$formErrors.contents}</p>
      </div>
    {/if}

    {#if $formErrors.files?._errors}
      {#each $formErrors.files._errors as error}
        <div class="px-5 flex flex-row items-end">
          <p class="text-[#FF0000] text-[13px] leading-[140%]">{error}</p>
        </div>
      {/each}
    {/if}
  </div>

  <hr />

  <div class="w-full flex flex-col items-center justify-center gap-3 px-5 py-3">
    <div class="w-full flex flex-wrap items-center justify-start gap-3">
      {#each Array.from($fileList) as file, index}
        <div class="">
          <UploadedFileName
            filename={file.name}
            handleClearButtonClick={() => {
              messageDocumentInput.removeFile(index);
            }}
          />
        </div>
      {/each}
    </div>
    <form
      method="POST"
      enctype="multipart/form-data"
      use:enhance
      class="w-full relative flex gap-2"
    >
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
        class="w-full pl-[48px] px-3 py-[10px] rounded-[6px] resize-none outline-none h-[45px] max-h-[200px]"
        placeholder={assistant
          ? 'テキストを入力して会話を続ける'
          : 'アシスタントが削除されているため、会話を続けることはできません'}
        disabled={!assistant}
      />
      <button type="button" disabled={isSendButtonDisabled} on:click={handleSubmit}>
        <Send class={isSendButtonDisabled ? 'text-[#737376]' : 'text-[#0165A3]'} size="18" />
      </button>
    </form>
  </div>
</div>

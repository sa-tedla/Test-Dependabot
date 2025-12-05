<script lang="ts">
  import { browser } from '$app/environment';
  import RobotOutline from 'svelte-material-icons/RobotOutline.svelte';
  import { superForm, filesProxy } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import ResizableTextArea from '$lib/components/ui/input/ResizableTextArea.svelte';
  import CompanyWideHeaderForThread from '$lib/components/companyWide/CompanyWideHeaderForThread.svelte';
  import Send from 'svelte-material-icons/Send.svelte';
  import { goto } from '$app/navigation';
  import { createQAndAThreadSchemaForAll } from '$lib/features/all/schema';
  import MessageDocumentInput from '$lib/components/ui/input/MessageDocumentInput.svelte';
  import { ACCEPTED_FILENAME_EXTENSION_FOR_ALL } from '$lib/features/message_document/consts/fileRestrictions.js';
  import UploadedFileName from '$lib/components/ui/file/UploadedFileName.svelte';

  export let data;
  $: assistant = data.assistant;

  const { form, submit, enhance, errors, allErrors } = superForm(data.form, {
    applyAction: false,
    validators: zodClient(createQAndAThreadSchemaForAll),
    onResult: async ({ result }) => {
      if (result.type === 'redirect') {
        await goto(result.location, {
          replaceState: true,
        });
      }
    },
  });

  $: $form.modelType = 'GPT_4O';
  $: $form.assistantId = assistant.id;

  let messageDocumentInput: MessageDocumentInput;
  const fileList = filesProxy(form, 'files');

  function gotoBack() {
    if (browser) history.back();
  }
</script>

<div class="flex flex-col w-full h-full rounded-[18px]">
  <CompanyWideHeaderForThread
    title={assistant.name}
    subTitle="何について知りたいですか？"
    onClickBack={gotoBack}
  />

  <div class="w-full h-full">
    <div class="mt-[63px] flex flex-col items-center justify-center gap-[26px]">
      <p class="text-[18px] font-semibold leading-[18px]">チャットを開始しましょう</p>
      <RobotOutline class="text-[32px]" />
      <div class="flex flex-col gap-3 items-center justify-center">
        <p class="text-[18px] font-semibold leading-[18px">質問例</p>
        <p class="text-center text-[13px] leading-[25px]">
          「◯◯について教えて」<br />
          「◯◯に関する規程を要約して教えて」<br />
          「◯◯の開始日はいつまでですか？」
        </p>
      </div>
    </div>
  </div>

  {#if $errors.contents}
    <p class="px-5 text-red-400">{$errors.contents}</p>
  {/if}

  {#if $errors.files?._errors}
    {#each $errors.files._errors as error}
      <p class="px-5 text-red-600">{error}</p>
    {/each}
  {/if}

  <hr />

  <div class="w-full flex flex-col items-center justify-center gap-3 px-5 py-3">
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
    <form
      method="POST"
      enctype="multipart/form-data"
      use:enhance
      class="w-full relative flex gap-2"
    >
      <input type="hidden" name="assistantId" value={$form.assistantId} />
      <input type="hidden" name="modelType" value={$form.modelType} />
      <MessageDocumentInput
        bind:this={messageDocumentInput}
        bind:fileList={$fileList}
        accept={ACCEPTED_FILENAME_EXTENSION_FOR_ALL.join(',')}
      />
      <ResizableTextArea
        name="contents"
        bind:value={$form.contents}
        class="w-full pl-[48px] px-3 py-[10px] rounded-[6px] resize-none outline-none h-[45px]"
        placeholder={assistant
          ? 'テキストを入力して会話を続ける'
          : 'アシスタントが削除されているため、会話を続けることはできません'}
        disabled={!assistant}
        onPressEnter={submit}
      />
      <button disabled={$allErrors.length > 0} on:click={submit}>
        <Send class={$allErrors.length > 0 ? 'text-[#737376]' : 'text-[#0165A3]'} size="18" />
      </button>
    </form>
  </div>
</div>

<script lang="ts">
  import Plus from 'svelte-material-icons/Plus.svelte';
  import Pencil from 'svelte-material-icons/PencilOutline.svelte';
  import Send from 'svelte-material-icons/Send.svelte';
  import RobotOutline from 'svelte-material-icons/RobotOutline.svelte';
  import type { Assistant } from '$lib/entities';
  import ResizableTextArea from '$lib/components/ui/input/ResizableTextArea.svelte';
  import { fileProxy, superForm } from 'sveltekit-superforms/client';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import { createThreadSchema } from '$lib/schema';
  import { onMount } from 'svelte';
  import { defaultPrompt } from '$lib/stores/defaultPrompt';
  import PaperClip from 'svelte-material-icons/Paperclip.svelte';
  import {
    MAX_FILE_SIZE_IN_BYTES,
    ACCEPTED_FILENAME_EXTENSION,
    getSizeInMB,
  } from '$lib/features/message_document/consts/fileRestrictions.js';
  import UploadedFileName from '$lib/components/ui/file/UploadedFileName.svelte';

  export let data;
  $: assistants = data.assistants;
  let selectedAssistant: Assistant | undefined = undefined;
  let focusingAssistant: boolean = false;
  let focusedAssistant: Assistant | undefined = undefined;

  let submitting: boolean = false;

  const { form, submit, enhance, validateForm } = superForm(data.form, {
    validators: zodClient(createThreadSchema),
    onUpdated: () => {
      submitting = false;
    },
    onError: () => {
      alert('予期せぬエラーが発生しました。時間をおいてお試しください。');
      submitting = false;
    },
  });

  let fileInput: HTMLInputElement;
  let file: File | null = null;
  const fileList = fileProxy(form, 'file');
  fileList.subscribe(() => {
    // $fileList.item(0) などの前に実行しておく
    if (Object.keys($fileList).length === 0) {
      return;
    }

    file = $fileList.item(0);

    if ($fileList.length === 0) {
      return;
    }
    if ($fileList.length > 1) {
      alert(`エラーが発生しました。`);
      clearFile();
      return;
    }
    if (file === null) {
      return;
    }
    if (file.size > MAX_FILE_SIZE_IN_BYTES) {
      alert(
        `エラーが発生しました。ファイルサイズの上限は${getSizeInMB(MAX_FILE_SIZE_IN_BYTES)}MBです。`
      );
      clearFile();
      return;
    }
  });

  function clearFile() {
    // fileInput.value = ''
    // がない場合、
    // - fileList.subscribe() 内でこの関数 clearFile() を呼び出した場合は、
    //   fileList.subscribe() がもう一度呼び出されてしまう。
    //   その場合、fileList の中身は変わらないようで、同じ処理が2度実行されてしまう。
    // - ファイルを削除するボタンを押して呼び出された場合は、
    //   - fileList.set(undefined)
    //     だけだと
    //     アップロード
    //     → (x) ボタンでファイルを削除
    //     → 再度アップロード
    //     したときにファイル名が表示されない。
    //   - fileInput.value = ''
    //     だけだと、ファイル名が表示され続けてしまう。
    fileList.set(undefined);
    fileInput.value = '';
  }

  onMount(() => {
    if ($defaultPrompt) {
      $form.contents = $defaultPrompt;
      $defaultPrompt = undefined;
    }
  });

  function handleOnMouseEnterAssistant(assistant: Assistant) {
    focusingAssistant = true;
    focusedAssistant = assistant;
  }

  function handleOnMouseLeaveAssistant() {
    focusingAssistant = false;
  }

  async function handleSubmit(event: KeyboardEvent | Event) {
    event.preventDefault();
    const result = await validateForm();
    if (result.valid) {
      submit();
      submitting = true;
    }
  }
</script>

<div class="h-full w-full text-black flex flex-col bg-white items-center">
  <div class="flex flex-col gap-4 items-start mt-[54px] w-full max-w-[820px]">
    <div class="flex flex-row gap-4 items-center">
      <RobotOutline class="text-[30px]" />
      <p class="text-[30px] font-bold">一般利用</p>
    </div>
    <p class="text-[15px] font-normal">
      ChatGPTと自由に会話が可能です。<br />
      以下からアシスタントを選択することで簡単に会話ができます（任意）
    </p>
  </div>

  <div
    class="flex-1 h-full overflow-scroll grid grid-cols-2 lg:grid-cols-3 gap-7 mt-8 content-start"
  >
    {#each assistants as assistant (assistant.id)}
      <button
        class="w-[254px] min-h-[178px] border-[3px] rounded-xl gap-2 flex flex-col hover:bg-gray-100 cursor-pointer p-4"
        class:border-base={selectedAssistant?.id === assistant.id}
        class:border-shadow={selectedAssistant?.id !== assistant.id}
        on:mouseenter={() => handleOnMouseEnterAssistant(assistant)}
        on:mouseleave={handleOnMouseLeaveAssistant}
        on:click={() => {
          const alreadySelected = selectedAssistant?.id === assistant.id;
          selectedAssistant = alreadySelected ? undefined : assistant;
        }}
      >
        <div class="flex flex-row justify-between items-center gap-2 w-full pr-3">
          <div class="flex flex-row items-start justify-start gap-2 w-full">
            <p class="text-base">{assistant.icon}</p>
            <p class="font-bold text-base truncate">{assistant.name}</p>
          </div>
          {#if focusingAssistant}
            <a
              class="text-sm"
              href={`/assistant/edit/${assistant.id}`}
              hidden={focusedAssistant?.id !== assistant.id}
            >
              <Pencil class="text-black" size="18" />
            </a>
          {/if}
        </div>
        <p class="font-normal text-xs text-description text-start leading-[20px]">
          {assistant.description}
        </p>
      </button>
    {/each}
    <a
      href="/assistant/create"
      class="w-[254px] border-dashed h-[178px] border-[3px] rounded-xl gap-2 flex flex-col justify-center items-center hover:bg-gray-100"
    >
      <Plus class="rounded-full border-2 border-black text-black" size="20" />
      <span class="text-base">新規アシスタントを作成</span>
    </a>
  </div>

  <div class="w-full flex flex-col items-center border-t-[1px] border-[#545454]">
    <div class="flex flex-col items-end w-full gap-6 px-32 py-8">
      {#if submitting}
        <div class="w-full max-w-[1044px] mx-auto z-10 flex items-center justify-start gap-[10px]">
          <span class="text-[#737376] loading loading-spinner loading-xs h-[14px]"></span>
          <p class="text-[#737376] text-base">リクエストを送信中です...</p>
        </div>
      {/if}

      <div class="flex flex-col w-full gap-1.5 border-black border-[1px] rounded-[6px]">
        <!--
          {#if file}
          だと、
          clearFile()
          をしても表示され続けるので
          $fileList.length === 1
          を追加した。
        -->
        {#if file && $fileList.length === 1}
          <div class="ml-[48px] mt-4">
            <UploadedFileName filename={file.name} handleClearButtonClick={() => clearFile()} />
          </div>
        {/if}
        <form method="POST" enctype="multipart/form-data" use:enhance class="w-full relative">
          <input
            type="hidden"
            name="assistantId"
            value={selectedAssistant ? selectedAssistant.id : ''}
          />
          <input type="hidden" name="modelType" value="GPT_4O" />
          <button
            type="button"
            on:click={() => fileInput.click()}
            class="absolute top-1/3 left-[14px]"
          >
            <PaperClip size="20" />
          </button>
          <input
            type="file"
            name="file"
            bind:files={$fileList}
            bind:this={fileInput}
            accept={ACCEPTED_FILENAME_EXTENSION.join(',')}
            class="hidden"
          />
          <ResizableTextArea
            name="contents"
            bind:value={$form.contents}
            onPressEnter={handleSubmit}
            placeholder={'テキストを入力して会話を開始'}
            class="w-full pr-6 pl-[48px] py-[10px] rounded-[6px] outline-none max-h-[149px] resize-none "
          />
          <button
            disabled={$form.contents === ''}
            on:click={handleSubmit}
            class="text-[#0165A3] disabled:text-gray-300 absolute top-1/3 right-2"
          >
            <Send size="20" />
          </button>
        </form>
      </div>
    </div>
  </div>
</div>

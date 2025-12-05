<script lang="ts">
  import Send from 'svelte-material-icons/Send.svelte';
  import Pencil from 'svelte-material-icons/PencilOutline.svelte';
  import FileOutline from 'svelte-material-icons/FileOutline.svelte';
  import { superForm, filesProxy } from 'sveltekit-superforms/client';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import ResizableTextArea from '$lib/components/ui/input/ResizableTextArea.svelte';
  import type { QAndAAssistant } from '$lib/features/q_and_a/entities/qAndAAssistant';
  import { createQAndAThreadSchema } from '$lib/features/q_and_a/qAndASchema';
  import QAndAAssistantEditDialog from '$lib/components/ui/modal/QAndAAssistantEditDialog.svelte';
  import FAQOutline from 'svelte-material-icons/FrequentlyAskedQuestions.svelte';
  import QAndAAssistantDetailDialog from '$lib/components/ui/modal/QAndAAssistantDetailDialog.svelte';
  import MessageDocumentInput from '$lib/components/ui/input/MessageDocumentInput.svelte';
  import { ACCEPTED_FILENAME_EXTENSION_FOR_ALL } from '$lib/features/message_document/consts/fileRestrictions';
  import UploadedFileName from '$lib/components/ui/file/UploadedFileName.svelte';

  const MODAL_ID_EDIT_CHAT_MODEL = 'edit-b6c05d18';
  const MODAL_ID_DETAIL_CHAT_MODEL = 'detail-c2d5e3f4';

  export let data;
  let assistants: QAndAAssistant[] = [];
  $: assistants = data.assistants;

  let focusingAssistant: boolean = false;
  let focusedAssistant: QAndAAssistant | undefined = undefined;
  let selectedAssistant: QAndAAssistant | undefined = undefined;

  let submitting: boolean = false;

  const { form, submit, enhance, validateForm, errors, allErrors } = superForm(
    data.createThreadForm,
    {
      validators: zodClient(createQAndAThreadSchema),
      onUpdate: () => {
        submitting = false;
      },
    }
  );

  let messageDocumentInput: MessageDocumentInput;
  const fileList = filesProxy(form, 'files');

  async function handleSubmit(event: KeyboardEvent | Event) {
    event.preventDefault();
    const result = await validateForm();
    if (result.valid) {
      submit();
      submitting = true;
    }
  }

  function showModelDetailsModal() {
    window[MODAL_ID_DETAIL_CHAT_MODEL].showModal();
  }

  function showModelEditModal() {
    window[MODAL_ID_EDIT_CHAT_MODEL].showModal();
  }

  function handleOnMouseEnterAssistant(assistant: QAndAAssistant) {
    focusingAssistant = true;
    focusedAssistant = assistant;
  }

  function handleOnMouseLeaveAssistant() {
    focusingAssistant = false;
  }
</script>

<div class="h-full w-full text-black flex flex-col bg-white items-center">
  <div class="flex flex-col gap-4 items-start mt-[54px] w-full max-w-[820px]">
    <div class="flex flex-row gap-4 items-center">
      <FAQOutline class="text-[30px]" />
      <p class="text-[30px] font-bold">Q&A（β）</p>
    </div>
    <p class="text-[15px] font-normal">
      事前に格納されたファイルの中から、入力された質問に回答します
    </p>
  </div>

  <div
    class="flex-1 h-full overflow-scroll grid grid-cols-2 lg:grid-cols-3 gap-7 mt-8 content-start"
  >
    {#each assistants as assistant (assistant.id)}
      <button
        class="w-[254px] h-[68px] border-[3px] rounded-xl gap-2 hover:bg-gray-100 cursor-pointer flex flex-row items-center p-4 justify-between"
        class:border-base={selectedAssistant?.id === assistant.id}
        class:border-shadow={selectedAssistant?.id !== assistant.id}
        on:mouseenter={() => handleOnMouseEnterAssistant(assistant)}
        on:mouseleave={handleOnMouseLeaveAssistant}
        on:click|stopPropagation={() => {
          const alreadySelected = selectedAssistant?.id === assistant.id;
          selectedAssistant = alreadySelected ? undefined : assistant;
        }}
      >
        <p class="font-bold text-base line-clamp-2">
          {assistant.icon}
          {assistant.name}
        </p>

        {#if focusingAssistant && focusedAssistant?.id === assistant.id}
          <div class="flex flex-row mr-1 text-sm text-black">
            <button on:click={showModelDetailsModal}>
              <FileOutline size="18" />
            </button>
            <button on:click={showModelEditModal}>
              <Pencil size="18" />
            </button>
          </div>
        {/if}
      </button>
    {/each}
  </div>

  <div class="w-full flex flex-col items-center border-t-[1px] border-[#545454]">
    <div class="flex flex-col items-end w-full gap-6 px-32 py-8">
      {#if submitting}
        <div class="w-full max-w-[1044px] mx-auto z-10 flex items-center justify-start gap-[10px]">
          <span class="text-[#737376] loading loading-spinner loading-xs h-[14px]"></span>
          <p class="text-[#737376] text-base">リクエストを送信中です...</p>
        </div>
      {/if}

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
      <form
        method="POST"
        action="?/createThread"
        enctype="multipart/form-data"
        use:enhance
        class="w-full relative flex gap-2"
      >
        <input
          type="hidden"
          name="assistantId"
          value={selectedAssistant ? selectedAssistant.id : ''}
        />
        <input type="hidden" name="modelType" value="GPT_4O" />
        <MessageDocumentInput
          bind:this={messageDocumentInput}
          bind:fileList={$fileList}
          accept={ACCEPTED_FILENAME_EXTENSION_FOR_ALL.join(',')}
          disabled={selectedAssistant === undefined}
        />
        <ResizableTextArea
          name="contents"
          bind:value={$form.contents}
          onPressEnter={handleSubmit}
          class="w-full pl-[48px] px-6 py-[10px] border-black outline outline-1 outline-black rounded-[6px] max-h-[149px] resize-none"
          placeholder={selectedAssistant
            ? 'テキストを入力して質問を開始'
            : 'まずはQ&Aボットを選択してください'}
          disabled={selectedAssistant === undefined}
        />
        <button
          disabled={selectedAssistant === undefined || allErrors.length > 0}
          on:click={handleSubmit}
          class="text-[#0165A3] disabled:text-gray-300 absolute top-1/3 right-2"
        >
          <Send class={$allErrors.length > 0 ? 'text-[#737376]' : 'text-[#0165A3]'} size="20" />
        </button>
      </form>
    </div>
  </div>
</div>

{#if focusedAssistant}
  <QAndAAssistantDetailDialog
    data={data.refreshAssistantDocumentForm}
    action="?/refreshAssistantDocument"
    modalId={MODAL_ID_DETAIL_CHAT_MODEL}
    assistant={focusedAssistant}
    indexSources={focusedAssistant.indexSources}
    userFeedbacks={focusedAssistant.userFeedbacks}
  />
{/if}

{#if focusedAssistant}
  <QAndAAssistantEditDialog
    data={data.updateQAndAAssistantForm}
    action="?/updateQAndAAssistant"
    modalId={MODAL_ID_EDIT_CHAT_MODEL}
    assistant={focusedAssistant}
    indexSources={focusedAssistant.indexSources}
    groups={data.groups}
  />
{/if}

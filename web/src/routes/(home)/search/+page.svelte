<script lang="ts">
  import Send from 'svelte-material-icons/Send.svelte';
  import Pencil from 'svelte-material-icons/PencilOutline.svelte';
  import FileOutline from 'svelte-material-icons/FileOutline.svelte';
  import { superForm } from 'sveltekit-superforms/client';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import { createSearchThreadSchema } from '$lib/features/search/search_schema';
  import ResizableTextArea from '$lib/components/ui/input/ResizableTextArea.svelte';
  import type { SearchAssistant } from '$lib/features/search/entities/searchAssistant';
  import SearchAssistantEditDialog from '$lib/components/ui/modal/SearchAssistantEditDialog.svelte';
  import SearchOutline from 'svelte-material-icons/Magnify.svelte';
  import SearchAssistantDetailDialog from '$lib/components/ui/modal/SearchAssistantDetailDialog.svelte';

  const MODAL_ID_EDIT_CHAT_MODEL = 'edit-b6c05d18';
  const MODAL_ID_DETAIL_CHAT_MODEL = 'detail-c2d5e3f4';

  export let data;
  let assistants: SearchAssistant[] = [];
  $: assistants = data.assistants;

  let focusingAssistant: boolean = false;
  let focusedAssistant: SearchAssistant | undefined = undefined;
  let selectedAssistant: SearchAssistant | undefined = undefined;

  let submitting: boolean = false;

  const { form, submit, enhance, validateForm } = superForm(data.createThreadForm, {
    validators: zodClient(createSearchThreadSchema),
    onUpdate: () => {
      submitting = false;
    },
  });

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

  function handleOnMouseEnterAssistant(assistant: SearchAssistant) {
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
      <SearchOutline class="text-[30px]" />
      <p class="text-[30px] font-bold">ファイル検索（β）</p>
    </div>
    <p class="text-[15px] font-normal">
      事前に格納されたファイルの中から、入力された文章に近い箇所を検索します
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

      <form method="POST" action="?/createThread" use:enhance class="w-full relative">
        <input
          type="hidden"
          name="assistantId"
          value={selectedAssistant ? selectedAssistant.id : ''}
        />
        <input type="hidden" name="modelType" value="GPT_4O" />
        <ResizableTextArea
          name="contents"
          bind:value={$form.contents}
          onPressEnter={handleSubmit}
          class="w-full px-6 py-[10px] border-black outline outline-1 outline-black rounded-[6px] max-h-[149px] resize-none"
          placeholder={selectedAssistant
            ? 'テキストを入力して質問を開始'
            : 'まずはファイルリストを選択してください'}
          disabled={selectedAssistant === undefined}
        />
        <button
          type="submit"
          disabled={selectedAssistant === undefined}
          on:click={handleSubmit}
          class="text-[#0165A3] disabled:text-gray-300 absolute top-1/3 right-2"
        >
          <Send size="20" />
        </button>
      </form>
    </div>
  </div>
</div>

{#if focusedAssistant}
  <SearchAssistantDetailDialog
    data={data.refreshAssistantDocumentForm}
    action="?/refreshAssistantDocument"
    modalId={MODAL_ID_DETAIL_CHAT_MODEL}
    assistant={focusedAssistant}
    indexSources={focusedAssistant.indexSources}
  />
{/if}

{#if focusedAssistant}
  <SearchAssistantEditDialog
    data={data.updateSearchAssistantForm}
    action="?/updateSearchAssistant"
    modalId={MODAL_ID_EDIT_CHAT_MODEL}
    assistant={focusedAssistant}
    indexSources={focusedAssistant.indexSources}
    groups={data.groups}
  />
{/if}

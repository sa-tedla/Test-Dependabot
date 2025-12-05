<script lang="ts">
  import { superForm } from 'sveltekit-superforms/client';
  import Close from 'svelte-material-icons/Close.svelte';
  import { updateSearchAssistantSchema } from '$lib/schema';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import EmojiPicker from '$lib/components/ui/EmojiPicker.svelte';
  import type { Group, IndexSource } from '$lib/entities';
  import type { SearchAssistant } from '$lib/features/search/entities/searchAssistant';
  import DeleteButton from '$lib/components/ui/DeleteButton.svelte';

  export let data;
  export let action: string;
  export let modalId: string;
  export let assistant: SearchAssistant;
  export let indexSources: IndexSource[];
  export let groups: Group[];

  const { form, errors, enhance, allErrors, submitting } = superForm(data, {
    applyAction: false,
    validators: zodClient(updateSearchAssistantSchema),
    onUpdate: ({ result }) => {
      if (result.type === 'success') {
        window[modalId].close();
      }
    },
  });

  $: {
    $form.name = assistant.name;
    $form.icon = assistant.icon;
    $form.description = assistant.description;
    $form.sources = indexSources.map((indexSource) => indexSource.source);
    $form.groupIds = assistant.groups.map((group) => group.id);
  }

  function removeSourceFromFormSources(e: Event, index: number) {
    e.preventDefault();
    $form.sources = [...$form.sources.slice(0, index), ...$form.sources.slice(index + 1)];
  }

  function addEmtptyToFormSources(e: Event) {
    e.preventDefault();
    $form.sources = [...$form.sources, ''];
  }
</script>

<dialog id={modalId} class="modal">
  <form method="dialog" class="modal-box w-full max-w-[629px] text-black rounded-[10px] p-0">
    <button class="btn btn-sm btn-circle btn-ghost absolute right-5 top-5 focus:outline-none">
      <Close class="text-[26px]" />
    </button>
    <form method="POST" use:enhance {action} class="flex flex-col mt-[30px] mx-[40px]">
      <input name="assistantId" type="hidden" bind:value={assistant.id} />
      <input name="indexId" type="hidden" bind:value={assistant.index.id} />
      <p class="font-bold text-lg">ファイルリストを編集</p>
      <div class="mt-[18px]">
        <label for="sources" class="block text-sm font-medium leading-6 text-[15px]">
          読み込ませたいファイルのある Box ディレクトリを指定してください
        </label>
        <div class="flex flex-col mt-2">
          {#each $form.sources as source, index (index)}
            <div class="flex flex-row gap-2 mt-[6px]">
              <input
                type="text"
                id="sources"
                name="sources"
                bind:value={source}
                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-4"
              />
              {#if $form.sources.length > 1}
                <DeleteButton on:click={(e) => removeSourceFromFormSources(e, index)} />
              {/if}
            </div>
            {#if $errors.sources && $errors.sources[index]}
              <span class="invalid text-red-600">{$errors.sources[index][0]}</span>
            {/if}
          {/each}
        </div>
        <button class="mt-2 text-blue-500 text-sm" on:click={addEmtptyToFormSources}>
          + ディレクトリを追加
        </button>
      </div>

      <div class="mt-4">
        <label for="name" class="block text-sm font-medium leading-6 text-[15px]">
          ファイルリストの名前
        </label>
        <div class="mt-2">
          <input
            type="text"
            name="name"
            id="name"
            bind:value={$form.name}
            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-4"
          />
          {#if $errors.name}
            <span class="invalid text-red-600">{$errors.name}</span>
          {/if}
        </div>
      </div>

      <div class="mt-4">
        <label for="description" class="block text-sm leading-6 text-[15px] font-bold">
          説明
        </label>
        <div class="mt-2">
          <textarea
            id="description"
            name="description"
            bind:value={$form.description}
            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 disabled:bg-white sm:text-sm sm:leading-6 p-4"
          />
        </div>
        {#if $errors.description}
          <span class="invalid text-red-600">{$errors.description}</span>
        {/if}
      </div>

      <div class="mt-4 flex flex-col gap-2">
        <label class="font-bold text-sm mb-2" for="icon">アイコン（絵文字）</label>
        <input id="icon" name="icon" type="hidden" bind:value={$form.icon} />
        <EmojiPicker selectedEmoji={$form.icon} selectEmoji={(e) => ($form.icon = e)} />
        {#if $errors.icon}
          <p class="text-red-600 text-sm mt-1">{$errors.icon}</p>
        {/if}
      </div>

      <div class="mt-4 flex flex-col gap-2">
        <p class="font-bold text-sm mb-2">公開範囲</p>
        <div class="flex flex-row gap-3">
          {#each groups as group (group.id)}
            <div class="flex flex-row gap-[6px]">
              <input
                type="checkbox"
                name="groupIds"
                value={group.id}
                class="checkbox radio-info"
                checked={$form.groupIds.includes(group.id)}
              />
              <p>{group.name}</p>
            </div>
          {/each}
          <div class="flex flex-row gap-[6px]">
            <input type="checkbox" checked class="checkbox radio-info" disabled={true} />
            <p>自分</p>
          </div>
        </div>
      </div>

      <div class="flex flex-col justify-center items-center my-[34px]">
        <button
          type="submit"
          class="btn no-animation btn-neutral"
          disabled={$allErrors?.length > 0}
        >
          {#if $submitting}
            <span class="loading loading-spinner"></span>
          {/if}
          編集を完了する
        </button>
      </div>
    </form>
  </form>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

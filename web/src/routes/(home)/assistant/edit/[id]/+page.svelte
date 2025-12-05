<script lang="ts">
  import { superForm } from 'sveltekit-superforms/client';
  import Close from 'svelte-material-icons/Close.svelte';
  import EmojiPicker from '$lib/components/ui/EmojiPicker.svelte';
  import { addToast } from '$lib/components/ui/Toaster.svelte';
  import { createDialog, melt } from '@melt-ui/svelte';
  import ChevronLeft from 'svelte-material-icons/ChevronLeft.svelte';
  import { deleteAssistantSchema, updateAssistantSchema } from '$lib/schema';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import { goto } from '$app/navigation';

  export let data;

  const {
    elements: { trigger, portalled, close, overlay, content, title },
    states: { open },
  } = createDialog({ role: 'alertdialog', forceVisible: true });

  const { form, enhance, allErrors, errors } = superForm(data.updateAssistantForm, {
    applyAction: false,
    validators: zodClient(updateAssistantSchema),
    onResult: async ({ result }) => {
      if (result.type === 'redirect') {
        addToast({
          data: {
            title: `「${$form.name}」の編集が完了しました`,
          },
        });
        await goto(result.location);
      }
    },
  });

  const { form: deleteAssistantForm, enhance: deleteAssistantEnhance } = superForm(
    data.deleteAssistantForm,
    {
      applyAction: false,
      validators: zodClient(deleteAssistantSchema),
      onResult: async ({ result }) => {
        if (result.type === 'redirect') {
          addToast({
            data: {
              title: `「${$form.name}」の削除が完了しました`,
            },
          });
          await goto(result.location);
        }
      },
    }
  );
</script>

<div class="w-full h-full flex flex-col items-start px-[152px] py-[23px] bg-white">
  <button on:click={() => window.history.back()} class="flex flex-row gap-1 text-gray-500 text-sm">
    <ChevronLeft class="text-[20px]" />
    <span>前の画面に戻る</span>
  </button>
  <form class="" method="post" action="?/updateAssistant" use:enhance>
    <div class="flex flex-row w-[648px] justify-between">
      <h1 class="font-bold text-[30px] pt-8 mb-10">アシスタントの編集</h1>
      <button
        class="border border-[#cc0808] text-[#cc0808] font-normal rounded-md my-8 px-3"
        type="button"
        use:melt={$trigger}
      >
        アシスタントを削除
      </button>
    </div>

    <input type="hidden" name="assistantId" value={$form.assistantId} />
    <div class="flex flex-col gap-8">
      <div class="flex flex-col gap-2">
        <label class="font-bold text-sm mb-2" for="title">アシスタント名</label>
        <input
          type="text"
          class="w-[400px] h-[43px] border-2 border-[#BFBFBF] rounded-md p-2"
          name="name"
          bind:value={$form.name}
          aria-invalid={$errors.name ? 'true' : undefined}
        />
        {#if $errors.name}
          <p class="text-red-600 text-sm mt-1">{$errors.name}</p>
        {/if}
      </div>

      <div class="flex flex-col gap-2">
        <label class="font-bold text-sm mb-2" for="icon">アイコン（絵文字）</label>
        <input name="icon" type="hidden" bind:value={$form.icon} />
        <EmojiPicker selectedEmoji={$form.icon} selectEmoji={(e) => ($form.icon = e)} />
        {#if $errors.icon}
          <p class="text-red-600 text-sm mt-1">{$errors.icon}</p>
        {/if}
      </div>

      <div class="flex flex-col gap-2">
        <label for="description" class="font-bold text-sm mb-2">説明</label>
        <textarea
          class="w-[648px] h-[100px] border-2 border-[#BFBFBF] rounded-md p-2 resize-none"
          name="description"
          bind:value={$form.description}
          aria-invalid={$errors.description ? 'true' : undefined}
        />
        {#if $errors.description}
          <p class="text-red-600 text-sm mt-1">{$errors.description}</p>
        {/if}
      </div>

      <div class="flex flex-col gap-2">
        <label for="prompt" class="font-bold text-sm mb-2">役割（プロンプト）</label>
        <textarea
          class="w-[648px] h-[100px] border-2 border-[#BFBFBF] rounded-md p-2 resize-none"
          name="systemPrompt"
          bind:value={$form.systemPrompt}
          aria-invalid={$errors.systemPrompt ? 'true' : undefined}
        />
        {#if $errors.systemPrompt}
          <p class="text-red-600 text-sm mt-1">{$errors.systemPrompt}</p>
        {/if}
      </div>

      <div class="flex flex-col gap-2">
        <p class="font-bold text-sm mb-2">公開範囲</p>
        <div class="flex flex-row gap-3">
          {#each data.groups as group (group.id)}
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
      <button
        class="w-[171px] h-[54px] bg-base text-white rounded-md mt-[49px]"
        disabled={$allErrors.length > 0}
        type="submit"
        >編集を完了する
      </button>
    </div>
  </form>
</div>

<div class="" use:melt={$portalled}>
  {#if $open}
    <div use:melt={$overlay} class="fixed inset-0 z-50 bg-black/50" />
    <div
      class="fixed left-[50%] top-[50%] z-50 max-h-[85vh] w-[90vw]
          max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-md bg-white
          p-6 shadow-lg"
      use:melt={$content}
    >
      <button
        class="btn btn-sm btn-circle btn-ghost absolute right-5 top-5 focus:outline-none"
        use:melt={$close}
      >
        <Close class="text-[26px]" />
      </button>
      <div class="flex flex-col gap-14 items-center py-7">
        <p use:melt={$title} class="text-[18px] font-bold">
          本当にこのアシスタントを削除しますか？
        </p>
        <form
          method="POST"
          action="?/deleteAssistant"
          class="flex flex-col gap-7"
          use:deleteAssistantEnhance
        >
          <input type="hidden" name="assistantId" value={$deleteAssistantForm.assistantId} />
          <button type="submit" class="bg-[#CC0808] text-white text-[15px] px-5 py-2 rounded-md"
            >削除する</button
          >
          <button type="button" class="text-[15px]" on:click={() => window.history.back()}>
            前の画面に戻る
          </button>
        </form>
      </div>
    </div>
  {/if}
</div>

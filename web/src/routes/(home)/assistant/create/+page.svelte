<script lang="ts">
  import { superForm } from 'sveltekit-superforms/client';
  import ChevronLeft from 'svelte-material-icons/ChevronLeft.svelte';
  import { createAssistantSchema } from '$lib/schema';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import { goto } from '$app/navigation';
  import EmojiPicker from '$lib/components/ui/EmojiPicker.svelte';
  import { addToast } from '$lib/components/ui/Toaster.svelte';

  export let data;

  const { form, enhance, allErrors, errors } = superForm(data.form, {
    applyAction: false,
    validators: zodClient(createAssistantSchema),
    onResult: async ({ result }) => {
      if (result.type === 'redirect') {
        addToast({
          data: {
            title: `「${$form.name}」の追加が完了しました`,
          },
        });
        await goto(result.location);
      }
    },
  });
</script>

<div class="w-full h-full flex flex-col items-start px-[152px] py-[23px] bg-white">
  <button on:click={() => window.history.back()} class="flex flex-row gap-1 text-gray-500 text-sm">
    <ChevronLeft class="text-[20px]" />
    <span>前の画面に戻る</span>
  </button>
  <form method="POST" use:enhance>
    <h1 class="font-bold text-[30px] pt-6 mb-10">アシスタントの作成</h1>
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
        <label class="font-bold text-sm mb-2" for="description">説明</label>
        <textarea
          class="w-[651px] h-[100px] border-2 border-[#BFBFBF] rounded-md p-2 resize-none"
          name="description"
          bind:value={$form.description}
          aria-invalid={$errors.description ? 'true' : undefined}
        />
        {#if $errors.description}
          <p class="text-red-600 text-sm mt-1">{$errors.description}</p>
        {/if}
      </div>

      <div class="flex flex-col gap-2">
        <label class="font-bold text-sm mb-2" for="prompt">役割（プロンプト）</label>
        <textarea
          class="w-[651px] h-[100px] border-2 border-[#BFBFBF] rounded-md p-2 resize-none"
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
                checked
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
    </div>

    <button
      type="submit"
      disabled={$allErrors.length > 0}
      class="w-[171px] h-[54px] text-white rounded-md mt-[49px] bg-base disabled:bg-gray-500"
    >
      作成する
    </button>
  </form>
</div>

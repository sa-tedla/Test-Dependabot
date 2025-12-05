<script lang="ts">
  import { superForm } from 'sveltekit-superforms/client';
  import Close from 'svelte-material-icons/Close.svelte';
  import type { Assistant } from '$lib/entities';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import { userFeedbackV2Schema } from '$lib/schema';

  export let data;
  export let action: string;
  export let modalId: string;
  export let assistant: Assistant;
  export let defaultQuestion: string;

  const { form, enhance, errors, allErrors, submitting } = superForm(data, {
    applyAction: false,
    validators: zodClient(userFeedbackV2Schema),
    onUpdated: () => {
      // バリデーションエラーがない場合のみモーダルを閉じる
      if (!$allErrors || $allErrors.length === 0) {
        (document.getElementById(modalId) as HTMLDialogElement)?.close();
      }
    },
  });

  $: $form.question = defaultQuestion;
</script>

<dialog id={modalId} class="modal">
  <form method="dialog" class="modal-box w-full max-w-[629px] text-black flex flex-col">
    <button class="btn btn-sm btn-circle btn-ghost absolute right-5 top-5 focus:outline-none">
      <Close class="text-[26px]" />
    </button>
    <p class="text-[18px] font-bold mb-[18px]">回答を修正する</p>

    <form method="POST" {action} class="w-full flex flex-col items-center gap-4" use:enhance>
      <input type="hidden" name="assistantId" value={assistant.id} />
      <div class="w-full space-y-2">
        <label for="question" class="text-[15px] font-bold">[必須] 質問</label>
        <textarea
          id="question"
          rows="2"
          name="question"
          bind:value={$form.question}
          class="p-3 w-full rounded-[6px] border-[0.5px] border-black"
        />
        {#if $errors.question}<span class="invalid text-red-600">{$errors.question}</span>{/if}
      </div>
      <div class="w-full space-y-2">
        <label for="answer" class="text-[15px] font-bold">[任意] 正しい回答</label>
        <textarea
          id="answer"
          name="answer"
          rows="2"
          bind:value={$form.answer}
          class="p-3 w-full rounded-[6px] border-[0.5px] border-black"
          placeholder="正しい回答"
        />
        {#if $errors.answer}<span class="invalid text-red-600">{$errors.answer}</span>{/if}
      </div>
      <div class="w-full space-y-2">
        <label for="source" class="text-[15px] font-bold">
          [必須] 回答の情報元・ソース（BoxのファイルURL）
        </label>
        <input
          id="source"
          name="source"
          bind:value={$form.source}
          class="p-2 w-full rounded-[6px] border-[0.5px] border-black"
          placeholder="https://oriconsul.app.box.com/file/123456789"
        />
        {#if $errors.source}<span class="invalid text-red-600">{$errors.source}</span>{/if}
      </div>
      <div class="w-full space-y-2">
        <label for="sourcePage" class="text-[15px] font-bold">[任意] 回答があるページ</label>
        <input
          id="sourcePage"
          name="sourcePage"
          type="number"
          min="1"
          max="1000"
          bind:value={$form.sourcePage}
          class="p-2 w-full rounded-[6px] border-[0.5px] border-black"
        />
        {#if $errors.sourcePage}<span class="invalid text-red-600">{$errors.sourcePage}</span>{/if}
      </div>
      <button class="btn mt-4" disabled={$allErrors?.length > 0 || $submitting}>
        {#if $submitting}<span class="loading loading-spinner"></span>{/if}
        送信する
      </button>
    </form>
  </form>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

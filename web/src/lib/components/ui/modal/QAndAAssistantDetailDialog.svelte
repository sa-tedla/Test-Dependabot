<script lang="ts">
  import { superForm } from 'sveltekit-superforms/client';
  import Close from 'svelte-material-icons/Close.svelte';
  import type { DocumentModalUserFeedback, IndexSource } from '$lib/entities';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import { refreshAssistantDocumentSchema } from '$lib/schema';
  import type { QAndAAssistant } from '$lib/features/q_and_a/entities/qAndAAssistant';

  export let data;
  export let action: string;
  export let modalId: string;
  export let assistant: QAndAAssistant;
  export let indexSources: IndexSource[];
  export let userFeedbacks: DocumentModalUserFeedback[];

  const { enhance } = superForm(data, {
    applyAction: false,
    validators: zodClient(refreshAssistantDocumentSchema),
    onUpdated: () => {
      window[modalId].close();
    },
  });
</script>

<dialog id={modalId} class="modal">
  <form method="dialog" class="modal-box w-full max-w-[629px] text-black">
    <button class="btn btn-sm btn-circle btn-ghost absolute right-5 top-5 focus:outline-none">
      <Close class="text-[26px]" />
    </button>
    <form method="POST" {action} class="flex flex-col items-center mt-[48px]" use:enhance>
      <input name="assistantId" type="hidden" bind:value={assistant.id} />
      <div class="w-full max-w-[457px]">
        <div class="flex justify-between items-center">
          <h3 class="font-bold text-lg">格納ファイル一覧</h3>
          {#if ['PREPARING', 'PROGRESSING'].includes(assistant.assistantStatus ?? '')}
            <button class="btn" disabled>
              <span class="loading loading-spinner"></span>
              更新中
            </button>
          {:else}
            <button type="submit" class="btn"> 更新する </button>
          {/if}
        </div>

        {#if assistant.assistantStatus === 'ERROR'}
          <p class="mt-6 text-red-600">
            ドキュメントの読み込みにエラーが発生しています。読み込ませたいファイルのある Box
            ディレクトリを確認してください。解決しない場合は、管理者に問い合わせください。
          </p>
        {/if}

        <div class="w-full flex flex-col mt-6">
          <p class="text-base font-bold">指定ディレクトリ</p>
          {#if indexSources.length > 0}
            <div class="flex flex-col">
              {#each indexSources as indexSource (indexSource.id)}
                <a class="font-bold underline mt-4 mb-2" href={indexSource.source} target="_blank"
                  >{indexSource.source}</a
                >
                {#each indexSource.files as file}
                  <p><span class="font-bold">・</span>{file}</p>
                {/each}
              {/each}
            </div>
          {:else}
            <p>格納ファイルがありません</p>
          {/if}
        </div>

        <div class="w-full flex flex-col mt-6">
          <p class="text-base font-bold">再学習</p>
          {#if userFeedbacks.length > 0}
            {#each userFeedbacks as feedback (feedback.id)}
              <div class="mt-2.5 text-sm">
                <p>Q. {feedback.question}</p>
                <p>A. {feedback.answer}</p>
                <p class="text-[8px] text-[#797C7B]">{feedback.user.email}</p>
                <hr />
              </div>
            {/each}
          {:else}
            <p class="mt-2.5">再学習したデータはありません</p>
          {/if}
        </div>
      </div>
    </form>
  </form>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

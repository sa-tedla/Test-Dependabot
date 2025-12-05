<script lang="ts">
  import FileOutline from 'svelte-material-icons/FileOutline.svelte';
  import MessageAlert from 'svelte-material-icons/MessageAlert.svelte';
  import type { QAndAMessage } from '$lib/features/q_and_a/entities/qAndAMessage';
  import RobotOutline from 'svelte-material-icons/RobotOutline.svelte';
  import { canOpenReference, deduplicateReferences } from '$lib/utils/referenceUtils';

  export let message: QAndAMessage | undefined;
  export let submitUserFeedback: () => void = () => {};

  function onHandleSubmitUserFeedback() {
    submitUserFeedback();
  }
</script>

<div class="group flex gap-7 justify-center text-black py-[39px] px-20 relative">
  <RobotOutline class="text-[24px]" />
  {#if message}
    <div class="flex-1 flex flex-col gap-3 text-base whitespace-pre-wrap break-all">
      <p>{message.contents}</p>

      {#if message.references.length > 0}
        <div class="flex flex-row gap-2 flex-wrap mt-[10px] items-center text-xs">
          <p>参考ファイル</p>
          {#each deduplicateReferences(message.references).slice(0, 3) as reference, index (index)}
            <button
              type="button"
              class={`badge badge-outline text-xs h-[35px] space-x-1 ${!canOpenReference(reference) ? 'opacity-80 select-none' : 'text-black hover:bg-slate-200'}`}
              disabled={!canOpenReference(reference)}
              on:click={() => {
                if (canOpenReference(reference)) {
                  window.open(reference.source, '_blank');
                }
              }}
            >
              <FileOutline size="18px" />
              {#if reference.name === 'crm_qa_document.pdf'}
                <p class="text-black">ITサポートデスクの対応履歴を元に回答</p>
              {:else}
                <p class="text-black">{reference.name}</p>
              {/if}
            </button>
          {/each}
        </div>
      {/if}

      <div class="absolute right-[-24px] top-[12px] mt-1 bg-white">
        <div
          class="text-gray-600 hidden group-hover:block border-[0.5px] h-9 w-[44px] border-black rounded-[6px]"
        >
          <div class="flex h-full w-full items-center justify-center">
            <button on:click={onHandleSubmitUserFeedback}>
              <MessageAlert size="24" class="text-black" />
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

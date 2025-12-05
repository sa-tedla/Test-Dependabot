<script lang="ts">
  import FileOutline from 'svelte-material-icons/FileOutline.svelte';
  import { defaultPrompt } from '$lib/stores/defaultPrompt';
  import { goto } from '$app/navigation';
  import type { SearchMessage } from '$lib/features/search/entities/searchMessage';

  export let message: SearchMessage;

  function handleOnClickDoConversation(prompt: string) {
    $defaultPrompt = prompt;
    goto(`/assistant`);
  }
</script>

<div class="w-full flex gap-7 justify-center text-black py-[39px] px-4 bg-[#EEEEEE]">
  <div
    class="flex-1 relative flex flex-col gap-3 text-base whitespace-pre-wrap break-all max-w-[754px]"
  >
    <p>{message.contents}</p>
    <div class="flex flex-col gap-6">
      {#each message.references as reference}
        <div class="bg-white rounded-xl py-6 px-14 flex flex-col gap-4 w-full">
          <p>{reference.contents}</p>
          <div
            class="flex flex-row flex-wrap mt-[10px] mb-[20px] items-center justify-between text-xs"
          >
            <div class="flex flex-row gap-2 items-center">
              <p>参考ファイル</p>
              {#if reference.source !== ''}
                <a
                  class="badge badge-outline text-black hover:bg-slate-200 text-xs h-[35px] space-x-1"
                  href={reference.source}
                  target="_blank"
                >
                  <FileOutline size="18px" />
                  <p class="text-black">{reference.name}</p>
                </a>
              {:else}
                <div class="badge badge-outline text-xs h-[35px] space-x-1">
                  <FileOutline size="18px" />
                  <p class="text-black">{reference.name}</p>
                </div>
              {/if}
            </div>

            <button
              on:click={() => handleOnClickDoConversation(reference.contents)}
              class="border-[1.5px] border-[#0266A4] text-[#0266A4] rounded-md p-2 flex flex-row justify-center"
            >
              <p class="font-bold text-[13px]">この内容で会話する</p>
              <span class="font-bold tet-[12px]">（一般利用）</span>
            </button>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

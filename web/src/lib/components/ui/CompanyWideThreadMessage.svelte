<script lang="ts">
  import FileOutline from 'svelte-material-icons/FileOutline.svelte';
  import RobotOutline from 'svelte-material-icons/RobotOutline.svelte';
  import type { Message } from '$lib/entities';
  import type { MessageDocument } from '@prisma/client';

  export let message: Message;
  export let messageDocument: MessageDocument | undefined;
</script>

<div class="w-full px-5">
  {#if message.role === 'USER'}
    <div class="w-full flex flex-row-reverse">
      <div class="bg-[#0165A3] px-[19px] py-4 rounded-[6px] text-white max-w-[80%]">
        <p class="text-[15px] font-normal leading-[140%]">{message.contents}</p>
      </div>
    </div>
  {/if}
  {#if message.role === 'ASSISTANT'}
    <div class="flex flex-row gap-[10px] items-end">
      <RobotOutline class="text-[32px] text-[#B8B8B]" />
      <div class="bg-[#F2F2F2] px-[19px] py-4 rounded-[6px] max-w-[90%]">
        <p class="text-[15px] font-normal leading-[140%]">{message.contents}</p>
        <div class="divider my-[7px]" />

        {#if messageDocument !== undefined}
          <div class="flex flex-row text-[#737373] font-normal items-center gap-[6px]">
            <FileOutline class="text-[20px]" />
            <button
              class="leading-[140%] text-[13px] text-start"
              on:click={() => {
                if (messageDocument.source !== undefined) {
                  window.open(messageDocument.source, '_blank');
                }
              }}
            >
              {messageDocument.filename}
            </button>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

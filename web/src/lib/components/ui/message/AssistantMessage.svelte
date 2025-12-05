<script lang="ts">
  import RobotOutline from 'svelte-material-icons/RobotOutline.svelte';
  import AccountOutline from 'svelte-material-icons/AccountOutline.svelte';
  import type { Message } from '$lib/entities';
  import type { MessageDocument } from '@prisma/client';
  import UploadedFileName from '$lib/components/ui/file/UploadedFileName.svelte';

  export let message: Message;
  export let messageDocument: MessageDocument | undefined;
</script>

<div
  class="group flex gap-7 items-start text-black py-[39px] px-4"
  class:pt-[26px]={message.role !== 'USER'}
>
  {#if message.role !== 'USER'}
    <RobotOutline class="text-[24px]" />
  {:else}
    <AccountOutline class="text-[24px]" />
  {/if}

  <div class="flex-1 relative flex flex-col text-base whitespace-pre-wrap break-all gap-3.5">
    {#if messageDocument !== undefined}
      <UploadedFileName filename={messageDocument.filename} />
    {/if}
    <p>{message.contents}</p>
  </div>
</div>

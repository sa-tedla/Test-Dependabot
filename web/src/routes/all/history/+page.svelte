<script lang="ts">
  import { goto } from '$app/navigation';
  import ChevronRight from 'svelte-material-icons/ChevronRight.svelte';
  import type { Assistant, Thread } from '$lib/entities';
  import CompanyWideHeader from '$lib/components/companyWide/CompanyWideHeader.svelte';
  import EllipsisVertical from 'lucide-svelte/icons/ellipsis-vertical';
  import {
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuContent,
  } from '$lib/components/ui/dropdown-menu';
  import { cn } from '$lib/utils';
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import { deleteThreadSchema } from '$lib/features/all/schema';

  export let data;

  let openMap: { [key: string]: boolean } = {};

  superForm(data.form, {
    validators: zodClient(deleteThreadSchema),
  });

  async function gotoThread(assistant: Assistant, thread: Thread) {
    await goto(`/all/assistant/${assistant.id}/thread/${thread.id}`);
  }

  function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}/${month}/${day}`;
  }
</script>

<div class="w-full h-full rounded-[18px] overflow-hidden flex flex-col">
  <CompanyWideHeader title="質問履歴" showChevron={false} />

  <div class="p-5 overflow-y-auto">
    {#each data.companyWideThreads as { thread, assistant, lastEditedAt } (thread.id)}
      <div class="flex gap-1 group items-center justify-center">
        <button class="min-w-0 w-full" on:click={() => gotoThread(assistant, thread)}>
          <div class="h-auto flex flex-row justify-between gap-2 items-center">
            <div class="flex flex-col max-w-[90%] gap-[6px] py-3">
              <p class="truncate text-[15px] leading-[120%] text-start font-bold">
                {thread.title}
              </p>
              <div class="flex flex-row text-[15px] leading-[120%] text-start text-[#606063]">
                <p>{formatDate(lastEditedAt)} {assistant.name}</p>
              </div>
            </div>
            <ChevronRight class="w-5 text-[20px] text-[#0165A3]" />
          </div>
          <div class="divider m-0 h-[1px] after:h-[1px] before:h-[1px]" />
        </button>

        <div class={cn('hidden group-hover:block', openMap[thread.id] ? 'block' : '')}>
          <DropdownMenu bind:open={openMap[thread.id]}>
            <DropdownMenuTrigger>
              <EllipsisVertical class="text-[24px] text-[#0165A3]" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <form method="POST">
                <input type="hidden" name="threadId" value={thread.id} />
                <button type="submit" class="w-full">
                  <DropdownMenuItem>削除</DropdownMenuItem>
                </button>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    {/each}
  </div>
  <div class="w-full h-16" />
</div>

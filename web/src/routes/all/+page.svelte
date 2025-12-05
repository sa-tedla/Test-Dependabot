<script lang="ts">
  import Check from 'svelte-material-icons/Check.svelte';
  import InformationOutline from 'svelte-material-icons/InformationOutline.svelte';
  import Send from 'svelte-material-icons/Send.svelte';
  import { goto } from '$app/navigation';
  import type { Assistant, Thread } from '$lib/entities';
  import ChevronRight from 'svelte-material-icons/ChevronRight.svelte';
  import HelpOutline from '$lib/components/svg/HelpOutline.svelte';
  import { cn } from '$lib/utils';
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from '$lib/components/ui/dropdown-menu';
  import EllipsisVertical from 'lucide-svelte/icons/ellipsis-vertical';
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import { deleteThreadSchema } from '$lib/features/all/schema';

  export let data;

  let openMap: { [key: string]: boolean } = {};
  let assistants = data.assistants;
  let threads = data.threads;
  let selectedAssistantId = data.assistants[0].id;
  let helpTooltipOpenMap: { [key: string]: boolean } = {};

  const helpLinks = [
    {
      href: 'https://oriconsul.box.com/s/c1oqgg3icghk24s73b5ftxufrm2us4mo',
      title: '社則体系・書式（問合せ先担当者一覧）.xlsx',
    },
    {
      href: 'https://oriconsul.box.com/s/12wb5x2ozzrwtds8dpm51dtjl19hxama',
      title: '全社向けAI Chatbot 利用マニュアル.pdf',
    },
  ];

  superForm(data.form, {
    validators: zodClient(deleteThreadSchema),
  });

  async function handleOnClickAssistant(assistant: Assistant) {
    selectedAssistantId = assistant.id;
    await goto(`/all/assistant/${assistant.id}`);
  }
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

<div class="h-full bg-gradient-to-b from-[#0165A3] via-25% via-[#148F99] to-50%">
  <div class="px-8 pt-[30px] pb-[22px]">
    <p class="font-semibold text-[34px] text-white">OC AI Chatbot</p>
  </div>
  <div class="flex flex-col gap-[15px] px-[15px]">
    <div class="flex-1 flex px-[15px] gap-[70px] max-h-[80%]">
      <div
        class="max-md:hidden w-[320px] rounded-md bg-white pt-[22px] pb-[30px] pl-[24px] pr-[11px] border shadow h-full overflow-hidden"
      >
        <p class="pb-[16px] text-[15px] font-bold">質問履歴</p>
        <div class="h-full overflow-y-auto">
          <div class="divider m-0 h-[1px] after:h-[1px] before:h-[1px]" />
          {#each threads as { thread, assistant, lastEditedAt } (thread.id)}
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
                  <ChevronRight class="text-[20px] text-[#0165A3]" />
                </div>
                <div class="divider m-0 h-[1px] after:h-[1px] before:h-[1px]" />
              </button>
              <div
                class={cn('hidden h-[24px] group-hover:block', openMap[thread.id] ? 'block' : '')}
              >
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
      </div>

      <div class="flex-1 flex flex-col gap-[15px]">
        <div
          class="border px-5 py-[22px] flex flex-col items-start bg-white rounded-[10px] shadow-md"
        >
          <p class="font-semibold text-[16px]">利用可能AI-Chatbot</p>
          <div class="flex flex-col gap-0.5 mt-1">
            {#each assistants as assistant, index (index)}
              <div class="flex justify-between items-center gap-2">
                {#if selectedAssistantId === assistant.id}
                  <button
                    class="text-[#0165A3] font-bold flex items-center gap-2"
                    on:click={() => void handleOnClickAssistant(assistant)}
                  >
                    <p class="truncate text-left">{assistant.name}</p>
                    <Check size="14" />
                  </button>
                {:else}
                  <button
                    class="font-normal"
                    on:click={() => void handleOnClickAssistant(assistant)}
                  >
                    <p class="truncate text-[#000000] hover:text-blue-400 text-left">
                      {assistant.name}
                    </p>
                  </button>
                {/if}
                <div class="flex gap-[6px] items-center">
                  <a href="/all/assistant/{assistant.id}/document" class="hover:text-blue-400">
                    <InformationOutline size="14" />
                  </a>
                  <DropdownMenu bind:open={helpTooltipOpenMap[assistant.id]}>
                    <DropdownMenuTrigger class="hover:text-[#0165A3] transition-colors">
                      <HelpOutline size="14" fill="currentColor" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {#each helpLinks as link}
                        <DropdownMenuItem>
                          <a
                            href={link.href}
                            target="_blank"
                            class="text-blue-600 hover:text-blue-800"
                          >
                            {link.title}
                          </a>
                        </DropdownMenuItem>
                      {/each}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            {/each}
          </div>
        </div>

        <div
          class="border px-5 py-[22px] flex flex-col items-start bg-white rounded-[10px] shadow-md"
        >
          <p class="font-semibold text-[16px]">利用方法について</p>
          <p class="mt-[6px] text-[13px] font-normal text-[#737376]">
            *ChatGPTを活用しているため、チャットボットの回答は必ずしも正しいとは限りません。重要な情報については、ITサポートデスクへ確認するようにしてください。
          </p>
          <p class="mt-[6px] text-[13px] font-normal text-[#737376]">
            *AI-Chatbotは管理者により、社内システムやルールの情報を定期的に更新し、併せてAI-Chatbotが回答出来なかった情報を追加学習させることにより、時間の経過と皆様（利用者）の利用頻度に比例して、正確で広範な回答ができるよう進化をしていきます。
          </p>
        </div>

        <button
          class="border px-5 py-[22px] flex flex-row justify-between items-center bg-white rounded-[10px] cursor-pointer shadow-md"
          on:click={() => goto(`/all/assistant/${selectedAssistantId}`)}
        >
          <div class="flex flex-col items-start gap-[6px]">
            <p class="font-semibold text-[16px]">会話をはじめる</p>
          </div>
          <Send class="text-[#0165A3]" size="18" />
        </button>
      </div>
    </div>
  </div>
</div>

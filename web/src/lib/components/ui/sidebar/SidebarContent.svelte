<script lang="ts">
  import CogOutline from 'svelte-material-icons/CogOutline.svelte';
  import HomeOutline from 'svelte-material-icons/HomeOutline.svelte';
  import Plus from 'svelte-material-icons/Plus.svelte';
  import RobotOutline from 'svelte-material-icons/RobotOutline.svelte';
  import SearchOutline from 'svelte-material-icons/Magnify.svelte';
  import FAQOutline from 'svelte-material-icons/FrequentlyAskedQuestions.svelte';
  import type { Group, User, ThreadForSidebar } from '$lib/entities';

  export let threadId: string | undefined;
  export let user: User;
  export let threads: ThreadForSidebar[];
  export let groups: Group[];

  function showAccountDetailsModal() {
    window['settings-modal'].showModal();
  }

  function mapThreadTypeToUrl(thread: ThreadForSidebar) {
    if (!thread.assistant) {
      return 'assistant';
    }
    switch (thread.assistant.assistantType) {
      case 'EMPTY':
        return `assistant`;
      case 'CONVERSATION':
        return `assistant`;
      case 'SEARCH':
        return `search`;
      case 'Q_AND_A':
        return `q-and-a`;
    }
  }
</script>

<div class="h-full flex flex-col text-white bg-oc">
  <div class="mt-6 mx-[21px]">
    <a
      href="/assistant"
      class="group btn no-animation flex gap-1 border-white bg-transparent text-base"
    >
      <Plus class="text-white group-hover:text-black" size="16" />
      <span class="text-white group-hover:text-black">新規質問</span>
    </a>
  </div>

  <div class="mt-[26px] mx-[21px]">
    <hr />
  </div>

  <div class="mt-[14px] mx-[21px] flex-1 overflow-hidden hover:overflow-auto">
    {#each threads as thread}
      <a href={`/thread/${mapThreadTypeToUrl(thread)}/${thread.id}`}>
        <div
          class="w-full h-[47px] flex items-center text-white text-base rounded-[6px]"
          class:bg-[#2B85AF]={threadId === thread.id}
          class:hover:bg-white={threadId !== thread.id}
          class:hover:text-black={threadId !== thread.id}
        >
          {#if !thread.assistant}
            <RobotOutline class="mx-[17px] text-[24px]" />
          {:else if thread.assistant.assistantType === 'EMPTY'}
            <RobotOutline class="mx-[17px] text-[24px]" />
          {:else if thread.assistant.assistantType === 'CONVERSATION'}
            <RobotOutline class="mx-[17px] text-[24px]" />
          {:else if thread.assistant.assistantType === 'SEARCH'}
            <SearchOutline class="mx-[17px] text-[24px]" />
          {:else if thread.assistant.assistantType === 'Q_AND_A'}
            <FAQOutline class="mx-[17px] text-[24px]" />
          {/if}
          <p class="w-full truncate">{thread.title}</p>
        </div>
      </a>
    {/each}
  </div>

  <div class="mt-[21px] mb-[90px]">
    <div class="mx-[21px]">
      <hr />
    </div>
    <div class="mx-[28px]">
      <a href="https://oriconsul.box.com/s/pvyyyi7zsnuzf5dla23ztxuynilfnpd0" target="_blank">
        <div class="mt-[33px] flex items-center gap-4 text-white w-full text-base">
          <HomeOutline class="text-[24px]" />
          <span>AI Chatbot (β) 利用者マニュアル </span>
        </div>
      </a>
      <button
        class="mt-[26px] flex items-center gap-4 text-white w-full text-base"
        on:click={showAccountDetailsModal}
      >
        <CogOutline class="text-[24px]" />
        <span>設定</span>
      </button>
    </div>
  </div>
</div>

<dialog id="settings-modal" class="modal">
  <form method="dialog" class="modal-box w-3/5 max-w-2xl">
    <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
    <div class="flex flex-col gap-3 mt-2">
      <h3 class="font-bold text-lg mb-3">設定</h3>
      <div class="space-y-2">
        <p class="font-bold">アカウント</p>
        <p class="text-sm">{user.email}</p>
        <p />
      </div>
      <div class="space-y-2">
        <p class="font-bold">チーム</p>
        {#each groups as group}
          <p class="text-sm">{group.name}</p>
        {/each}
      </div>
    </div>
  </form>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

<script lang="ts">
  import { page } from '$app/stores';
  import RobotOutline from 'svelte-material-icons/RobotOutline.svelte';
  import SearchOutline from 'svelte-material-icons/Magnify.svelte';
  import FAQOutline from 'svelte-material-icons/FrequentlyAskedQuestions.svelte';
  import { isChatSidebarVisible } from '$lib/stores/isChatSidebarVisible';

  type NavContentType = 'None' | 'Tab' | 'Title';

  export let title = '';

  $: url = $page.url.pathname;
  $: navContent = (() => {
    return getNavContentType(url);
  })();

  function getNavContentType(pathname: string): NavContentType {
    // 条件分岐と正規表現を用いてNavContentTypeを決定
    if (['/assistant', '/search', '/q-and-a'].includes(pathname)) return 'Tab';
    if (pathname.startsWith('/thread')) {
      return 'Title';
    }
    if (pathname.match(/^\/assistant\/edit$/) || pathname.match(/^\/assistant\/add$/)) {
      return 'None';
    }
    return 'None';
  }

  const tabs = [
    { label: '一般利用', path: '/assistant', icon: RobotOutline },
    { label: 'ファイル検索 (β)', path: '/search', icon: SearchOutline },
    { label: 'Q&A (β)', path: '/q-and-a', icon: FAQOutline },
  ];

  function toggleSidebar() {
    isChatSidebarVisible.update((value) => !value);
  }
</script>

<div class="navbar bg-base-100 border-b-2 flex flex-row px-9 h-[79px]">
  {#if navContent === 'Title'}
    <div class="flex flex-row w-full justify-between">
      <div class="flex flex-row items-center">
        <button class="btn btn-square btn-ghost mr-5" on:click={toggleSidebar}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 26 26"
            class="inline-block w-6 h-6 stroke-current"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            >
            </path>
          </svg>
        </button>
        <div class="flex flex-row items-center gap-2 min-w-full">
          <img src="/images/logo.webp" class="w-[47px] h-[44px]" alt="ロゴ" />
          <a href="/assistant" class="text-2xl font-bold truncate">OC AIChatbot</a>
        </div>
      </div>
      <p class="max-w-[900px] text-base font-normal truncate">
        <span>{title}</span>
      </p>
      <div />
    </div>
  {/if}
  {#if navContent === 'Tab'}
    <div class="flex flex-row w-full justify-between">
      <div class="flex flex-row items-center">
        <button class="btn btn-square btn-ghost mr-5" on:click={toggleSidebar}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 26 26"
            class="inline-block w-6 h-6 stroke-current"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            >
            </path>
          </svg>
        </button>
        <div class="flex flex-row items-center gap-2">
          <img src="/images/logo.webp" class="w-[47px] h-[44px]" alt="ロゴ" />
          <a href="/assistant" class="text-2xl font-bold">OC AIChatbot</a>
        </div>
      </div>
    </div>
    <div class="max-w-min flex flex-row">
      {#each tabs as { label, path, icon }}
        {#if path === url}
          <div
            class="text-[15px] flex flex-row gap-2 items-center tab border-2 border-blue-700 bg-[#EEF8FF] h-[43px] w-[190px] text-[#0165A3] font-bold"
          >
            <svelte:component this={icon} />
            <p>{label}</p>
          </div>
        {:else}
          <a
            href={path}
            class="tab border bg-white h-[43px] w-[190px] flex flex-row gap-2 text-[15px] text-black font-bold hover:border-2 hover:border-blue-300"
          >
            <svelte:component this={icon} />
            <p>{label}</p>
          </a>
        {/if}
      {/each}
    </div>
  {/if}
  {#if navContent === 'None'}
    <div class="flex flex-row w-full justify-between">
      <div class="flex flex-row items-center">
        <button class="btn btn-square btn-ghost mr-5" on:click={toggleSidebar}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 26 26"
            class="inline-block w-6 h-6 stroke-current"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            >
            </path>
          </svg>
        </button>
        <div class="flex flex-row items-center gap-2">
          <img src="/images/logo.webp" class="w-[47px] h-[44px]" alt="ロゴ" />
          <a href="/assistant" class="text-2xl font-bold">OC AIChatbot</a>
        </div>
      </div>
    </div>
  {/if}
</div>

<script lang="ts">
  import { page } from '$app/stores';
  import ChatOutline from 'svelte-material-icons/ChatOutline.svelte';
  import HomeOutline from 'svelte-material-icons/HomeOutline.svelte';
  import { goto } from '$app/navigation';

  export let data;

  let showBottomNavigation = true;
  $: showBottomNavigation = !$page.url.pathname.includes('/all/assistant');
</script>

<div class="w-full h-full rounded-[18px] flex flex-col">
  <div class="flex-1 overflow-y-auto">
    <slot />
  </div>

  {#if showBottomNavigation}
    <div class="btm-nav static md:flex md:justify-end">
      <button
        class="gap-0.5 md:hidden"
        class:text-black={$page.route.id !== '/all'}
        class:font-normal={$page.route.id !== '/all'}
        class:text-[#0165A3]={$page.route.id === '/all'}
        class:font-bold={$page.route.id === '/all'}
        on:click={() => goto('/all')}
      >
        <HomeOutline class="text-[25px]" />
        <span class="btm-nav-label">ホーム</span>
      </button>

      <button
        class="gap-0.5 md:hidden"
        class:text-black={$page.route.id !== '/all/history'}
        class:font-normal={$page.route.id !== '/all/history'}
        class:text-[#0165A3]={$page.route.id === '/all/history'}
        class:font-bold={$page.route.id === '/all/history'}
        on:click={() => goto('/all/history')}
      >
        <ChatOutline class="text-[25px]" />
        <span class="btm-nav-label">会話履歴</span>
      </button>
    </div>
  {/if}
</div>

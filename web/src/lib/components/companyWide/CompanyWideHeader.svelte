<script>
  import ChevronLeft from 'svelte-material-icons/ChevronLeft.svelte';

  export let title;
  export let onClickBack = () => {};
  export let showChevron = true;
</script>

<div class="relative w-full h-20 bg-gradient-to-b from-[#0165A3] to-[#148F99] p-5 text-white">
  {#if showChevron}
    <button class="absolute left-3 top-1/2 transform -translate-y-1/2" on:click={onClickBack}>
      <ChevronLeft class="text-[32px]" />
    </button>
  {/if}

  <div class="px-10 w-full h-full flex justify-center items-center">
    <p class="text-white text-xl font-semibold truncate">
      {title}
    </p>
  </div>
</div>

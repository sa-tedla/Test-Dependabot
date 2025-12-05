<script lang="ts">
  import ChevronLeft from 'svelte-material-icons/ChevronLeft.svelte';
  import RobotOutline from 'svelte-material-icons/RobotOutline.svelte';

  export let title;
  export let subTitle;
  export let onClickBack;
  export let onClickNewThread: () => void | undefined = undefined;
</script>

<div class="relative w-full bg-gradient-to-b from-[#0165A3] to-[#148F99] p-5 text-white">
  <button class="absolute left-3 top-1/2 transform -translate-y-1/2" on:click={onClickBack}>
    <ChevronLeft class="text-[32px]" />
  </button>

  <div class="w-full flex justify-between items-center">
    <div class="pl-10 pr-5 min-w-0 w-full h-full flex items-center gap-3.5">
      <RobotOutline class="text-[32px]" />
      <div class="w-full flex flex-col justify-center">
        <p class="w-full text-white text-xl font-semibold truncate">
          {title}
        </p>
        <p class="text-sm font-normal w-full truncate">{subTitle}</p>
      </div>
    </div>
    {#if onClickNewThread}
      <div class="ml-auto" style="margin-right: 32px;">
        <button
          class="py-2 px-4 bg-white text-[#0165A3] font-bold rounded-md whitespace-nowrap"
          on:click={onClickNewThread}>+ 新規質問</button
        >
      </div>
    {/if}
  </div>
</div>

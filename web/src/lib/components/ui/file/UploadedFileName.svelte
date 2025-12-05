<script lang="ts">
  import FileDocument from 'svelte-material-icons/FileDocument.svelte';
  import CloseCircleOutline from 'svelte-material-icons/CloseCircleOutline.svelte';

  export let filename: string;
  export let handleClearButtonClick: (() => void) | undefined = undefined;
</script>

<div class="flex">
  <div
    class="flex gap-2 items-center rounded-xl border border-black py-2 px-3 bg-[#E4E3E3] relative"
  >
    <FileDocument size={20} />
    <div class="flex flex-col gap-1">
      <div class="font-bold leading-[19px] text-sm break-all">{filename}</div>
      <div class="leading-[19px] text-[#878787] text-xs">
        {filename.split('.').pop()?.toUpperCase()}
      </div>
    </div>
    {#if handleClearButtonClick !== undefined}
      <button on:click|preventDefault|stopPropagation={handleClearButtonClick}>
        <div
          class="bg-white rounded-full w-[20px] h-[20px] overflow-hidden flex items-center justify-center absolute top-[-6px] right-[-10px]"
        >
          <CloseCircleOutline size={20} class="cursor-pointer" />
        </div>
      </button>
    {/if}
  </div>
</div>

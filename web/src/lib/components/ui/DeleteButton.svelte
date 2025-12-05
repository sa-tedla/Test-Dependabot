<script lang="ts">
  import TrashCanOutline from 'svelte-material-icons/TrashCanOutline.svelte';
  import Check from 'svelte-material-icons/Check.svelte';
  import { clickoutside } from '@svelte-put/clickoutside';
  import { createEventDispatcher } from 'svelte';

  let isConfirmed = false;
  const dispatch = createEventDispatcher();

  function handleOnClick(e: Event) {
    e.preventDefault();
    if (isConfirmed) {
      isConfirmed = false;
      dispatch('click');
    } else {
      isConfirmed = true;
    }
  }

  function handleOnClickOutside() {
    isConfirmed = false;
  }
</script>

<button on:click={handleOnClick} use:clickoutside on:clickoutside={handleOnClickOutside}>
  {#if isConfirmed}
    <Check size="20" class="text-[#828282]" />
  {:else}
    <TrashCanOutline size="20" class="text-[#828282]" />
  {/if}
</button>

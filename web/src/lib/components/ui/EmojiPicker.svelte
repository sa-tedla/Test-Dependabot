<script lang="ts">
  import { onMount } from 'svelte';
  let isEmojiPickerMounted = false;
  export let selectedEmoji: string;
  export let selectEmoji: (emoji: string) => void;

  onMount(() => {
    initEmojiPicker();
    return () => {
      isEmojiPickerMounted = false;
    };
  });

  const initEmojiPicker = async () => {
    if (typeof window === 'undefined') return;

    await import('emoji-picker-element');
    isEmojiPickerMounted = true;
    requestAnimationFrame(setupOnPickedEmoji);
  };

  const setupOnPickedEmoji = () => {
    const emojiPicker = document.querySelector('emoji-picker');
    if (!emojiPicker) return;

    emojiPicker.addEventListener('emoji-click', (event) => {
      if (!event.detail.unicode) return;
      selectEmoji(event.detail.unicode);
    });
  };
</script>

{#if isEmojiPickerMounted}
  <div class="dropdown">
    <div tabindex="0" role="button" class="btn m-1 bg-white border-2 text-xl">
      {selectedEmoji}
    </div>
    <div tabindex="0" class="dropdown-content z-[1] menu p-2 shadow">
      <emoji-picker />
    </div>
  </div>
{:else}
  <div></div>
{/if}

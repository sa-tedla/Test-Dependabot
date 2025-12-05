<script lang="ts">
  import autosize from 'svelte-autosize';
  import { tick } from 'svelte';

  let textarea: HTMLTextAreaElement;

  export let value: string;
  export let onPressEnter: (event: KeyboardEvent) => void;

  async function handleOnKeydown(event: KeyboardEvent) {
    if (value.length === 0) {
      return;
    }
    if (!event.isComposing && event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onPressEnter(event);

      await tick();
      setTimeout(() => {
        // 時間をずらさないとtextareaのサイズが変更されない
        autosize.update(textarea);
      }, 10);
    }
  }

  async function handleOnPaste() {
    setTimeout(function () {
      autosize.update(textarea);
    }, 10);
  }
</script>

<textarea
  id="messagetextarea"
  use:autosize
  bind:this={textarea}
  bind:value
  on:paste={handleOnPaste}
  on:keydown={handleOnKeydown}
  {...$$restProps}
/>

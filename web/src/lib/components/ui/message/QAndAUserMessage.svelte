<script lang="ts">
  import type { QAndAMessage } from '$lib/features/q_and_a/entities/qAndAMessage';
  import type { MessageDocument } from '$lib/entities';
  import AccountOutline from 'svelte-material-icons/AccountOutline.svelte';
  import FileOutline from 'svelte-material-icons/FileOutline.svelte';

  export let message: QAndAMessage | undefined;

  async function downloadFile(doc: MessageDocument) {
    try {
      console.log('Downloading file:', doc.filename);
      const response = await fetch(`/api/downloadMessageDocument/${doc.id}`, {
        method: 'GET',
      });

      if (!response.ok) {
        console.error('Download failed:', response.status, response.statusText);
        return;
      }

      // blobデータを取得してダウンロード
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
    }
  }
</script>

<div class="group flex gap-7 justify-center text-black py-[39px] px-20">
  <AccountOutline class="text-[24px]" />
  <div class="flex-1 relative flex flex-col gap-3 text-base whitespace-pre-wrap break-all">
    {#if message}
      <p>{message.contents}</p>
      {#if message.documents && message.documents.length > 0}
        <div class="flex flex-col items-start gap-[6px] mt-2">
          {#each message.documents as document}
            <button
              type="button"
              class="flex flex-row items-center gap-[6px] text-[13px] text-blue-500 hover:text-blue-600 hover:underline"
              on:click={() => downloadFile(document)}
            >
              <FileOutline class="text-[16px] text-black" />
              {document.filename}
            </button>
          {/each}
        </div>
      {/if}
    {/if}
  </div>
</div>

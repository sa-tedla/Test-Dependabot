<script lang="ts">
  import PaperClip from 'svelte-material-icons/Paperclip.svelte';
  import { MAX_FILE_COUNT } from '$lib/features/message_document/consts/fileRestrictions';

  export let fileList: FileList | null | undefined;
  export let accept: string = '';
  export let disabled: boolean = false;

  let fileInput: HTMLInputElement;

  function handleFileInputClick() {
    if (disabled) return;
    fileInput.click();
  }

  export function removeFile(index: number) {
    if (!fileList || fileList.length === 0) return;

    // 削除対象のファイルを除外したファイルリストを作成
    const filteredFiles: File[] = Array.from(fileList).filter((_, i) => i !== index);

    // fileListを更新
    const dataTransfer = new DataTransfer();
    filteredFiles.forEach((file) => dataTransfer.items.add(file));
    fileList = dataTransfer.files;
    // input要素の内容も更新
    fileInput.files = dataTransfer.files;
  }

  function handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const newFiles = input.files ? Array.from(input.files) : [];
    const existingFiles = fileList ? Array.from(fileList) : [];

    // 既存ファイル + 新規ファイルを結合
    const combinedFiles = existingFiles.concat(newFiles);

    const dataTransfer = new DataTransfer();
    combinedFiles.forEach((file) => dataTransfer.items.add(file));
    fileList = dataTransfer.files;
    // input要素の内容も更新
    fileInput.files = dataTransfer.files;
  }
</script>

<button
  type="button"
  on:click={handleFileInputClick}
  {disabled}
  class="absolute top-1/3 left-[14px]"
  class:text-gray-300={disabled}
  class:cursor-not-allowed={disabled}
>
  <PaperClip size="20" />
</button>
<input
  type="file"
  name="files"
  multiple
  max={MAX_FILE_COUNT}
  {accept}
  {disabled}
  bind:this={fileInput}
  on:change={handleFileChange}
  class="hidden"
/>

<script lang="ts">
  import { page } from '$app/stores';

  let accountId = '';
</script>

{#if $page.error.message === 'Not Found'}
  <div class="h-full w-full flex flex-col items-center justify-center bg-white text-black gap-4">
    <p class="text-2xl font-bold">ページが見つかりませんでした</p>

    <form class="p-2 w-full max-w-sm bg-gray-400 rounded flex flex-col items-center gap-2">
      <div class="form-control w-full">
        <label class="label" for="accountID">
          <span class="label-text text-white"
            >But.. you can login dev account if you know Account ID.</span
          >
        </label>
        <div>
          <input
            id="accountID"
            type="text"
            placeholder="Type Account ID here"
            class="input input-bordered w-full"
          />
        </div>
      </div>
      <button class="btn btn-ghost" type="submit">Submit</button>
    </form>
  </div>
{:else if $page.error.message === 'Unauthorized'}
  <div class="h-full w-full flex flex-col items-center justify-center bg-white text-black">
    <p class="text-2xl font-bold">認証に失敗しました</p>

    <div class="w-60 bg-gray-600">
      <p>開発用: 特定のアカウントになる</p>
      <input class="w-full p-2" bind:value={accountId} />
    </div>
  </div>
{:else}
  <div class="h-full w-full flex items-center justify-center bg-white text-black">
    <p class="text-2xl font-bold">予期せぬエラーが起きました</p>
  </div>
{/if}

<script lang="ts">
  import type { PageData } from './$types';
  import { superForm } from 'sveltekit-superforms/client';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import { developerLoginSchema } from '$lib/schema';

  export let data: PageData;

  const { form, errors, enhance, allErrors } = superForm(data.form, {
    validators: zodClient(developerLoginSchema),
  });
</script>

<div class="h-full w-full flex flex-col items-center justify-center bg-white text-black gap-11">
  <p class="text-[50px] font-bold">エラー</p>

  <div
    class="h-[83px] bg-white border-[5px] border-[#0369A3] rounded-[12px] text-black text-[25px] font-bold flex items-center"
  >
    <img src="/images/logo.webp" class="w-[47px] h-[44px] mx-[18px]" alt="ロゴ" />
    <p>OC AI Chatbot（β）</p>
  </div>

  <div class="text-xl whitespace-nowrap text-center">
    <p>認証に失敗しました。</p>
    <p>ポータルサイトから再度アクセスをしてください</p>
    <div class="mt-2">
      <a href="https://portal.oriconsul.com/" class="underline" target="_blank">OC PORTAL</a>
    </div>
  </div>

  {#if data.showAccountLogin}
    <form
      class="p-2 w-full max-w-sm bg-gray-400 rounded flex flex-col items-center gap-2"
      method="POST"
      use:enhance
    >
      <div class="form-control w-full">
        <label class="label" for="accountID">
          <span class="label-text text-white"
            >But.. you can login dev account if you know Account ID.</span
          >
        </label>
        <input
          type="text"
          class="input input-bordered w-full"
          id="accountID"
          name="accountID"
          placeholder="Type Account ID here"
          aria-invalid={$errors.accountID ? 'true' : undefined}
          bind:value={$form.accountID}
        />
        {#if $errors.accountID}<span class="invalid text-red-200">{$errors.accountID}</span>{/if}
      </div>
      <button class="btn btn-ghost" type="submit" disabled={$allErrors?.length > 0}>Submit </button>
    </form>
  {/if}
</div>

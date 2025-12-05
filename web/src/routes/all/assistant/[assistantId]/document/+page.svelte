<script lang="ts">
  import { browser } from '$app/environment';
  import CompanyWideHeader from '$lib/components/companyWide/CompanyWideHeader.svelte';

  export let data;
  $: assistant = data.assistant;

  function gotoBack() {
    if (browser) history.back();
  }
</script>

<div class="flex flex-col w-full h-full rounded-[18px]">
  <CompanyWideHeader title={assistant.name} onClickBack={gotoBack} />
  <div class="px-[29px] pt-[31px] w-full flex flex-col items-start">
    <div class="w-full flex flex-col gap-1 mb-[40px]">
      <p class="font-bold text-lg">回答可能範囲</p>
      <p class="text-sm">◆社内規定・ガイドライン等チャットボットに関連する回答範囲</p>
      <p class="text-sm">・社則体系・第1節～第9節、第12節（社内手続き関連に関する補足資料含む）</p>
      <p class="text-sm">◆AI-ITサポートに関連する回答範囲</p>
      <p class="text-sm">・社則 体系の「第8節　情報・リスク管理関係規程」</p>
      <p class="text-sm">
        ・ITサポートデスクの応答ナレッジ約480件のうち、質問回数の多い質問124件
        （残りの応答ナレッジも順次追加予定）
      </p>
      <p class="text-sm">・IT関連の利用手順マニュアル情報</p>
    </div>
    <div class="w-full flex flex-col gap-1">
      <p class="font-bold text-lg">学習済ファイル一覧</p>
      <p class="text-sm">チャットボットに利用されているファイルを表示しています。</p>
    </div>
    {#if assistant.indexSources.length > 0}
      <div class="w-full flex flex-col mt-6 text-sm">
        {#each assistant.indexSources as indexSource, index (index)}
          <a
            class="font-bold underline text-blue-400 w-full truncate"
            href={indexSource.source}
            target="_blank"
          >
            {indexSource.source}
          </a>
          <div class="pt-2">
            {#each indexSource.files as file}
              <p><span class="font-bold">・</span>{file}</p>
            {/each}
          </div>
        {/each}
      </div>
    {:else}
      <p class="mt-6 text-[13px] font-light leading-[15.73px]">格納ファイルがありません</p>
    {/if}
  </div>
</div>

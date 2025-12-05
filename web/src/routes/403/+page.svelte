<script lang="ts">
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
    <p>アクセス権限がありません。</p>
    <p>権限のあるアカウントでアクセスいただくか、</p>
    <p>サポートチームにお問い合わせください。</p>
  </div>

  <button class="btn no-animation" on:click={() => history.back()}>元のページに戻る</button>
</div>

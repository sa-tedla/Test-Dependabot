<script>
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';

  $: if (browser) {
    goto('/chat');
  }
</script>

<section class="h-screen w-screen flex bg-gray-50" />

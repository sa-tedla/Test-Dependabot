<script lang="ts">
  import Sidebar from '$lib/components/ui/sidebar/Sidebar.svelte';
  import SidebarContent from '$lib/components/ui/sidebar/SidebarContent.svelte';
  import { page } from '$app/stores';
  import Navbar from '$lib/components/ui/Navbar.svelte';
  import Toaster from '$lib/components/ui/Toaster.svelte';

  export let data;

  $: threadId = data.threadId;
  $: user = data.user;
  $: groups = data.groups;
  $: threads = data.threads;
  $: pageTitle = $page.data.pageTitle;
</script>

<Toaster />

<div class="w-screen h-screen overflow-hidden">
  <Navbar title={pageTitle} />
  <Sidebar>
    <div slot="left" class="h-full w-[341px] bg-gray-50 border-r">
      <SidebarContent {threadId} {user} {groups} {threads} />
    </div>
    <div slot="content" class="h-full w-full bg-gray-50">
      <slot />
    </div>
  </Sidebar>
</div>

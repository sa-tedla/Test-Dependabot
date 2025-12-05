<script lang="ts" context="module">
  export type ToastData = {
    title: string;
  };

  const {
    elements: { content, title },
    helpers,
    states: { toasts },
    actions: { portal },
  } = createToaster<ToastData>({
    type: 'foreground',
  });

  export const addToast = helpers.addToast;
</script>

<script lang="ts">
  import { createToaster, melt } from '@melt-ui/svelte';
</script>

<div class="fixed top-16 right-0 z-50 m-4 max-w-fit" use:portal>
  {#each $toasts as { id, data } (id)}
    <div use:melt={$content(id)}>
      <div>
        <div class="bg-base px-10 py-4 rounded-md text-[15px]">
          <h3 use:melt={$title(id)} class="text-white">
            {data.title}
          </h3>
        </div>
      </div>
    </div>
  {/each}
</div>

import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import type { ModelType } from '$lib/entities';

const key = 'selectedModel';

function getInitialSelectedModel(): ModelType {
  if (!browser) return 'GPT_35_TURBO';
  const selectedModel = window.localStorage.getItem(key);
  return selectedModel ? (selectedModel as ModelType) : 'GPT_35_TURBO';
}

export const selectedModelStore = writable<ModelType>(getInitialSelectedModel());

selectedModelStore.subscribe((value) => {
  if (browser) {
    window.localStorage.setItem(key, String(value));
  }
});

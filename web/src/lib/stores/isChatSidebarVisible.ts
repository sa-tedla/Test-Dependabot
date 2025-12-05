import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const defaultValue = true;
const initialValue = browser
  ? window.localStorage.getItem('isChatSidebarVisible') ?? defaultValue
  : defaultValue;

export const isChatSidebarVisible = writable<boolean>(initialValue);

isChatSidebarVisible.subscribe((value) => {
  if (browser) {
    window.localStorage.setItem('isChatSidebarVisible', String(value));
  }
});

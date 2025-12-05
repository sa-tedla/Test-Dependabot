import { writable, type Writable } from 'svelte/store';

export const defaultPrompt: Writable<string | undefined> = writable(undefined);

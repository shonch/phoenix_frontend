import { writable } from 'svelte/store';

export const authStore = writable<{ token: string | null; email: string | null }>({
    token: null,
    email: null
});

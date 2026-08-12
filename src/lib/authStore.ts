import { writable } from 'svelte/store';

export const authStore = writable<{ token: string | null; refresh_token: string | null; email: string | null }>({
    token: null,
    refresh_token: null,
    email: null
});

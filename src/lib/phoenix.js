import { get } from 'svelte/store';
import { authStore } from './authStore';

export async function getPhoenixState(fetch = window.fetch) {
    const auth = get(authStore);

    if (!auth.token) {
        throw new Error("Not logged in — no auth token available.");
    }

    const res = await fetch("http://127.0.0.1:8000/phoenix/state/", {
        headers: {
            Authorization: `Bearer ${auth.token}`
        }
    });

    if (!res.ok) {
        throw new Error("Failed to fetch Phoenix state");
    }

    return await res.json();
}

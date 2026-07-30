import { get } from 'svelte/store';
import { authStore } from './authStore';
import { PUBLIC_API_URL } from '$env/static/public'

export async function getPhoenixState(fetch = window.fetch) {
    const auth = get(authStore);

    if (!auth.token) {
        throw new Error("Not logged in — no auth token available.");
    }

    const res = await fetch(`${PUBLIC_API_URL}/phoenix/state/`, {
        headers: {
            Authorization: `Bearer ${auth.token}`
        }
    });

    if (!res.ok) {
        throw new Error("Failed to fetch Phoenix state");
    }

    return await res.json();
}

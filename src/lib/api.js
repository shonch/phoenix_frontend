import { get } from 'svelte/store';
import { authStore } from './authStore';
import { PUBLIC_API_URL } from '$env/static/public';

async function refreshAccessToken(fetch) {
    const auth = get(authStore);

    if (!auth.refresh_token) {
        throw new Error("No refresh token available — please log in again.");
    }

    const res = await fetch(`${PUBLIC_API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: auth.refresh_token })
    });

    if (!res.ok) {
        authStore.set({ token: null, refresh_token: null, email: null });
        throw new Error("Session expired — please log in again.");
    }

    const data = await res.json();
    authStore.set({ token: data.token, refresh_token: data.refresh_token, email: data.email });
    return data.token;
}

/**
 * Authenticated fetch wrapper — attaches the current access token,
 * silently refreshes and retries once on a 401, and auto-parses JSON.
 * Throws on any non-OK response (including a failed retry after refresh).
 *
 * @param {string} path - path relative to PUBLIC_API_URL, e.g. "/phoenix/state/"
 * @param {object} options - standard fetch options (method, body, headers, etc.)
 * @param {function} fetchImpl - fetch implementation to use (defaults to window.fetch;
 *                                pass SvelteKit's load-provided fetch when calling from a load function)
 */
export async function apiFetch(path, options = {}, fetchImpl = window.fetch) {
    const auth = get(authStore);

    if (!auth.token) {
        throw new Error("Not logged in — no auth token available.");
    }

    const buildHeaders = (token) => ({
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`
    });

    let res = await fetchImpl(`${PUBLIC_API_URL}${path}`, {
        ...options,
        headers: buildHeaders(auth.token)
    });

    if (res.status === 401) {
        const newToken = await refreshAccessToken(fetchImpl);
        res = await fetchImpl(`${PUBLIC_API_URL}${path}`, {
            ...options,
            headers: buildHeaders(newToken)
        });
    }

    if (!res.ok) {
        let detail = `Request to ${path} failed (${res.status})`;
        try {
            const errBody = await res.json();
            if (errBody?.detail) detail = errBody.detail;
        } catch {
            // response wasn't JSON — stick with the generic message
        }
        throw new Error(detail);
    }

    try {
        return await res.json();
    } catch {
        // Some legacy responses may not return valid/consistent JSON —
        // surface a clear error rather than an opaque parse exception.
        throw new Error(`Response from ${path} was not valid JSON`);
    }
}

import { apiFetch } from './api';

export async function getPhoenixState(fetch = window.fetch) {
    return apiFetch('/phoenix/state/', {}, fetch);
}

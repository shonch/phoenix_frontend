// src/routes/+layout.js
import "./+layout.css";
import { getPhoenixState } from "../lib/phoenix.js";
import { phoenixState } from "$lib/stateStore";
import { authStore } from "$lib/authStore";
import { get } from "svelte/store";
import { redirect } from "@sveltejs/kit";

export async function load({ url }) {
    const auth = get(authStore);

    const publicPaths = ["/login", "/forgot-password"];

    if (!auth.token && !publicPaths.includes(url.pathname)) {
        throw redirect(302, "/login");
    }

    if (!auth.token) {
        // On a public page with no token — nothing to load yet.
        return {};
    }

    const state = await getPhoenixState();
    console.log("PHOENIX STATE:", state);

    phoenixState.set(state);

    return { state };
}

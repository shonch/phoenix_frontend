// src/routes/+layout.js
import "./+layout.css";
import { getPhoenixState } from "../lib/phoenix.js";
import { phoenixState } from "$lib/stateStore";
import { authStore } from "$lib/authStore";
import { get } from "svelte/store";
import { redirect } from "@sveltejs/kit";

export async function load({ url }) {
    const auth = get(authStore);

    if (!auth.token && url.pathname !== "/login") {
        throw redirect(302, "/login");
    }

    if (!auth.token) {
        // On the login page itself with no token — nothing to load yet.
        return {};
    }

    const state = await getPhoenixState();
    console.log("PHOENIX STATE:", state);

    phoenixState.set(state);

    return { state };
}

// src/routes/+layout.js
import "./+layout.css";
import { getPhoenixState } from "../lib/phoenix.js";
import { writable } from "svelte/store";

export async function load({ fetch }) {
    const state = await getPhoenixState(fetch);

    // Log the state so we can see what the backend is returning
    console.log("PHOENIX STATE:", state);

    // Phoenix fragments store (legacy compatibility)
    const fragments = writable(state.fragments);

    return {
        state,
        fragments
    };
}


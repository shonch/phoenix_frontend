// src/routes/+layout.js
import "./+layout.css";
import { getPhoenixState } from "../lib/phoenix.js";
import { phoenixState } from "$lib/stateStore";

export async function load({ fetch }) {
    const state = await getPhoenixState(fetch);
    console.log("PHOENIX STATE:", state);

    phoenixState.set(state);

    return { state };
}

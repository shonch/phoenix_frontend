<script>
    const { data } = $props();

    const state = $derived(data?.state);

    const mythic = $derived(
        state?.mythic_state ?? {
            dominant_archetype: "Unknown",
            active_modes: [],
            resonance_score: 0,
            notes: "Mythic engine not yet implemented."
        }
    );
</script>


<h1>🜂 Mythic Dashboard</h1>

<section class="panel">
    <p>This view will show your archetypes, modes, and mythic resonance.</p>
</section>

<section class="panel">
    <h2>Dominant Archetype</h2>
    <p>{mythic.dominant_archetype}</p>
</section>

<section class="panel">
    <h2>Active Modes</h2>
    {#if mythic.active_modes.length > 0}
        <ul>
            {#each mythic.active_modes as mode}
                <li>{mode}</li>
            {/each}
        </ul>
    {:else}
        <p>No active modes.</p>
    {/if}
</section>

<section class="panel">
    <h2>Resonance Score</h2>
    <p>{mythic.resonance_score}</p>
</section>

<section class="panel">
    <h2>Notes</h2>
    <p>{mythic.notes}</p>
</section>

<style>
    :global(body) {
        background: none;
        color: inherit;
    }

    section {
        margin-bottom: 2rem;
    }
</style>


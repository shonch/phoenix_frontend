<script>
    const { data } = $props();

    const summary = data?.summary ?? null;
    const triggers = data?.triggers ?? [];
    const contexts = data?.contexts ?? [];
    const clues = data?.clues ?? [];
    const intensity = data?.intensity_profile ?? [];
</script>

<div class="frisson-container">
    <section class="header">
        <h1>⚡ Frisson Engine</h1>
        <p class="subtitle">Awe, chills, ritual sparks, and context‑bound resonance.</p>
    </section>

    <section class="panel">
        <h2>Summary</h2>
        {#if !summary}
            <p>No summary available.</p>
        {:else}
            <p>{summary}</p>
        {/if}
    </section>

    <section class="panel">
        <h2>Triggers</h2>
        {#if !triggers || triggers.length === 0}
            <p>No triggers detected.</p>
        {:else}
            <ul class="trigger-list">
                {#each triggers as t}
                    <li class="trigger">
                        <strong>{t.trigger}</strong>
                        {#if t.count}
                            <span> — {t.count} occurrences</span>
                        {/if}
                    </li>
                {/each}
            </ul>
        {/if}
    </section>

    <section class="panel">
        <h2>Contexts</h2>
        {#if !contexts || contexts.length === 0}
            <p>No contexts detected.</p>
        {:else}
            <ul class="context-list">
                {#each contexts as c}
                    <li class="context">
                        <strong>{c.context}</strong>
                        {#if c.count}
                            <span> — {c.count} occurrences</span>
                        {/if}
                    </li>
                {/each}
            </ul>
        {/if}
    </section>

    <section class="panel">
        <h2>Clues</h2>
        {#if !clues || clues.length === 0}
            <p>No frisson clues logged.</p>
        {:else}
            <ul class="clue-list">
                {#each clues as cl}
                    <li class="clue">
                        <pre>{JSON.stringify(cl, null, 2)}</pre>
                    </li>
                {/each}
            </ul>
        {/if}
    </section>

    <section class="panel">
        <h2>Intensity Profile</h2>
        {#if !intensity || intensity.length === 0}
            <p>No intensity profile available.</p>
        {:else}
            <ul class="intensity-list">
                {#each intensity as p}
                    <li>{JSON.stringify(p)}</li>
                {/each}
            </ul>
        {/if}
    </section>

    <details class="raw">
        <summary>Raw JSON</summary>
        <pre>{JSON.stringify(data, null, 2)}</pre>
    </details>
</div>

<style>
    .frisson-container {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        padding: 1rem;
        color: #e6f7ff;
    }

    .header h1 {
        margin: 0;
        color: #9be3ff;
    }

    .subtitle {
        opacity: 0.8;
        margin-top: 0.25rem;
    }

    .panel {
        background: rgba(10, 40, 70, 0.5);
        padding: 1.25rem;
        border-radius: 8px;
        border: 1px solid rgba(140, 220, 255, 0.3);
    }

    ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .trigger, .context, .clue {
        padding: 0.75rem;
        margin-bottom: 0.75rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .clue pre {
        margin: 0;
        white-space: pre-wrap;
    }

    .raw pre {
        background: rgba(0, 0, 0, 0.4);
        padding: 1rem;
        border-radius: 6px;
        overflow: auto;
    }
</style>


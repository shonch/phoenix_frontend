<script>
    const { data } = $props();

    const summary = data?.summary ?? null;
    const clues = data?.clues ?? [];
    const cycles = data?.cycles ?? [];
    const dominant = data?.dominant_emotions ?? [];
    const weather = data?.weather_patterns ?? [];
</script>

<div class="emotion-container">
    <section class="header">
        <h1>💫 Emotion Engine</h1>
        <p class="subtitle">Dominant tones, cycles, and emotional weather.</p>
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
        <h2>Dominant Emotions</h2>
        {#if !dominant || dominant.length === 0}
            <p>No dominant emotions detected.</p>
        {:else}
            <ul class="dominant-list">
                {#each dominant as d}
                    <li class="dominant">
                        <strong>{d.emotion}</strong>
                        {#if d.count}
                            <span> — {d.count}</span>
                        {/if}
                    </li>
                {/each}
            </ul>
        {/if}
    </section>

    <section class="panel">
        <h2>Emotional Cycles</h2>
        {#if !cycles || cycles.length === 0}
            <p>No emotional cycles logged.</p>
        {:else}
            <ul class="cycle-list">
                {#each cycles as c}
                    <li class="cycle">
                        <strong>{c.day}</strong>
                        {#if c.count}
                            <span> — {c.count} events</span>
                        {/if}
                    </li>
                {/each}
            </ul>
        {/if}
    </section>

    <section class="panel">
        <h2>Clues</h2>
        {#if !clues || clues.length === 0}
            <p>No emotional clues logged.</p>
        {:else}
            <ul class="clue-list">
                {#each clues as cl}
                    <li class="clue">
                        <pre>{cl}</pre>
                    </li>
                {/each}
            </ul>
        {/if}
    </section>

    <section class="panel">
        <h2>Emotional Weather</h2>
        {#if !weather || weather.length === 0}
            <p>No emotional weather patterns detected.</p>
        {:else}
            <ul class="weather-list">
                {#each weather as w}
                    <li class="weather">
                        <pre>{JSON.stringify(w, null, 2)}</pre>
                    </li>
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
    .emotion-container {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        padding: 1rem;
        color: #f0e6ff;
    }

    .header h1 {
        margin: 0;
        color: #c9a6ff;
    }

    .subtitle {
        opacity: 0.8;
        margin-top: 0.25rem;
    }

    .panel {
        background: rgba(50, 20, 80, 0.4);
        padding: 1.25rem;
        border-radius: 8px;
        border: 1px solid rgba(210, 170, 255, 0.3);
    }

    ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .dominant, .cycle, .clue, .weather {
        padding: 0.75rem;
        margin-bottom: 0.75rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .clue pre, .weather pre {
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


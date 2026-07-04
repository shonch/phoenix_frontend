<script>
    const { data } = $props();

    const summary = {
        total_thresholds: data?.total_thresholds ?? null,
        fatigue_events: data?.fatigue_events ?? null
    };

    const events = data?.recent_fatigue ?? [];
</script>

<div class="threshold-container">
    <section class="header">
        <h1>🛡️ Threshold Engine</h1>
        <p class="subtitle">Boundaries, pressure, resilience, and emotional load</p>
    </section>

    <section class="panel">
        <h2>Summary</h2>
        {#if Object.values(summary).every(v => v == null)}
            <p>No summary available.</p>
        {:else}
            <ul>
                {#each Object.entries(summary) as [key, value]}
                    {#if value != null}
                        <li><strong>{key}:</strong> {value}</li>
                    {/if}
                {/each}
            </ul>
        {/if}
    </section>

    <section class="panel">
        <h2>Recent Threshold Events (Fatigue)</h2>

        {#if !events || events.length === 0}
            <p>No threshold events detected.</p>
        {:else}
            <ul class="event-list">
                {#each events as ev}
                    <li class="event">
                        <strong>{ev.subject ?? 'Threshold event'}</strong>
                        {#if ev.weather}
                            <p>Weather: {ev.weather}</p>
                        {/if}
                        {#if ev.date}
                            <small>{ev.date}</small>
                        {/if}
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
    .threshold-container {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        padding: 1rem;
        color: #ffe9c4;
    }

    .header h1 {
        margin: 0;
        color: #ffcf70;
    }

    .subtitle {
        opacity: 0.75;
        margin-top: 0.25rem;
    }

    .panel {
        background: rgba(80, 60, 20, 0.35);
        padding: 1.25rem;
        border-radius: 8px;
        border: 1px solid rgba(255, 200, 120, 0.25);
    }

    .panel h2 {
        margin-top: 0;
        color: #ffd48a;
    }

    ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .event {
        padding: 0.75rem;
        margin-bottom: 0.75rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .raw pre {
        background: rgba(0, 0, 0, 0.4);
        padding: 1rem;
        border-radius: 6px;
        overflow: auto;
    }
</style>


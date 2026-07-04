<script>
    const { data } = $props();

    // --- SCHEMA-ADAPTIVE EXTRACTION ---

    // Summary: use backend summary if present, otherwise fallback to known grind fields
    const summary = data?.summary ?? {
        grind_events: data?.grind_events,
        friction_points: data?.friction_points,
        overrides: data?.overrides
    };

    // Grind items: prefer new schema, fallback to old
    const items = data?.items ?? data?.grind_items ?? data?.recent ?? [];
</script>

<div class="engine-container">

    <section class="engine-header">
        <h1>⚙️ Grind Engine</h1>
        <p class="subtitle">Operational load, friction points, and system churn</p>
    </section>

    <!-- SUMMARY -->
    <section class="summary-panel">
        <h2>Summary</h2>

        {#if !summary}
            <p>No summary available.</p>

        {:else if typeof summary === 'string'}
            <p>{summary}</p>

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

    <!-- GRIND ITEMS -->
    <section class="items-panel">
        <h2>Grind Items</h2>

        {#if !items || items.length === 0}
            <p>No grind items detected.</p>
        {:else}
            <ul class="item-list">
                {#each items as item}
                    <li class="item">
                        <strong>{item.label ?? item.subject ?? 'Item'}</strong>

                        {#if item.description}
                            <p>{item.description}</p>
                        {/if}

                        {#if item.reason}
                            <p>{item.reason}</p>
                        {/if}

                        {#if item.timestamp}
                            <small>{item.timestamp}</small>
                        {:else if item.date}
                            <small>{item.date}</small>
                        {/if}
                    </li>
                {/each}
            </ul>
        {/if}
    </section>

    <!-- RAW JSON -->
    <details class="raw-panel">
        <summary>Raw JSON</summary>
        <pre>{JSON.stringify(data, null, 2)}</pre>
    </details>

</div>

<style>
    .engine-container {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        padding: 1rem;
    }

    .engine-header h1 {
        margin: 0;
        color: #e8dcb8;
    }

    .subtitle {
        opacity: 0.7;
        margin-top: 0.25rem;
    }

    .summary-panel ul,
    .items-panel ul {
        list-style: none;
        padding: 0;
    }

    .item-list .item {
        padding: 0.75rem;
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 6px;
        margin-bottom: 0.75rem;
        background: rgba(255,255,255,0.05);
    }

    .raw-panel {
        margin-top: 2rem;
    }

    pre {
        background: rgba(0,0,0,0.4);
        padding: 1rem;
        border-radius: 6px;
        overflow: auto;
    }
</style>


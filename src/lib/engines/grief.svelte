<script>
    const { data } = $props();

    // --- SCHEMA-ADAPTIVE EXTRACTION ---

    // Summary: use backend fields if summary is missing
    const summary = data?.summary ?? {
        total_emotional_fragments: data?.total_emotional_fragments,
        grief_events: data?.grief_events
    };

    // Stages: only show if backend provides them
    const stages = data?.stages ?? [];

    // Recent fragments: prefer new schema, fallback to old
    const recent = data?.recent ?? data?.recent_grief ?? [];

    // Intensity: optional
    const intensity = data?.intensity ?? [];
</script>

<div class="grief-container">

    <!-- HEADER -->
    <section class="header">
        <h1>💙 Grief Engine</h1>
        <p class="subtitle">Emotional waves, cycles, anchors, and releases</p>
    </section>

    <!-- SUMMARY -->
    <section class="panel">
        <h2>Summary</h2>

        {#if !summary || Object.values(summary).every(v => v == null)}
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

    <!-- STAGES (optional) -->
    {#if stages && stages.length > 0}
        <section class="panel">
            <h2>Detected Grief Stages</h2>
            <ul class="stage-list">
                {#each stages as stage}
                    <li class="stage">
                        <strong>{stage.name}</strong>
                        <p>{stage.description}</p>
                    </li>
                {/each}
            </ul>
        </section>
    {/if}

    <!-- RECENT FRAGMENTS -->
    <section class="panel">
        <h2>Recent Grief Fragments</h2>

        {#if !recent || recent.length === 0}
            <p>No recent grief fragments.</p>
        {:else}
            <ul class="fragment-list">
                {#each recent as frag}
                    <li class="fragment">
                        <!-- content or tags -->
                        {#if frag.content}
                            <pre>{frag.content}</pre>
                        {:else if frag.tags}
                            <pre>{frag.tags.join(', ')}</pre>
                        {/if}

                        <!-- timestamp -->
                        {#if frag.timestamp}
                            <small>{frag.timestamp}</small>
                        {:else if frag.date}
                            <small>{frag.date}</small>
                        {/if}

                        <!-- weather -->
                        {#if frag.weather}
                            <p><em>{frag.weather}</em></p>
                        {/if}
                    </li>
                {/each}
            </ul>
        {/if}
    </section>

    <!-- INTENSITY (optional) -->
    {#if intensity && intensity.length > 0}
        <section class="panel">
            <h2>Intensity Timeline</h2>
            <ul class="intensity-list">
                {#each intensity as point}
                    <li>
                        <strong>{point.level}</strong>
                        <span> — {point.label}</span>
                    </li>
                {/each}
            </ul>
        </section>
    {/if}

    <!-- RAW JSON -->
    <details class="raw">
        <summary>Raw JSON</summary>
        <pre>{JSON.stringify(data, null, 2)}</pre>
    </details>

</div>

<style>
    .grief-container {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        padding: 1rem;
        color: #dce7ff;
    }

    .header h1 {
        margin: 0;
        color: #8ab4ff;
    }

    .subtitle {
        opacity: 0.7;
        margin-top: 0.25rem;
    }

    .panel {
        background: rgba(20, 40, 80, 0.35);
        padding: 1.25rem;
        border-radius: 8px;
        border: 1px solid rgba(120, 160, 255, 0.2);
    }

    .panel h2 {
        margin-top: 0;
        color: #a8c4ff;
    }

    ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .stage, .fragment {
        padding: 0.75rem;
        margin-bottom: 0.75rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .fragment pre {
        margin: 0 0 0.5rem 0;
        white-space: pre-wrap;
    }

    .raw pre {
        background: rgba(0, 0, 0, 0.4);
        padding: 1rem;
        border-radius: 6px;
        overflow: auto;
    }
</style>


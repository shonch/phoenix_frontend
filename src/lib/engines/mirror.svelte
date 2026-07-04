<script>
    const { data } = $props();

    // --- SCHEMA-ADAPTIVE EXTRACTION ---

    // Summary: use backend summary if present, otherwise fallback to known mirror fields
    const summary = data?.summary ?? {
        alignment_score: data?.alignment_score,
        contradiction_count: data?.contradiction_count,
        echo_patterns: data?.echo_patterns
    };

    // Alignment: prefer new schema, fallback to old
    const alignment = data?.alignment ?? data?.mirror_alignment ?? [];

    // Contradictions: prefer new schema, fallback to old
    const contradictions = data?.contradictions ?? data?.mirror_contradictions ?? [];

    // Echo patterns: prefer new schema, fallback to old
    const echoes = data?.echoes ?? data?.mirror_echoes ?? [];

    // Reflection fragments: prefer new schema, fallback to old
    const reflections = data?.reflections ?? data?.mirror_reflections ?? [];
</script>

<div class="mirror-container">

    <!-- HEADER -->
    <section class="header">
        <h1>🪞 Mirror Engine</h1>
        <p class="subtitle">Self‑reflection, alignment, contradictions, and recursive emotional patterns</p>
    </section>

    <!-- SUMMARY -->
    <section class="panel">
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

    <!-- ALIGNMENT SCORES -->
    <section class="panel">
        <h2>Alignment Scores</h2>

        {#if !alignment || alignment.length === 0}
            <p>No alignment data available.</p>
        {:else}
            <ul class="alignment-list">
                {#each alignment as a}
                    <li class="alignment">
                        <strong>{a.dimension ?? a.label ?? 'Dimension'}</strong>
                        {#if a.score}
                            <span> — {a.score}</span>
                        {/if}
                        {#if a.description}
                            <p>{a.description}</p>
                        {/if}
                    </li>
                {/each}
            </ul>
        {/if}
    </section>

    <!-- CONTRADICTIONS -->
    <section class="panel">
        <h2>Contradictions</h2>

        {#if !contradictions || contradictions.length === 0}
            <p>No contradictions detected.</p>
        {:else}
            <ul class="contradiction-list">
                {#each contradictions as c}
                    <li class="contradiction">
                        <strong>{c.label ?? 'Contradiction'}</strong>
                        {#if c.details}
                            <p>{c.details}</p>
                        {/if}
                        {#if c.severity}
                            <small>Severity: {c.severity}</small>
                        {/if}
                    </li>
                {/each}
            </ul>
        {/if}
    </section>

    <!-- ECHO PATTERNS -->
    <section class="panel">
        <h2>Echo Patterns</h2>

        {#if !echoes || echoes.length === 0}
            <p>No echo patterns detected.</p>
        {:else}
            <ul class="echo-list">
                {#each echoes as e}
                    <li class="echo">
                        <strong>{e.pattern ?? e.label ?? 'Pattern'}</strong>
                        {#if e.frequency}
                            <span> — {e.frequency} occurrences</span>
                        {/if}
                        {#if e.example}
                            <p>{e.example}</p>
                        {/if}
                    </li>
                {/each}
            </ul>
        {/if}
    </section>

    <!-- SELF-REFLECTION FRAGMENTS -->
    <section class="panel">
        <h2>Self‑Reflection Fragments</h2>

        {#if !reflections || reflections.length === 0}
            <p>No reflection fragments found.</p>
        {:else}
            <ul class="reflection-list">
                {#each reflections as r}
                    <li class="reflection">
                        <pre>{r.content ?? r.text ?? ''}</pre>
                        {#if r.timestamp}
                            <small>{r.timestamp}</small>
                        {/if}
                    </li>
                {/each}
            </ul>
        {/if}
    </section>

    <!-- RAW JSON -->
    <details class="raw">
        <summary>Raw JSON</summary>
        <pre>{JSON.stringify(data, null, 2)}</pre>
    </details>

</div>

<style>
    .mirror-container {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        padding: 1rem;
        color: #e8e8e8;
    }

    .header h1 {
        margin: 0;
        color: #cfd8ff;
    }

    .subtitle {
        opacity: 0.75;
        margin-top: 0.25rem;
    }

    .panel {
        background: rgba(120, 120, 150, 0.25);
        padding: 1.25rem;
        border-radius: 8px;
        border: 1px solid rgba(200, 200, 255, 0.25);
    }

    .panel h2 {
        margin-top: 0;
        color: #dfe4ff;
    }

    ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .alignment,
    .contradiction,
    .echo,
    .reflection {
        padding: 0.75rem;
        margin-bottom: 0.75rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .reflection pre {
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


<script>
    const { data } = $props();
    const { state } = data;

    // all analysis engines live here
    const analysis = state?.analysis ?? {};

const engines = [
    {
        key: 'emotion',
        label: 'Emotion',
        icon: '💫',
        color: '#c9a6ff',
        description: 'Emotional embers and tag echoes across your fragments.'
    },
    {
        key: 'grief',
        label: 'Grief',
        icon: '💙',
        color: '#8ab4ff',
        description: 'Emotional waves, loss, and long arcs of grief.'
    },
    {
        key: 'thresholds',
        label: 'Thresholds',
        icon: '🛡️',
        color: '#ffcf70',
        description: 'Boundaries, pressure, and resilience under load.'
    },
    {
        key: 'signals',
        label: 'Signals',
        icon: '📡',
        color: '#c7a6ff',
        description: 'Recurring patterns, pings, and anomalies.'
    },
    {
        key: 'mirror',
        label: 'Mirror',
        icon: '🪞',
        color: '#dfe4ff',
        description: 'Self‑reflection, alignment, and contradictions.'
    },
    {
        key: 'grind',
        label: 'Grind',
        icon: '⚙️',
        color: '#bbbbbb',
        description: 'Operational friction, load, and system wear.'
    },
    {
        key: 'detective',
        label: 'Detective',
        icon: '🕵️',
        color: '#ff9c6b',
        description: 'Recurring clues, echoes, and unresolved threads.'
    },
    {
        key: 'frisson',
        label: 'Frisson',
        icon: '⚡',
        color: '#ffe27a',
        description: 'Triggers and the contexts that surround them.'
    }
    // tags, classifiers, phoenix_state can be added later
];

</script>

<div class="analysis-dashboard">
    <header class="header">
        <h1>🔥 Phoenix Analysis</h1>
        <p class="subtitle">
            Overview of all active engines and how Phoenix is currently reading your system.
        </p>
    </header>

    {#if !state}
        <p>Loading analysis state…</p>
    {:else}
        <section class="engine-grid">
            {#each engines as engineDef}
                {@const engineData = analysis[engineDef.key] ?? {}}
                <a
                    class="engine-card"
                    href={`/dashboard/analysis/${engineDef.key}`}
                    data-sveltekit-preload-data
                    style={`--accent:${engineDef.color}`}
                >
                    <div class="engine-header">
                        <span class="icon">{engineDef.icon}</span>
                        <h2>{engineDef.label}</h2>
                    </div>

                    <p class="description">{engineDef.description}</p>

                    <div class="meta">
                        <div>
                            <strong>Has data:</strong>
                            <span>{Object.keys(engineData).length > 0 ? 'Yes' : 'No'}</span>
                        </div>

                        {#if engineData.summary}
                            <div class="summary-snippet">
                                <strong>Summary:</strong>
                                <span>
                                    {JSON.stringify(engineData.summary).slice(0, 120)}
                                    {Object.keys(engineData.summary).length ? '…' : ''}
                                </span>
                            </div>
                        {/if}
                    </div>

                    <div class="cta">
                        <span>Open engine →</span>
                    </div>
                </a>
            {/each}
        </section>

        <details class="raw">
            <summary>Raw analysis JSON</summary>
            <pre>{JSON.stringify(analysis, null, 2)}</pre>
        </details>
    {/if}
</div>

<style>
    .analysis-dashboard {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        padding: 1rem;
    }

    .header h1 {
        margin: 0;
    }

    .subtitle {
        opacity: 0.8;
        margin-top: 0.25rem;
    }

    .engine-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 1.5rem;
    }

    .engine-card {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        padding: 1.25rem;
        border-radius: 10px;
        text-decoration: none;
        color: inherit;
        background: rgba(20, 20, 40, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.12);
        transition: transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease;
    }

    .engine-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 18px rgba(0, 0, 0, 0.4);
        border-color: var(--accent);
    }

    .engine-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .engine-header h2 {
        margin: 0;
    }

    .icon {
        font-size: 1.4rem;
    }

    .description {
        opacity: 0.85;
        margin: 0;
    }

    .meta {
        font-size: 0.9rem;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        opacity: 0.9;
    }

</style>


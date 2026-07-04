<script>
    const { data } = $props();

    const emotional = data?.emotional ?? {};
    const symbolic = data?.symbolic ?? {};
    const mythic = data?.mythic ?? {};
    const system = data?.system ?? {};
</script>

<div class="signals-container">
    <section class="header">
        <h1>📡 Signals Engine</h1>
        <p class="subtitle">Emotional, symbolic, mythic, and system‑level signals.</p>
    </section>

    <section class="panel">
        <h2>Emotional Signals</h2>
        {#if Object.keys(emotional).length === 0}
            <p>No emotional signals.</p>
        {:else}
            <ul>
                {#each Object.entries(emotional) as [key, value]}
                    <li>
                        <strong>{key}:</strong>
                        <pre>{JSON.stringify(value, null, 2)}</pre>
                    </li>
                {/each}
            </ul>
        {/if}
    </section>

    <section class="panel">
        <h2>Symbolic Signals</h2>
        {#if Object.keys(symbolic).length === 0}
            <p>No symbolic signals.</p>
        {:else}
            <ul>
                {#each Object.entries(symbolic) as [key, value]}
                    <li>
                        <strong>{key}:</strong>
                        <pre>{JSON.stringify(value, null, 2)}</pre>
                    </li>
                {/each}
            </ul>
        {/if}
    </section>

    <section class="panel">
        <h2>Mythic Signals</h2>
        {#if Object.keys(mythic).length === 0}
            <p>No mythic signals.</p>
        {:else}
            <ul>
                {#each Object.entries(mythic) as [key, value]}
                    <li>
                        <strong>{key}:</strong>
                        <pre>{JSON.stringify(value, null, 2)}</pre>
                    </li>
                {/each}
            </ul>
        {/if}
    </section>

    <section class="panel">
        <h2>System Signals</h2>
        {#if Object.keys(system).length === 0}
            <p>No system signals.</p>
        {:else}
            <ul>
                {#each Object.entries(system) as [key, value]}
                    <li>
                        <strong>{key}:</strong>
                        <pre>{JSON.stringify(value, null, 2)}</pre>
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
    .signals-container {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        padding: 1rem;
        color: #e6ddff;
    }

    .header h1 {
        margin: 0;
        color: #c7a6ff;
    }

    .subtitle {
        opacity: 0.75;
        margin-top: 0.25rem;
    }

    .panel {
        background: rgba(40, 20, 80, 0.4);
        padding: 1.25rem;
        border-radius: 8px;
        border: 1px solid rgba(200, 160, 255, 0.3);
    }

    ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    pre {
        margin: 0.25rem 0 0 0;
        white-space: pre-wrap;
        background: rgba(0, 0, 0, 0.3);
        padding: 0.5rem;
        border-radius: 4px;
    }

    .raw pre {
        background: rgba(0, 0, 0, 0.4);
        padding: 1rem;
        border-radius: 6px;
        overflow: auto;
    }
</style>


<script>
    import { renderMarkdown } from '$lib/utils/markdown';

    // Correct runes-mode usage
    const props = $props();
    const data = $derived(props.data);

    const state = $derived(data?.state ?? null);

    const emotional = $derived(state?.raw?.emotional_fragments ?? []);
    const grief = $derived(state?.analysis?.grief ?? {});
    const thresholds = $derived(state?.analysis?.thresholds ?? {});
    const detective = $derived(state?.analysis?.detective ?? {});
</script>

<h1 class="title">🌡️ Emotional Dashboard</h1>

{#if !state}
    <p>Loading emotional state…</p>
{:else}

<section class="panel">
    <h2>Emotional Fragments ({emotional.length})</h2>

    {#if emotional.length > 0}
        {#each emotional as frag}
            <div class="fragment-card">
                <h3>{frag.title ?? frag.filename ?? "Untitled Fragment"}</h3>

                <div class="fragment-body">
                    {@html renderMarkdown(frag.content)}
                </div>

                {#if frag.tags}
                    <div class="fragment-tags">
                        {#each frag.tags as tag}
                            <span class="tag">{tag}</span>
                        {/each}
                    </div>
                {/if}
            </div>
        {/each}
    {:else}
        <p>No emotional fragments found.</p>
    {/if}
</section>

<section class="panel">
    <h2>Grief Analysis</h2>
    <pre>{JSON.stringify(grief, null, 2)}</pre>
</section>

<section class="panel">
    <h2>Threshold Analysis</h2>
    <pre>{JSON.stringify(thresholds, null, 2)}</pre>
</section>

<section class="panel">
    <h2>Detective Emotional Signals</h2>
    <pre>{JSON.stringify(detective, null, 2)}</pre>
</section>

{/if}

<style>
    .panel {
        margin-bottom: 2rem;
        padding: 1rem;
        border-radius: 12px;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        backdrop-filter: blur(6px);
    }

    .fragment-card {
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        padding: 1rem;
        margin-bottom: 1.5rem;
        border-radius: 12px;
        backdrop-filter: blur(8px);
    }

    .fragment-body {
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
        white-space: pre-wrap;
    }

    .tag {
        background: rgba(255,255,255,0.1);
        padding: 0.2rem 0.5rem;
        border-radius: 6px;
        margin-right: 0.3rem;
        font-size: 0.8rem;
    }
</style>


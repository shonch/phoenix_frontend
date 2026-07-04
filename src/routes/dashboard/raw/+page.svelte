<script>
    let preload = false;

    const { data } = $props();
    const state = $derived(data?.state ?? null);
    const raw = $derived(state?.raw ?? null);

    import JsonCodex from '$lib/components/JsonCodex.svelte';
</script>

<h1 class="codex-header">📦 Phoenix Raw Data Explorer</h1>

{#if !raw}
    <p>Loading raw data…</p>
{:else}

    <section>
        <h2 class="codex-header">Collections</h2>
        <ul>
            {#each Object.keys(raw) as key}
                <li><a href={"#" + key}>{key}</a></li>
            {/each}
        </ul>
    </section>

    {#each Object.entries(raw) as [key, value]}
        <section id={key} style="margin-bottom: 2rem;">
            <h2 class="codex-header">{key}</h2>
            <JsonCodex title={key} data={value} />
        </section>
    {/each}

{/if}


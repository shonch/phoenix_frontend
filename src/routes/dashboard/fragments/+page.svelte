<script lang="ts">
    import { formatFragmentList } from '$lib/formatters/phoenixFormatter';
    import { goto } from '$app/navigation';

    const { data } = $props();

    const COLLECTION_LABELS: Record<string, string> = {
        fragments: "Fragments (Legacy)",
        emotional_fragments: "Emotional Fragments",

        thresholds: "Thresholds",
        revelations: "Revelations"
    };

    let selectedCollection = $state<string | null>(null);

    const rawFragments = $derived(
        selectedCollection ? (data?.collections?.[selectedCollection] ?? []) : []
    );

    let fragments = $derived.by(() => {
        if (!selectedCollection) return [];
        try {
            return formatFragmentList(rawFragments);
        } catch (err) {
            console.error("FORMATTER ERROR:", err);
            return [];
        }
    });

    function selectCollection(key: string) {
        selectedCollection = key;
    }

    function backToSelector() {
        selectedCollection = null;
    }

    function openFragment(id: string) {
        goto(`/dashboard/fragments/${id}`);
    }
</script>

<h1 class="page-title">Fragments Codex</h1>

{#if !selectedCollection}
    <p class="subtitle">Choose a collection to view:</p>

    <div class="collection-grid">
        {#each Object.entries(COLLECTION_LABELS) as [key, label]}
            <div class="collection-card" onclick={() => selectCollection(key)}>
                <h2>{label}</h2>
                <p class="count">{(data?.collections?.[key] ?? []).length} entries</p>
            </div>
        {/each}
    </div>
{:else}
    <button class="back-btn" onclick={backToSelector}>← Back to collections</button>

    <p>{COLLECTION_LABELS[selectedCollection] ?? selectedCollection} — {fragments.length} entries</p>

    <div class="fragment-grid">
        {#each fragments as frag}
            <div class="fragment-card" onclick={() => openFragment(frag.id)}>
                <h2 class="fragment-title">
                    {frag.title ?? "Untitled Fragment"}
                </h2>

                <p class="fragment-preview">
                    {frag.preview ?? ""}
                </p>

                <div class="fragment-meta">
                    <span>{frag.id}</span>
                </div>
            </div>
        {/each}
    </div>
{/if}

<style>
    .subtitle {
        margin-top: 1rem;
        color: #aaa;
    }

    .collection-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 1.5rem;
        margin-top: 1.5rem;
    }

    .collection-card {
        padding: 1.5rem;
        border-radius: 12px;
        background: #1a1a1a;
        border: 1px solid #333;
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: center;
    }

    .collection-card:hover {
        border-color: #ff8c42;
        background: #222;
        transform: translateY(-2px);
    }

    .collection-card h2 {
        margin: 0;
        font-size: 1.1rem;
        color: #e0e0e0;
    }

    .collection-card .count {
        margin-top: 0.5rem;
        color: #ff8c42;
        font-size: 0.9rem;
    }

    .back-btn {
        margin-top: 1rem;
        background: none;
        border: 1px solid #444;
        color: #ccc;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        cursor: pointer;
    }

    .back-btn:hover {
        border-color: #ff8c42;
        color: #ff8c42;
    }

    .fragment-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.5rem;
        margin-top: 1.5rem;
    }

    .fragment-card {
        padding: 1.25rem;
        border-radius: 12px;
        background: #1a1a1a;
        border: 1px solid #333;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .fragment-card:hover {
        border-color: #555;
        background: #222;
        transform: translateY(-2px);
    }

    .fragment-title {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: #e0e0e0;
    }

    .fragment-preview {
        margin-top: 0.5rem;
        font-size: 0.9rem;
        color: #aaa;
        line-height: 1.4;
    }

    .fragment-meta {
        margin-top: 0.75rem;
        font-size: 0.8rem;
        color: #666;
    }
</style>

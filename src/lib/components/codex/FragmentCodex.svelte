<script lang="ts">
    let props = $props();

    // Reactive fragment
    let fragment = $derived(() => props.fragment ?? {});

    // State containers (safe defaults)
    let title = $state("");
    let tags = $state([]);
    let body = $state("");

    // Reactive update when fragment changes
    $effect(() => {
        title = fragment.title ?? "";
        tags = fragment.tags ?? [];
        body = fragment.html ?? fragment.preview ?? "";
    });
</script>

<div class="fragment-card debug-border">
    <aside class="tag-column">
        <div class="tag-label">Mythica Tags</div>

        {#each tags as tag}
            <div class="tag-pill">
                {#if tag?.emoji}{tag.emoji} {/if}
                {tag?.name ?? "(unnamed tag)"}
            </div>
        {/each}
    </aside>

    <section class="fragment-main">
        <h2 class="fragment-title">
            {#if title}
                <span class="dropcap">{title[0] ?? "∅"}</span>
                {title}
            {:else}
                <span class="dropcap">∅</span>
                <em>(untitled fragment)</em>
            {/if}
        </h2>

        <div class="fragment-body">
            <pre class="fragment-pre">{body}</pre>
        </div>
    </section>
</div>


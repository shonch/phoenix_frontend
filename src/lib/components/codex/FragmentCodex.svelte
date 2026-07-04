<script lang="ts">
    import { state, props } from "svelte";

    const { fragment } = props();

    // Debug
    console.log("Rendering fragment (SAFE MODE):", fragment);

    // Runes-friendly reactive fields
    const title = state(fragment?.title ?? "");
    const tags = state(fragment?.tags ?? []);
    const body = state(fragment?.html ?? fragment?.preview ?? "");

    // Manual update if fragment changes
    // (Runes Mode does NOT allow $: or derived/effect)
    function update() {
        title.set(fragment?.title ?? "");
        tags.set(fragment?.tags ?? []);
        body.set(fragment?.html ?? fragment?.preview ?? "");
    }

    update();
</script>

<div class="fragment-card debug-border">
    <aside class="tag-column">
        <div class="tag-label">Mythica Tags</div>

        {#each tags.get() as tag}
            <div class="tag-pill">
                {#if tag?.emoji}{tag.emoji} {/if}
                {tag?.name ?? "(unnamed tag)"}
            </div>
        {/each}
    </aside>

    <section class="fragment-main">
        <h2 class="fragment-title">
            {#if title.get()}
                <span class="dropcap">{title.get()[0] ?? "∅"}</span>
                {title.get()}
            {:else}
                <span class="dropcap">∅</span>
                <em>(untitled fragment)</em>
            {/if}
        </h2>

        <div class="fragment-body">
            <pre class="fragment-pre">{body.get()}</pre>
        </div>
    </section>
</div>

<style>
    /* your original styles */
</style>


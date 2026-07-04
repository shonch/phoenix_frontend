<script>
    const {
        title = "Analysis Engine",
        description = "",
        state = {},
        engineComponent = null
    } = $props();
</script>

<div class="panel">
    <header>
        <h1>{title}</h1>
        {#if description}
            <p class="desc">{description}</p>
        {/if}
    </header>

    <section class="engine">
        {#if engineComponent}
            <svelte:component this={engineComponent} state={state} />
        {:else}
            <p>No engine loaded.</p>
        {/if}
    </section>
</div>

<style>
    .panel {
        padding: 1.5rem;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        margin-bottom: 2rem;
    }

    header h1 {
        margin: 0;
        font-size: 1.8rem;
        font-weight: 600;
    }

    .desc {
        opacity: 0.7;
        margin-top: 0.25rem;
        margin-bottom: 1rem;
    }

    .engine {
        margin-top: 1rem;
    }
</style>


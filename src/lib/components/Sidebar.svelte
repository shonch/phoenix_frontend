<script>
    const { state } = $props();

    const engines = $derived(
        state?.analysis ? Object.keys(state.analysis) : []
    );
</script>

<nav class="sidebar">
    <ul class="curated">
        <li><a href="/dashboard">Dashboard</a></li>
        <li><a href="/dashboard/raw">Raw Data</a></li>
        <li><a href="/dashboard/emotional">Emotional</a></li>
        <li><a href="/dashboard/fragments">Fragments</a></li>
        <li><a href="/dashboard/mythic">Mythic</a></li>
        <li><a href="/dashboard/symbolic">Symbolic</a></li>
        <li><a href="/dashboard/system">System</a></li>
        <li><a href="/dashboard/analysis">Analysis</a></li>
    </ul>

    <h3>Analysis Engines</h3>
    <ul class="engines">
        {#each engines as engine}
            <li><a href={`/dashboard/analysis/${engine}`}>{engine}</a></li>
        {/each}
    </ul>
</nav>


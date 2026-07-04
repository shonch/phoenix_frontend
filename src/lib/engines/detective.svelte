<script>
    const { data } = $props();

    const summary = data?.summary ?? null;
    const score = data?.score ?? null;

    const cases = data?.cases?.files ?? [];
    const clues = data?.clues ?? {};
    const echoes = data?.echoes ?? {};
    const revelations = data?.revelations ?? {};
    const symbols = data?.symbols ?? {};
    const weather = data?.weather ?? {};
</script>

<div class="detective-container">
    <section class="header">
        <h1>🕵️ Detective Engine</h1>
        <p class="subtitle">Clues, echoes, revelations, and symbolic density.</p>
    </section>

    <section class="panel">
        <h2>Summary</h2>
        {#if !summary}
            <p>No summary available.</p>
        {:else}
            <p>{summary}</p>
        {/if}
        {#if score != null}
            <p><strong>Investigation score:</strong> {score}</p>
        {/if}
    </section>

    <section class="panel">
        <h2>Clues</h2>
        {#if !clues || !clues.total}
            <p>No clues logged.</p>
        {:else}
            <p><strong>Total clues:</strong> {clues.total}</p>
            {#if clues.by_type}
                <ul class="clue-type-list">
                    {#each Object.entries(clues.by_type) as [type, count]}
                        <li><strong>{type}:</strong> {count}</li>
                    {/each}
                </ul>
            {/if}
            {#if clues.recent}
                <h3>Recent clues</h3>
                <ul class="clue-list">
                    {#each clues.recent as cl}
                        <li class="clue">
                            <pre>{JSON.stringify(cl, null, 2)}</pre>
                        </li>
                    {/each}
                </ul>
            {/if}
        {/if}
    </section>

    <section class="panel">
        <h2>Echoes</h2>
        {#if !echoes || (!echoes.subjects && !echoes.tags && !echoes.weather)}
            <p>No echo patterns detected.</p>
        {:else}
            {#if echoes.intensity != null}
                <p><strong>Echo intensity:</strong> {echoes.intensity}</p>
            {/if}
            {#if echoes.subjects}
                <h3>Subjects</h3>
                <pre>{JSON.stringify(echoes.subjects, null, 2)}</pre>
            {/if}
            {#if echoes.tags}
                <h3>Tags</h3>
                <pre>{JSON.stringify(echoes.tags, null, 2)}</pre>
            {/if}
            {#if echoes.weather}
                <h3>Weather</h3>
                <pre>{JSON.stringify(echoes.weather, null, 2)}</pre>
            {/if}
        {/if}
    </section>

    <section class="panel">
        <h2>Revelations</h2>
        {#if !revelations || !revelations.total}
            <p>No revelations logged.</p>
        {:else}
            <p><strong>Total revelations:</strong> {revelations.total}</p>
            {#if revelations.by_type}
                <ul class="rev-type-list">
                    {#each Object.entries(revelations.by_type) as [type, count]}
                        <li><strong>{type}:</strong> {count}</li>
                    {/each}
                </ul>
            {/if}
            {#if revelations.recent}
                <h3>Recent revelations</h3>
                <ul class="rev-list">
                    {#each revelations.recent as r}
                        <li class="revelation">
                            <pre>{JSON.stringify(r, null, 2)}</pre>
                        </li>
                    {/each}
                </ul>
            {/if}
        {/if}
    </section>

    <section class="panel">
        <h2>Symbolic Density</h2>
        {#if !symbols}
            <p>No symbolic data.</p>
        {:else}
            {#if symbols.symbolic_density != null}
                <p><strong>Symbolic density:</strong> {symbols.symbolic_density}</p>
            {/if}
            {#if symbols.top_tags}
                <h3>Top tags</h3>
                <pre>{JSON.stringify(symbols.top_tags, null, 2)}</pre>
            {/if}
            {#if symbols.top_pairs}
                <h3>Top pairs</h3>
                <pre>{JSON.stringify(symbols.top_pairs, null, 2)}</pre>
            {/if}
            {#if symbols.top_archetypes}
                <h3>Top archetypes</h3>
                <pre>{JSON.stringify(symbols.top_archetypes, null, 2)}</pre>
            {/if}
        {/if}
    </section>

    <section class="panel">
        <h2>Weather</h2>
        {#if !weather}
            <p>No weather data.</p>
        {:else}
            {#if weather.distribution}
                <h3>Distribution</h3>
                <pre>{JSON.stringify(weather.distribution, null, 2)}</pre>
            {/if}
            {#if weather.recent}
                <h3>Recent</h3>
                <pre>{JSON.stringify(weather.recent, null, 2)}</pre>
            {/if}
        {/if}
    </section>

    <section class="panel">
        <h2>Cases</h2>
        {#if !cases || cases.length === 0}
            <p>No case files.</p>
        {:else}
            <ul class="case-list">
                {#each cases as file}
                    <li class="case">
                        <pre>{JSON.stringify(file, null, 2)}</pre>
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
    .detective-container {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        padding: 1rem;
        color: #e8f0ff;
    }

    .header h1 {
        margin: 0;
        color: #9fb8ff;
    }

    .subtitle {
        opacity: 0.8;
        margin-top: 0.25rem;
    }

    .panel {
        background: rgba(20, 40, 80, 0.5);
        padding: 1.25rem;
        border-radius: 8px;
        border: 1px solid rgba(150, 180, 255, 0.3);
    }

    ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .clue, .revelation, .case {
        padding: 0.75rem;
        margin-bottom: 0.75rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    pre {
        margin: 0;
        white-space: pre-wrap;
    }

    .raw pre {
        background: rgba(0, 0, 0, 0.4);
        padding: 1rem;
        border-radius: 6px;
        overflow: auto;
    }
</style>


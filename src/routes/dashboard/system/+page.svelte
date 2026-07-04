<script>
    const { data } = $props();
    const state = $derived(data?.state ?? null);
    const modules = $derived(state?.raw?.module_status ?? []);
</script>

<h1>System Dashboard</h1>

{#if !state}
    <p>Loading...</p>
{:else}
    <table>
        <thead>
            <tr>
                <th>Module</th>
                <th>Status</th>
                <th>Needs Validation</th>
                <th>Emotional Flow</th>
                <th>Last Updated</th>
            </tr>
        </thead>
        <tbody>
            {#each modules as m}
                <tr>
                    <td>{m.module_name}</td>
                    <td>{m.status}</td>
                    <td>{m.needs_validation ? "Yes" : "No"}</td>
                    <td>{m.emotional_flow ? "Yes" : "No"}</td>
                    <td>{m.timestamp}</td>
                </tr>
            {/each}
        </tbody>
    </table>
{/if}

<style>
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1rem;
    }
    th, td {
        border: 1px solid #ccc;
        padding: 0.5rem;
        text-align: left;
    }
    th {
        background: #f0f0f0;
    }
</style>


<script lang="ts">
  import { goto } from "$app/navigation";

  const { data } = $props();

  const total = data?.total ?? 0;
  const fragments = data?.fragments ?? [];
  const fatigueTraceCount = data?.fatigue_trace_count ?? 0;
  const fatigueTraces = data?.fatigue_traces ?? [];

  function openFragment(id: string) {
    if (id) goto(`/dashboard/fragments/${id}`);
  }

  function formatDate(value: string | null) {
    if (!value) return "";
    const d = new Date(value);
    return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString();
  }
</script>

<div class="threshold-container">
  <header class="header">
    <h1>🛡️ Threshold Engine</h1>
    <p class="subtitle">{total} Threshold fragments — boundaries you've named.</p>
  </header>

  <section class="panel">
    <h2>Threshold Fragments</h2>
    {#if fragments.length === 0}
      <p class="empty">No Threshold fragments yet.</p>
    {:else}
      <div class="event-list">
        {#each fragments as f}
          <button class="event-item clickable" onclick={() => openFragment(f.id)}>
            <span class="event-subject">{f.title ?? "Untitled"}</span>
            <span class="event-date">{formatDate(f.date)}</span>
            {#if f.snippet}<span class="event-snippet">{f.snippet}</span>{/if}
          </button>
        {/each}
      </div>
    {/if}
  </section>

  <section class="panel">
    <p class="stat-line">
      <strong>{fatigueTraceCount}</strong> of <strong>{total}</strong>
      Threshold fragments contain a trace of fatigue.
    </p>
  </section>

  <section class="panel">
    <h2>Fatigue Traces</h2>
    {#if fatigueTraces.length === 0}
      <p class="empty">No fatigue traces yet.</p>
    {:else}
      <div class="event-list">
        {#each fatigueTraces as f}
          <button class="event-item clickable" onclick={() => openFragment(f.id)}>
            <span class="event-subject">{f.title ?? "Untitled"}</span>
            <span class="event-date">{formatDate(f.date)}</span>
            {#if f.snippet}<span class="event-snippet">{f.snippet}</span>{/if}
          </button>
        {/each}
      </div>
    {/if}
  </section>
</div>

<style>
  .threshold-container {
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
    padding: 1rem;
    color: #ffe9c4;
  }

  .header h1 {
    margin: 0;
    color: #ffcf70;
  }

  .subtitle {
    opacity: 0.75;
    margin-top: 0.25rem;
  }

  .panel {
    background: rgba(80, 60, 20, 0.3);
    padding: 1.1rem 1.25rem;
    border-radius: 10px;
    border: 1px solid rgba(255, 200, 120, 0.2);
  }

  .panel h2 {
    margin: 0 0 0.75rem 0;
    font-size: 1.1rem;
    color: #ffd48a;
  }

  .stat-line {
    margin: 0;
    font-size: 1.05rem;
  }

  .empty {
    opacity: 0.6;
    font-style: italic;
    margin: 0;
  }

  .event-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .event-item {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding: 0.7rem 1rem;
    background: rgba(255, 200, 120, 0.06);
    border: 1px solid rgba(255, 200, 120, 0.2);
    border-radius: 8px;
    color: inherit;
    text-align: left;
    cursor: default;
  }

  .event-item.clickable {
    cursor: pointer;
  }

  .event-item.clickable:hover {
    background: rgba(255, 200, 120, 0.12);
  }

  .event-subject {
    font-weight: 600;
  }

  .event-date {
    font-size: 0.8rem;
    opacity: 0.7;
  }

  .event-snippet {
    font-size: 0.85rem;
    opacity: 0.8;
  }
</style>

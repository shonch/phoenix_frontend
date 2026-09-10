<script lang="ts">
  import { goto } from "$app/navigation";

  const { data } = $props();

  const label = data?.label ?? "Traces of Grief";
  const totalScanned = data?.total_scanned ?? 0;
  const traceCount = data?.trace_count ?? 0;
  const traces = data?.traces ?? [];

  function openFragment(id: string) {
    goto(`/dashboard/fragments/${id}`);
  }

  function formatDate(iso: string | null) {
    if (!iso) return "";
    const d = new Date(iso);
    return isNaN(d.getTime()) ? "" : d.toLocaleDateString();
  }
</script>

<div class="grief-container">
  <header class="header">
    <h1>💙 {label}</h1>
    <p class="subtitle">
      A search for the word "grief" across your fragments — not a ritual
      category, since Grief was never one you write directly. A trace can
      surface inside a fragment about something else entirely.
    </p>
  </header>

  <section class="panel">
    <p class="stat-line">
      <strong>{traceCount}</strong> of <strong>{totalScanned}</strong>
      fragments contain a trace of grief.
    </p>
  </section>

  <section class="panel">
    <h2>Where Grief Surfaced</h2>

    {#if traces.length === 0}
      <p class="empty">No traces found yet.</p>
    {:else}
      <div class="fragment-list">
        {#each traces as f}
          <button class="fragment-item" onclick={() => openFragment(f.id)}>
            <span class="frag-subject">
              {f.subject ?? "Untitled"}
              {#if f.type}<span class="frag-type">— {f.type}</span>{/if}
            </span>
            <span class="frag-date">{formatDate(f.date)}</span>
            {#if f.snippet}
              <span class="frag-snippet">{f.snippet}</span>
            {/if}
          </button>
        {/each}
      </div>
    {/if}
  </section>
</div>

<style>
  .grief-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 1rem;
    color: #dce7ff;
  }

  .header h1 {
    margin: 0;
    color: #8ab4ff;
  }

  .subtitle {
    opacity: 0.7;
    margin-top: 0.25rem;
    font-size: 0.9rem;
  }

  .panel {
    background: rgba(20, 40, 80, 0.35);
    padding: 1.25rem;
    border-radius: 10px;
    border: 1px solid rgba(120, 160, 255, 0.2);
  }

  .panel h2 {
    margin-top: 0;
    color: #a8c4ff;
    font-size: 1.2rem;
  }

  .stat-line {
    margin: 0;
    font-size: 1.05rem;
  }

  .empty {
    opacity: 0.6;
    font-style: italic;
  }

  .fragment-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .fragment-item {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding: 0.7rem 1rem;
    background: rgba(120, 160, 255, 0.08);
    border: 1px solid rgba(120, 160, 255, 0.2);
    border-radius: 8px;
    color: inherit;
    text-align: left;
    cursor: pointer;
  }

  .fragment-item:hover {
    background: rgba(120, 160, 255, 0.15);
  }

  .frag-subject {
    font-weight: 600;
  }

  .frag-type {
    font-weight: normal;
    opacity: 0.6;
    font-size: 0.85rem;
    text-transform: capitalize;
  }

  .frag-date {
    font-size: 0.8rem;
    opacity: 0.7;
  }

  .frag-snippet {
    font-size: 0.85rem;
    opacity: 0.8;
  }
</style>

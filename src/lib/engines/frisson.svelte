<script lang="ts">
  import { goto } from "$app/navigation";

  const { data } = $props();

  const label = data?.label ?? "Traces of Frisson";
  const totalScanned = data?.total_scanned ?? 0;
  const traceCount = data?.trace_count ?? 0;
  const traces = data?.traces ?? [];
  const triggers = data?.triggers ?? [];
  const contexts = data?.contexts ?? [];

  function openFragment(id: string) {
    goto(`/dashboard/fragments/${id}`);
  }

  function formatDate(iso: string | null) {
    if (!iso) return "";
    const d = new Date(iso);
    return isNaN(d.getTime()) ? "" : d.toLocaleDateString();
  }
</script>

<div class="frisson-container">
  <header class="header">
    <h1>⚡ {label}</h1>
    <p class="subtitle">
      A search for awe/chill-related words across your fragments — some
      hints (mountain, ritual, mythic) are common in everyday writing too,
      so a trace is a starting point to look at, not a confirmed moment.
    </p>
  </header>

  <section class="panel">
    <p class="stat-line">
      <strong>{traceCount}</strong> of <strong>{totalScanned}</strong>
      fragments contain a trace.
    </p>
  </section>

  <section class="panel">
    <h2>Where It Surfaced</h2>
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
            {#if f.matched?.length}
              <span class="frag-matched">matched: {f.matched.join(", ")}</span>
            {/if}
            {#if f.snippet}
              <span class="frag-snippet">{f.snippet}</span>
            {/if}
          </button>
        {/each}
      </div>
    {/if}
  </section>

  <section class="panel">
    <h2>Triggers</h2>
    {#if triggers.length === 0}
      <p class="empty">No triggers detected yet.</p>
    {:else}
      <ul class="item-list">
        {#each triggers as t}
          <li><strong>{t.trigger}</strong> — {t.count} {t.count === 1 ? "time" : "times"}</li>
        {/each}
      </ul>
    {/if}
  </section>

  <section class="panel">
    <h2>Contexts</h2>
    {#if contexts.length === 0}
      <p class="empty">No contexts detected yet.</p>
    {:else}
      <ul class="item-list">
        {#each contexts as c}
          <li><strong>{c.context}</strong> — {c.count} {c.count === 1 ? "time" : "times"}</li>
        {/each}
      </ul>
    {/if}
  </section>
</div>

<style>
  .frisson-container {
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
    padding: 1rem;
    color: #e6f7ff;
  }

  .header h1 {
    margin: 0;
    color: #9be3ff;
  }

  .subtitle {
    opacity: 0.8;
    margin-top: 0.25rem;
    font-size: 0.9rem;
  }

  .panel {
    background: rgba(10, 40, 70, 0.4);
    padding: 1.1rem 1.25rem;
    border-radius: 10px;
    border: 1px solid rgba(140, 220, 255, 0.25);
  }

  .panel h2 {
    margin: 0 0 0.75rem 0;
    font-size: 1.1rem;
    color: #9be3ff;
  }

  .stat-line {
    margin: 0;
  }

  .empty {
    opacity: 0.6;
    font-style: italic;
    margin: 0;
  }

  .item-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .item-list li {
    padding: 0.6rem 0.8rem;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.08);
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
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(140, 220, 255, 0.2);
    border-radius: 8px;
    color: inherit;
    text-align: left;
    cursor: pointer;
  }

  .fragment-item:hover {
    background: rgba(140, 220, 255, 0.1);
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

  .frag-matched {
    font-size: 0.8rem;
    opacity: 0.7;
    font-style: italic;
  }

  .frag-snippet {
    font-size: 0.85rem;
    opacity: 0.8;
  }
</style>

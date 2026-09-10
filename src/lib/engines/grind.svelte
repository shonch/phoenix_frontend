<script lang="ts">
  import { goto } from "$app/navigation";

  const { data } = $props();

  const total = data?.total ?? 0;
  const grindFragments = data?.grind_fragments ?? [];
  const releaseFragments = data?.release_fragments ?? [];
  const patterns = data?.patterns ?? [];
  const cycles = data?.cycles ?? [];
  const fatigueSignal = data?.fatigue_signal ?? null;

  function openFragment(id: string) {
    goto(`/dashboard/fragments/${id}`);
  }

  function formatDate(value: string | null) {
    if (!value) return "";
    const d = new Date(value);
    return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString();
  }
</script>

<div class="engine-container">
  <header class="engine-header">
    <h1>⚙️ Grind Engine</h1>
    <p class="subtitle">{total} Grind/Release fragments — friction, fatigue, and recovery patterns.</p>
  </header>

  {#if fatigueSignal}
    <section class="panel">
      <h2>Fatigue Signal</h2>
      <p class="stat-line">
        <strong>{fatigueSignal.recent_14_days}</strong> Grind fragments in the last 14 days,
        vs <strong>{fatigueSignal.prior_14_days}</strong> the 14 days before —
        <strong class="trend-{fatigueSignal.trend}">{fatigueSignal.trend}</strong>.
      </p>
      <p class="section-note">Based on how often you've actually written Grind fragments, not a guessed feeling.</p>
    </section>
  {/if}

  <section class="panel">
    <h2>Grind Fragments</h2>
    {#if grindFragments.length === 0}
      <p class="empty">No Grind fragments yet.</p>
    {:else}
      <div class="fragment-list">
        {#each grindFragments as f}
          <button class="fragment-item" onclick={() => openFragment(f.id)}>
            <span class="frag-title">{f.title ?? "Untitled"}</span>
            <span class="frag-date">{formatDate(f.date)}</span>
            {#if f.snippet}<span class="frag-snippet">{f.snippet}</span>{/if}
          </button>
        {/each}
      </div>
    {/if}
  </section>

  <section class="panel">
    <h2>Release Fragments</h2>
    {#if releaseFragments.length === 0}
      <p class="empty">No Release fragments yet.</p>
    {:else}
      <div class="fragment-list">
        {#each releaseFragments as f}
          <button class="fragment-item" onclick={() => openFragment(f.id)}>
            <span class="frag-title">{f.title ?? "Untitled"}</span>
            <span class="frag-date">{formatDate(f.date)}</span>
            {#if f.snippet}<span class="frag-snippet">{f.snippet}</span>{/if}
          </button>
        {/each}
      </div>
    {/if}
  </section>

  <section class="panel">
    <h2>Grind → Release Cycles</h2>
    {#if cycles.length === 0}
      <p class="empty">No grind-to-release cycles detected yet.</p>
    {:else}
      <ul class="event-list">
        {#each cycles as c}
          <li>
            <strong>{c.days_between}</strong> {c.days_between === 1 ? "day" : "days"} between grinding and release
            <small>{formatDate(c.grind_date)} → {formatDate(c.release_date)}</small>
          </li>
        {/each}
      </ul>
    {/if}
  </section>

  <section class="panel">
    <h2>Recurring Tags</h2>
    {#if patterns.length === 0}
      <p class="empty">No recurring grind tags yet.</p>
    {:else}
      <ul class="tag-list">
        {#each patterns as p}
          <li><strong>{p.tag}</strong> — {p.count} {p.count === 1 ? "time" : "times"}</li>
        {/each}
      </ul>
    {/if}
  </section>
</div>

<style>
  .engine-container {
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
    padding: 1rem;
    color: #e8dcb8;
  }

  .engine-header h1 {
    margin: 0;
  }

  .subtitle {
    opacity: 0.7;
    margin-top: 0.25rem;
  }

  .panel {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(232, 220, 184, 0.2);
    border-radius: 10px;
    padding: 1.1rem 1.25rem;
  }

  .panel h2 {
    margin: 0 0 0.75rem 0;
    font-size: 1.1rem;
    color: #e8dcb8;
  }

  .stat-line {
    margin: 0 0 0.4rem 0;
  }

  .section-note {
    margin: 0;
    opacity: 0.6;
    font-size: 0.85rem;
  }

  .trend-rising { color: #ff9e6b; }
  .trend-easing { color: #9ee89e; }
  .trend-steady { color: #cfd8dc; }

  .empty {
    opacity: 0.6;
    font-style: italic;
    margin: 0;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .event-list li,
  .tag-list li {
    padding: 0.6rem 0.8rem;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .event-list small {
    display: block;
    opacity: 0.6;
    margin-top: 0.2rem;
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
    border: 1px solid rgba(232, 220, 184, 0.2);
    border-radius: 8px;
    color: inherit;
    text-align: left;
    cursor: pointer;
  }

  .fragment-item:hover {
    background: rgba(232, 220, 184, 0.1);
  }

  .frag-title {
    font-weight: 600;
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

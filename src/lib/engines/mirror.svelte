<script lang="ts">
  import { goto } from "$app/navigation";

  const { data } = $props();

  const total = data?.total ?? 0;
  const fragments = data?.fragments ?? [];
  const identityPatterns = data?.identity_patterns ?? [];
  const identityShifts = data?.identity_shifts ?? [];

  function openFragment(id: string) {
    goto(`/dashboard/fragments/${id}`);
  }

  function formatDate(value: string | null) {
    if (!value) return "";
    const d = new Date(value);
    return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString();
  }
</script>

<div class="mirror-container">
  <header class="header">
    <h1>🪞 Mirror Engine</h1>
    <p class="subtitle">{total} Mirror fragments — identity tags and shifts within them.</p>
  </header>

  <section class="panel">
    <h2>Mirror Fragments</h2>
    {#if fragments.length === 0}
      <p class="empty">No Mirror fragments yet.</p>
    {:else}
      <div class="fragment-list">
        {#each fragments as f}
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
    <h2>Identity Tags</h2>
    <p class="section-note">How often each identity-related tag appears across your Mirror fragments.</p>
    {#if identityPatterns.length === 0}
      <p class="empty">No identity-related tags detected yet.</p>
    {:else}
      <ul class="tag-list">
        {#each identityPatterns as p}
          <li><strong>{p.tag}</strong> — {p.count} {p.count === 1 ? "time" : "times"}</li>
        {/each}
      </ul>
    {/if}
  </section>

  <section class="panel">
    <h2>Identity Shifts Over Time</h2>
    {#if identityShifts.length === 0}
      <p class="empty">No identity shifts detected yet.</p>
    {:else}
      <ul class="event-list">
        {#each identityShifts as s}
          <li>
            {#if s.gained.length > 0}
              <span>Gained: {s.gained.join(", ")}</span>
            {/if}
            {#if s.lost.length > 0}
              <span>Lost: {s.lost.join(", ")}</span>
            {/if}
            <small>{formatDate(s.timestamp)}</small>
          </li>
        {/each}
      </ul>
    {/if}
  </section>
</div>

<style>
  .mirror-container {
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
    padding: 1rem;
    color: #e8e8e8;
  }

  .header h1 {
    margin: 0;
    color: #cfd8ff;
  }

  .subtitle {
    opacity: 0.75;
    margin-top: 0.25rem;
  }

  .panel {
    background: rgba(120, 120, 150, 0.2);
    padding: 1.1rem 1.25rem;
    border-radius: 10px;
    border: 1px solid rgba(200, 200, 255, 0.2);
  }

  .panel h2 {
    margin: 0 0 0.75rem 0;
    font-size: 1.1rem;
    color: #dfe4ff;
  }

  .section-note {
    margin: 0 0 0.75rem 0;
    opacity: 0.6;
    font-size: 0.85rem;
  }

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

  .tag-list li,
  .event-list li {
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
    border: 1px solid rgba(200, 200, 255, 0.2);
    border-radius: 8px;
    color: inherit;
    text-align: left;
    cursor: pointer;
  }

  .fragment-item:hover {
    background: rgba(200, 200, 255, 0.1);
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

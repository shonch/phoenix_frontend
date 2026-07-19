<script lang="ts">
  const { data } = $props();

  const identityPatterns = data?.identity_patterns ?? [];
  const identityShifts = data?.identity_shifts ?? [];
  const mythicResonance = data?.mythic_resonance ?? [];
  const anchors = data?.anchors ?? [];

  function formatDate(value: string | null) {
    if (!value) return "";
    const d = new Date(value);
    return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString();
  }
</script>

<div class="mirror-container">
  <header class="header">
    <h1>🪞 Mirror Engine</h1>
    <p class="subtitle">Identity tags, shifts, and resonance across your fragments.</p>
  </header>

  <section class="panel">
    <h2>Identity Anchors</h2>
    {#if anchors.length === 0}
      <p class="empty">No identity anchors detected yet.</p>
    {:else}
      <ul class="tag-list">
        {#each anchors as a}
          <li><strong>{a.anchor}</strong> — {a.count} {a.count === 1 ? "time" : "times"}</li>
        {/each}
      </ul>
    {/if}
  </section>

  <section class="panel">
    <h2>Identity Tags Overall</h2>
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

  <section class="panel">
    <h2>Mythic Resonance</h2>
    {#if mythicResonance.length === 0}
      <p class="empty">No mythic resonance detected yet.</p>
    {:else}
      <ul class="event-list">
        {#each mythicResonance as r}
          <li>
            <span>{r.match_count} {r.match_count === 1 ? "match" : "matches"}</span>
            <p class="preview">{r.content_preview}</p>
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

  .preview {
    margin: 0.3rem 0 0 0;
    opacity: 0.8;
    font-size: 0.9rem;
  }
</style>

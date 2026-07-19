<script lang="ts">
  const { data } = $props();

  const patterns = data?.patterns ?? [];
  const fatigueIndicators = data?.fatigue_indicators ?? [];
  const overridePatterns = data?.override_patterns ?? [];
  const cycles = data?.cycles ?? [];
  const anomalies = data?.anomalies ?? [];

  function formatDate(value: string | null) {
    if (!value) return "";
    const d = new Date(value);
    return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString();
  }
</script>

<div class="engine-container">
  <header class="engine-header">
    <h1>⚙️ Grind Engine</h1>
    <p class="subtitle">Friction, fatigue, and override patterns across your fragments.</p>
  </header>

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

  <section class="panel">
    <h2>Fatigue Indicators</h2>
    {#if fatigueIndicators.length === 0}
      <p class="empty">No fatigue indicators logged.</p>
    {:else}
      <ul class="event-list">
        {#each fatigueIndicators as f}
          <li>
            <strong>{f.type.replace(/_/g, " ")}</strong>
            {#if f.energy != null}<span> — energy: {f.energy}</span>{/if}
            <small>{formatDate(f.timestamp)}</small>
          </li>
        {/each}
      </ul>
    {/if}
  </section>

  <section class="panel">
    <h2>Override Actions</h2>
    {#if overridePatterns.length === 0}
      <p class="empty">No override actions logged.</p>
    {:else}
      <ul class="event-list">
        {#each overridePatterns as o}
          <li>
            <strong>{o.action}</strong>
            <small>{formatDate(o.timestamp)}</small>
          </li>
        {/each}
      </ul>
    {/if}
  </section>

  <section class="panel">
    <h2>Grind → Override Cycles</h2>
    {#if cycles.length === 0}
      <p class="empty">No grind-to-override cycles detected yet.</p>
    {:else}
      <ul class="event-list">
        {#each cycles as c}
          <li>
            Recovered <strong>{Math.round(c.time_between)} min</strong> after grinding
            <small>{formatDate(c.timestamp_scan)}</small>
          </li>
        {/each}
      </ul>
    {/if}
  </section>

  {#if anomalies.length > 0}
    <section class="panel">
      <h2>Notes</h2>
      <ul class="event-list">
        {#each anomalies as a}
          <li>{a.type.replace(/_/g, " ")}</li>
        {/each}
      </ul>
    </section>
  {/if}
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
</style>

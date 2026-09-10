<script lang="ts">
  import { goto } from "$app/navigation";

  const { data } = $props();

  const total = data?.total ?? 0;
  const fragments = data?.fragments ?? [];
  const echoes = data?.echoes ?? {};
  const symbols = data?.symbols ?? {};
  const cases = data?.cases ?? {};
  const caseFiles = cases?.files ?? [];

  function openFragment(id: string) {
    if (id) goto(`/dashboard/fragments/${id}`);
  }

  function formatDate(value: string | null) {
    if (!value) return "";
    const d = new Date(value);
    return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString();
  }
</script>

<div class="detective-container">
  <header class="header">
    <h1>🕵️ Detective Engine</h1>
    <p class="subtitle">{total} Detective fragments — clues, echoes, and unresolved threads.</p>
  </header>

  <section class="panel">
    <h2>Clues</h2>
    {#if fragments.length === 0}
      <p class="empty">No clues logged yet.</p>
    {:else}
      <p class="stat-line">
        <strong>{cases.resolved_count ?? 0}</strong> resolved —
        <strong>{cases.unresolved_count ?? 0}</strong> unresolved
      </p>
      <div class="event-list">
        {#each fragments as cl}
          <button class="event-item clickable" onclick={() => openFragment(cl.id)}>
            <span class="event-subject">{cl.subject ?? "Untitled"}</span>
            <span class="event-date">{formatDate(cl.date)}</span>
            {#if cl.weather}<span class="event-weather">{cl.weather}</span>{/if}
            {#if cl.snippet}<span class="event-snippet">{cl.snippet}</span>{/if}
          </button>
        {/each}
      </div>
    {/if}
  </section>

  <section class="panel">
    <h2>Echoes</h2>
    {#if !echoes.intensity}
      <p class="empty">No repeating patterns detected yet.</p>
    {:else}
      <p class="stat-line">Echo intensity: <strong>{echoes.intensity}</strong></p>

      {#if echoes.subjects?.length > 0}
        <h3>Repeated Subjects</h3>
        <ul class="tag-list">
          {#each echoes.subjects as s}
            <li>{s.subject} — {s.count}×</li>
          {/each}
        </ul>
      {/if}

      {#if echoes.tags?.length > 0}
        <h3>Repeated Tags</h3>
        <ul class="tag-list">
          {#each echoes.tags as t}
            <li>{t.tag} — {t.count}×</li>
          {/each}
        </ul>
      {/if}
    {/if}
  </section>

  <section class="panel">
    <h2>Symbolic Density</h2>
    {#if !symbols.symbolic_density}
      <p class="empty">No symbolic patterns detected yet.</p>
    {:else}
      <p class="stat-line">{symbols.symbolic_density} distinct tags in play</p>
      {#if symbols.top_tags?.length > 0}
        <ul class="tag-list">
          {#each symbols.top_tags as t}
            <li>{t.tag} — {t.count}×</li>
          {/each}
        </ul>
      {/if}
    {/if}
  </section>

  <section class="panel">
    <h2>Unresolved Threads</h2>
    <p class="section-note">A clue is "unresolved" until it shares 2 or more real tags with another fragment.</p>
    {#if caseFiles.length === 0}
      <p class="empty">No unresolved threads clustered yet.</p>
    {:else}
      <div class="event-list">
        {#each caseFiles as file}
          <div class="case-item">
            <strong>{file.symbol}</strong> — {file.count} related clues
            {#if file.dominant_weather}<span class="event-weather">{file.dominant_weather}</span>{/if}
          </div>
        {/each}
      </div>
    {/if}
  </section>
</div>

<style>
  .detective-container {
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
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
    background: rgba(20, 40, 80, 0.35);
    padding: 1.1rem 1.25rem;
    border-radius: 10px;
    border: 1px solid rgba(150, 180, 255, 0.25);
  }

  .panel h2 {
    margin: 0 0 0.75rem 0;
    font-size: 1.1rem;
    color: #9fb8ff;
  }

  .panel h3 {
    margin: 0.75rem 0 0.4rem 0;
    font-size: 0.9rem;
    opacity: 0.8;
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

  .stat-line {
    margin: 0;
    font-size: 1.05rem;
  }

  .event-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 0.75rem;
  }

  .event-item, .case-item {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding: 0.6rem 0.8rem;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: inherit;
    text-align: left;
    cursor: default;
  }

  .event-item.clickable {
    cursor: pointer;
  }

  .event-item.clickable:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  .event-subject {
    font-weight: 600;
  }

  .event-date, .event-weather {
    font-size: 0.8rem;
    opacity: 0.7;
  }

  .event-snippet {
    font-size: 0.85rem;
    opacity: 0.85;
  }

  .tag-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }
</style>

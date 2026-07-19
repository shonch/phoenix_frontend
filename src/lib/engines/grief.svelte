<script lang="ts">
  import { goto } from "$app/navigation";

  const { data } = $props();

  const totalFragments = data?.total_emotional_fragments ?? 0;
  const griefEvents = data?.grief_events ?? 0;
  const recentGrief = data?.recent_grief ?? [];

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
    <h1>💙 Grief Engine</h1>
    <p class="subtitle">Waves of grief across your fragments.</p>
  </header>

  <section class="panel">
    <p class="stat-line">
      <strong>{griefEvents}</strong> of <strong>{totalFragments}</strong>
      emotional fragments have touched grief.
    </p>
  </section>

  <section class="panel">
    <h2>Recent Grief Fragments</h2>

    {#if recentGrief.length === 0}
      <p class="empty">No grief fragments logged yet.</p>
    {:else}
      <div class="fragment-list">
        {#each recentGrief as f}
          <button class="fragment-item" onclick={() => openFragment(f.id)}>
            <span class="frag-subject">{f.subject ?? "Untitled"}</span>
            <span class="frag-date">{formatDate(f.date)}</span>
            {#if f.weather}
              <span class="frag-weather">{f.weather}</span>
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

  .frag-date {
    font-size: 0.8rem;
    opacity: 0.7;
  }

  .frag-weather {
    font-size: 0.85rem;
    opacity: 0.8;
    font-style: italic;
  }
</style>

<script lang="ts">
  import { goto } from "$app/navigation";

  const { data } = $props();

  const totalThresholds = data?.total_thresholds ?? 0;
  const fatigueEvents = data?.fatigue_events ?? 0;
  const recentFatigue = data?.recent_fatigue ?? [];

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
    <p class="subtitle">Boundaries and fatigue across your thresholds.</p>
  </header>

  <section class="panel">
    <p class="stat-line">
      <strong>{fatigueEvents}</strong> of <strong>{totalThresholds}</strong>
      thresholds have touched fatigue.
    </p>
  </section>

  <section class="panel">
    <h2>Recent Fatigue Events</h2>

    {#if recentFatigue.length === 0}
      <p class="empty">No fatigue events logged yet.</p>
    {:else}
      <div class="event-list">
        {#each recentFatigue as ev}
          <button
            class="event-item"
            class:clickable={!!ev.id}
            onclick={() => openFragment(ev.id)}
          >
            <span class="event-subject">{ev.subject ?? "Threshold event"}</span>
            {#if ev.weather}<span class="event-weather">{ev.weather}</span>{/if}
            <span class="event-date">{formatDate(ev.date)}</span>
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

  .event-weather,
  .event-date {
    font-size: 0.8rem;
    opacity: 0.7;
  }
</style>

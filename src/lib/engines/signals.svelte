<script lang="ts">
  const { data } = $props();

  const emotionalSignals = data?.emotional ?? {};
  const evolvingTags = data?.evolving_tags ?? [];
  const legacyExcluded = data?.legacy_fragments_excluded ?? 0;
</script>

<div class="signals-container">
  <header class="header">
    <h1>📡 Signals Engine</h1>
    <p class="subtitle">Activity and movement across your real ritual types.</p>
  </header>

  <section class="panel">
    <h2>Activity by Ritual Type</h2>
    {#if !emotionalSignals.active?.length && !emotionalSignals.recent?.length && !emotionalSignals.dormant?.length}
      <p class="empty">No ritual activity yet.</p>
    {:else}
      <div class="signal-grid">
        {#each emotionalSignals.active ?? [] as type}
          <div class="signal-item">
            <span class="type-name">{type}</span>
            <span class="status-badge active">active</span>
            {#if emotionalSignals.rising?.includes(type)}<span class="status-badge rising">rising</span>{/if}
            {#if emotionalSignals.fading?.includes(type)}<span class="status-badge fading">fading</span>{/if}
          </div>
        {/each}
        {#each emotionalSignals.recent ?? [] as type}
          <div class="signal-item">
            <span class="type-name">{type}</span>
            <span class="status-badge recent">recent</span>
          </div>
        {/each}
        {#each emotionalSignals.dormant ?? [] as type}
          <div class="signal-item">
            <span class="type-name">{type}</span>
            <span class="status-badge dormant">dormant</span>
          </div>
        {/each}
      </div>
    {/if}
    <p class="section-note">
      "Rising" and "fading" need at least 10 logged fragments of a given type before they can be detected.
    </p>
  </section>

  <section class="panel">
    <h2>Evolving Tags</h2>
    <p class="section-note">Tags that have appeared across more than one real ritual type.</p>
    {#if evolvingTags.length === 0}
      <p class="empty">No evolving tags detected yet.</p>
    {:else}
      <ul class="tag-list">
        {#each evolvingTags as t}
          <li><strong>{t.tag}</strong> — {t.ritual_types.join(", ")}</li>
        {/each}
      </ul>
    {/if}
  </section>

  {#if legacyExcluded > 0}
    <p class="legacy-note">
      {legacyExcluded} older fragments from earlier versions of Phoenix were excluded from this view.
    </p>
  {/if}
</div>

<style>
  .signals-container {
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
    padding: 1rem;
    color: #d8f0ff;
  }

  .header h1 {
    margin: 0;
    color: #7fd4ff;
  }

  .subtitle {
    opacity: 0.75;
    margin-top: 0.25rem;
  }

  .panel {
    background: rgba(10, 40, 60, 0.35);
    padding: 1.1rem 1.25rem;
    border-radius: 10px;
    border: 1px solid rgba(127, 212, 255, 0.2);
  }

  .panel h2 {
    margin: 0 0 0.75rem 0;
    font-size: 1.1rem;
    color: #a6e6ff;
  }

  .section-note {
    margin: 0.6rem 0 0 0;
    opacity: 0.55;
    font-size: 0.82rem;
  }

  .empty {
    opacity: 0.6;
    font-style: italic;
    margin: 0;
  }

  .signal-grid {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .signal-item {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.6rem 0.9rem;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .type-name {
    font-weight: 600;
    text-transform: capitalize;
  }

  .status-badge {
    font-size: 0.75rem;
    padding: 0.15rem 0.5rem;
    border-radius: 999px;
    opacity: 0.85;
  }

  .status-badge.active {
    background: rgba(120, 220, 150, 0.2);
    color: #8fe6a8;
  }

  .status-badge.recent {
    background: rgba(220, 190, 120, 0.2);
    color: #e6c87f;
  }

  .status-badge.dormant {
    background: rgba(150, 150, 150, 0.2);
    color: #a8a8a8;
  }

  .status-badge.rising {
    background: rgba(255, 140, 100, 0.2);
    color: #ff9c7a;
  }

  .status-badge.fading {
    background: rgba(150, 150, 220, 0.2);
    color: #b0b0e6;
  }

  .tag-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .tag-list li {
    padding: 0.6rem 0.8rem;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .legacy-note {
    opacity: 0.5;
    font-size: 0.8rem;
    font-style: italic;
    margin: 0;
  }
</style>

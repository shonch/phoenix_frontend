<script lang="ts">
  const { data } = $props();

  const emotional = data?.emotional ?? {};
  const symbolic = data?.symbolic ?? {};
  const mythic = data?.mythic ?? {};
  const system = data?.system ?? {};

  const bucketTypes = [
    ...new Set([
      ...(emotional.active ?? []),
      ...(emotional.dormant ?? []),
      ...(emotional.rising ?? []),
      ...(emotional.fading ?? []),
    ])
  ];
</script>

<div class="signals-container">
  <header class="header">
    <h1>📡 Signals Engine</h1>
    <p class="subtitle">Activity and movement across your ritual types.</p>
  </header>

  <section class="panel">
    <h2>Activity by Ritual Type</h2>

    {#if bucketTypes.length === 0}
      <p class="empty">Not enough activity yet to detect signals.</p>
    {:else}
      <ul class="signal-list">
        {#each bucketTypes as type}
          <li>
            <strong>{type}</strong>
            <div class="badges">
              {#if emotional.active?.includes(type)}<span class="badge active">active</span>{/if}
              {#if emotional.dormant?.includes(type)}<span class="badge dormant">dormant</span>{/if}
              {#if emotional.rising?.includes(type)}<span class="badge rising">rising</span>{/if}
              {#if emotional.fading?.includes(type)}<span class="badge fading">fading</span>{/if}
            </div>
          </li>
        {/each}
      </ul>
    {/if}

    <p class="note">
      "Rising" and "fading" need at least 10 logged fragments of a given type
      before they can be detected — they'll appear once there's enough history.
    </p>
  </section>

  {#if emotional.unresolved?.length > 0}
    <section class="panel">
      <h2>Unresolved</h2>
      <p>{emotional.unresolved.length} fragment(s) marked unresolved.</p>
    </section>
  {/if}

  {#if symbolic.evolving?.length > 0}
    <section class="panel">
      <h2>Evolving Tags</h2>
      <p class="note">Tags that have appeared across more than one ritual type.</p>
      <ul class="tag-list">
        {#each symbolic.evolving as tag}
          <li>{tag}</li>
        {/each}
      </ul>
    </section>
  {/if}

  {#if mythic.active?.length > 0}
    <section class="panel">
      <h2>Mythic Activity</h2>
      <p>{mythic.active.length} mythic fragment(s) logged in the last 7 days.</p>
    </section>
  {/if}
</div>

<style>
  .signals-container {
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
    padding: 1rem;
    color: #e6ddff;
  }

  .header h1 {
    margin: 0;
    color: #c7a6ff;
  }

  .subtitle {
    opacity: 0.75;
    margin-top: 0.25rem;
  }

  .panel {
    background: rgba(40, 20, 80, 0.3);
    padding: 1.1rem 1.25rem;
    border-radius: 10px;
    border: 1px solid rgba(200, 160, 255, 0.25);
  }

  .panel h2 {
    margin: 0 0 0.75rem 0;
    font-size: 1.1rem;
    color: #dcc8ff;
  }

  .empty {
    opacity: 0.6;
    font-style: italic;
    margin: 0;
  }

  .note {
    opacity: 0.6;
    font-size: 0.85rem;
    margin-top: 0.75rem;
  }

  .signal-list,
  .tag-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .signal-list li {
    padding: 0.6rem 0.8rem;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .badges {
    display: flex;
    gap: 0.4rem;
  }

  .badge {
    font-size: 0.75rem;
    padding: 0.2rem 0.5rem;
    border-radius: 999px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .badge.active { background: rgba(120, 220, 150, 0.2); color: #8ef0a8; }
  .badge.dormant { background: rgba(150, 150, 150, 0.2); color: #b0b0b0; }
  .badge.rising { background: rgba(255, 190, 100, 0.2); color: #ffcf80; }
  .badge.fading { background: rgba(150, 170, 255, 0.2); color: #a8bcff; }

  .tag-list li {
    padding: 0.5rem 0.8rem;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
</style>

<script lang="ts">
  const { data } = $props();

  const triggers = data?.triggers ?? [];
  const contexts = data?.contexts ?? [];
  const intensityProfile = data?.intensity_profile ?? [];
</script>

<div class="frisson-container">
  <header class="header">
    <h1>⚡ Frisson Engine</h1>
    <p class="subtitle">Awe, chills, and resonance triggers across your fragments.</p>
  </header>

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

  {#if intensityProfile.length > 0}
    <section class="panel">
      <h2>Intensity Profile</h2>
      <ul class="item-list">
        {#each intensityProfile as p}
          <li><strong>{p.bucket}</strong> — {p.count} {p.count === 1 ? "time" : "times"}</li>
        {/each}
      </ul>
    </section>
  {/if}
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
</style>

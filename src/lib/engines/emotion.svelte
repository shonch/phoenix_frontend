<script lang="ts">
  import { goto } from "$app/navigation";

  const { data } = $props();

  const totalFragments = data?.total ?? 0;
  const fragments = data?.fragments ?? [];
  const recurringWords = data?.recurring_words ?? [];
  const trendLabel = data?.trend_label ?? null;

  let expandedWord = $state<string | null>(null);

  function toggleWord(word: string) {
    expandedWord = expandedWord === word ? null : word;
  }

  function openFragment(id: string) {
    goto(`/dashboard/fragments/${id}`);
  }

  function formatDate(iso: string | null) {
    if (!iso) return "";
    const d = new Date(iso);
    return isNaN(d.getTime()) ? "" : d.toLocaleDateString();
  }
</script>

<div class="frequency-panel">
  <header class="header">
    <h1>💫 Emotion Engine</h1>
    <p class="subtitle">
      {totalFragments} Emotion {totalFragments === 1 ? "fragment" : "fragments"}
      {#if trendLabel}— {trendLabel}{/if}
    </p>
  </header>

  <section>
    <h2 class="section-title">🔥 Emotion Fragments</h2>

    {#if fragments.length === 0}
      <p class="empty">No Emotion fragments yet.</p>
    {:else}
      <div class="fragment-list standalone">
        {#each fragments as f}
          <button class="fragment-item" onclick={() => openFragment(f.id)}>
            <span class="frag-date">{formatDate(f.date)}</span>
            {#if f.title}<span class="frag-title">{f.title}</span>{/if}
            <span class="frag-snippet">{f.snippet}</span>
          </button>
        {/each}
      </div>
    {/if}
  </section>

  <section>
    <h2 class="section-title">🏷️ Recurring Words</h2>
    <p class="section-note">
      Words from a fixed list that recur across your Emotion fragments — a
      secondary pattern, not a category the fragment itself was sorted into.
    </p>

    {#if recurringWords.length === 0}
      <p class="empty">No recurring words yet.</p>
    {:else}
      <div class="entries">
        {#each recurringWords as w}
          <div class="entry">
            <button class="entry-header" onclick={() => toggleWord(w.word)}>
              <span class="ember-word">{w.word}</span>
              <span class="count">{w.count} {w.count === 1 ? "time" : "times"}</span>
            </button>

            {#if expandedWord === w.word}
              <div class="fragment-list">
                {#each w.fragments as f}
                  <button class="fragment-item" onclick={() => openFragment(f.id)}>
                    <span class="frag-date">{formatDate(f.date)}</span>
                    <span class="frag-snippet">{f.snippet}</span>
                  </button>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </section>
</div>

<style>
  .frequency-panel {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
    padding: 1rem;
    color: #f0e6ff;
  }

  .header h1 {
    margin: 0;
    color: #c9a6ff;
  }

  .subtitle {
    opacity: 0.8;
    margin-top: 0.25rem;
  }

  .section-title {
    margin: 0 0 0.25rem 0;
    font-size: 1.3rem;
  }

  .section-note {
    margin: 0 0 1rem 0;
    opacity: 0.7;
    font-size: 0.9rem;
  }

  .empty {
    opacity: 0.6;
    font-style: italic;
  }

  .entries {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .entry {
    border: 1px solid rgba(201, 166, 255, 0.25);
    border-radius: 10px;
    overflow: hidden;
    background: rgba(201, 166, 255, 0.05);
  }

  .entry-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem 1rem;
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    font-size: 1rem;
    text-align: left;
  }

  .entry-header:hover {
    background: rgba(201, 166, 255, 0.12);
  }

  .ember-word {
    text-transform: capitalize;
    font-weight: 600;
  }

  .count {
    opacity: 0.75;
    font-size: 0.85rem;
  }

  .fragment-list {
    display: flex;
    flex-direction: column;
    border-top: 1px solid rgba(201, 166, 255, 0.18);
  }

  .fragment-list.standalone {
    border-top: none;
    gap: 0.4rem;
  }

  .fragment-item {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding: 0.7rem 1rem;
    background: rgba(201, 166, 255, 0.05);
    border: 1px solid rgba(201, 166, 255, 0.15);
    border-radius: 8px;
    color: inherit;
    text-align: left;
    cursor: pointer;
  }

  .fragment-list:not(.standalone) .fragment-item {
    border: none;
    border-bottom: 1px solid rgba(201, 166, 255, 0.1);
    border-radius: 0;
    background: none;
  }

  .fragment-list:not(.standalone) .fragment-item:last-child {
    border-bottom: none;
  }

  .fragment-item:hover {
    background: rgba(201, 166, 255, 0.12);
  }

  .frag-date {
    font-size: 0.75rem;
    opacity: 0.6;
  }

  .frag-title {
    font-size: 0.95rem;
    font-weight: 600;
    opacity: 0.9;
  }

  .frag-snippet {
    font-size: 0.9rem;
    opacity: 0.9;
  }
</style>

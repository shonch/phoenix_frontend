<script lang="ts">
  import { goto } from "$app/navigation";

  const { data } = $props();

  const dominantEmotions = data?.dominant_emotions ?? [];
  const tagFrequency = data?.tag_frequency ?? [];

  let expandedEmotion = $state<string | null>(null);
  let expandedTag = $state<string | null>(null);

  function toggleEmotion(emotion: string) {
    expandedEmotion = expandedEmotion === emotion ? null : emotion;
  }

  function toggleTag(tag: string) {
    expandedTag = expandedTag === tag ? null : tag;
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
    <p class="subtitle">How often each feeling and tag has risen in your fragments.</p>
  </header>

  <section>
    <h2 class="section-title">🔥 Emotional Embers</h2>

    {#if dominantEmotions.length === 0}
      <p class="empty">No emotional embers have risen yet.</p>
    {:else}
      <div class="entries">
        {#each dominantEmotions as e}
          <div class="entry">
            <button class="entry-header" onclick={() => toggleEmotion(e.emotion)}>
              <span class="ember-word">{e.emotion}</span>
              <span class="count">{e.count} {e.count === 1 ? "ember" : "embers"} risen</span>
            </button>

            {#if expandedEmotion === e.emotion}
              <div class="fragment-list">
                {#each e.fragments as f}
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

  <section>
    <h2 class="section-title">🏷️ Tag Echoes</h2>
    <p class="section-note">
      Some of these are still rough — that's expected while the tag vocabulary
      is refined.
    </p>

    {#if tagFrequency.length === 0}
      <p class="empty">No tag echoes yet.</p>
    {:else}
      <div class="entries">
        {#each tagFrequency as t}
          <div class="entry">
            <button class="entry-header" onclick={() => toggleTag(t.tag)}>
              <span class="ember-word">{t.tag}</span>
              <span class="count">{t.count} {t.count === 1 ? "echo" : "echoes"}</span>
            </button>

            {#if expandedTag === t.tag}
              <div class="fragment-list">
                {#each t.fragments as f}
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

  .fragment-item {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding: 0.7rem 1rem;
    background: none;
    border: none;
    border-bottom: 1px solid rgba(201, 166, 255, 0.1);
    color: inherit;
    text-align: left;
    cursor: pointer;
  }

  .fragment-item:last-child {
    border-bottom: none;
  }

  .fragment-item:hover {
    background: rgba(201, 166, 255, 0.1);
  }

  .frag-date {
    font-size: 0.75rem;
    opacity: 0.6;
  }

  .frag-snippet {
    font-size: 0.9rem;
    opacity: 0.9;
  }
</style>

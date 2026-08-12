<script lang="ts">
  import { onMount } from "svelte";
  import { apiFetch } from "$lib/api";

  let transactions = $state([]);
  let fragments = $state([]);
  let loading = $state(true);
  let error = $state("");
  let days = $state(14);

  async function loadGlen() {
    loading = true;
    error = "";

    try {
      const data = await apiFetch(`/valhalla/glen/?days=${days}`);
      transactions = data.transactions ?? [];
      fragments = data.fragments ?? [];
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  onMount(loadGlen);

  function formatDate(d: string) {
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? d : dt.toLocaleDateString();
  }
</script>


<div class="glen">
  <div class="haze"></div>

  <h1 class="title">The Glen</h1>
  <p class="subtitle">Money and feeling, laid side by side. Draw your own thread between them.</p>

  <div class="window-select">
    <label>
      Look back
      <select bind:value={days} onchange={loadGlen}>
        <option value={7}>7 days</option>
        <option value={14}>14 days</option>
        <option value={30}>30 days</option>
      </select>
    </label>
  </div>

  {#if loading}
    <p class="loading">The mist is settling...</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else}
    <div class="columns">
      <div class="column">
        <h2>Transactions</h2>
        {#if transactions.length === 0}
          <p class="empty">Nothing carved in this window.</p>
        {:else}
          {#each transactions as t}
            <div class="entry">
              <span class="entry-date">{formatDate(t.date)}</span>
              <span class="entry-main">{t.category} — ${t.amount?.toFixed?.(2) ?? t.amount}</span>
              <span class="entry-sub">{t.type}</span>
            </div>
          {/each}
        {/if}
      </div>

      <div class="column">
        <h2>Fragments</h2>
        {#if fragments.length === 0}
          <p class="empty">Nothing offered in this window.</p>
        {:else}
          {#each fragments as f}
            <div class="entry">
              <span class="entry-date">{formatDate(f.date)}</span>
              <span class="entry-main">{f.subject ?? "Untitled"}</span>
              {#if f.tags?.length}
                <span class="entry-sub">{f.tags.map(t => t.name ?? t).join(", ")}</span>
              {/if}
            </div>
          {/each}
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .glen {
    position: relative;
    max-width: 900px;
    margin: 4rem auto;
    padding: 3rem 2.5rem;
    color: #dce8f0;
  }

  .haze {
    position: absolute;
    inset: -20%;
    background: radial-gradient(circle at 50% 30%, rgba(150, 200, 170, 0.08), transparent 70%);
    filter: blur(60px);
    pointer-events: none;
    z-index: 0;
  }

  .title {
    position: relative;
    z-index: 2;
    font-family: 'Cinzel', serif;
    font-size: 2rem;
    letter-spacing: 0.08em;
    margin: 0 0 0.3rem 0;
    text-shadow: 0 0 16px rgba(150, 200, 170, 0.3);
  }

  .subtitle {
    position: relative;
    z-index: 2;
    opacity: 0.6;
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
    font-style: italic;
  }

  .window-select {
    position: relative;
    z-index: 2;
    margin-bottom: 2rem;
  }

  .window-select label {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 0.85rem;
    opacity: 0.8;
  }

  .window-select select {
    padding: 0.4rem 0.6rem;
    border-radius: 6px;
    background: rgba(150, 200, 170, 0.08);
    border: 1px solid rgba(150, 200, 170, 0.25);
    color: #dce8f0;
  }

  .columns {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }

  .column h2 {
    font-family: 'Cinzel', serif;
    font-size: 1.1rem;
    opacity: 0.8;
    margin-bottom: 1rem;
  }

  .entry {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    padding: 0.7rem 0.9rem;
    margin-bottom: 0.6rem;
    background: rgba(150, 200, 170, 0.05);
    border: 1px solid rgba(150, 200, 170, 0.15);
    border-radius: 8px;
  }

  .entry-date {
    font-size: 0.75rem;
    opacity: 0.5;
  }

  .entry-main {
    font-size: 0.95rem;
  }

  .entry-sub {
    font-size: 0.8rem;
    opacity: 0.6;
    font-style: italic;
  }

  .empty, .loading, .error {
    opacity: 0.6;
    font-style: italic;
  }

  .error {
    color: #f0a0a0;
  }
</style>

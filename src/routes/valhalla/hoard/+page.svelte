<script lang="ts">
  import { authStore } from "$lib/authStore";
  import { get } from "svelte/store";
  import { PUBLIC_API_URL } from '$env/static/public';
  import { onMount } from "svelte";

  let name = $state("");
  let value = $state("");
  let loading = $state(false);
  let error = $state("");
  let assets = $state([]);
  let totalAssets = $state(0);
  let totalDebt = $state(0);
  let netWorth = $state(0);
  let dataLoading = $state(true);

  async function loadHoard() {
    dataLoading = true;
    const auth = get(authStore);
    try {
      const res = await fetch(`${PUBLIC_API_URL}/valhalla/hoard/view`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        assets = data.assets ?? [];
        totalAssets = data.total_assets ?? 0;
        totalDebt = data.total_debt ?? 0;
        netWorth = data.net_worth ?? 0;
      }
    } catch (e) {
      // silent — form still usable even if the view fails
    } finally {
      dataLoading = false;
    }
  }

  onMount(loadHoard);

  async function addAsset() {
    error = "";
    if (!name || !value) {
      error = "The Hoard needs a name and a value.";
      return;
    }

    loading = true;
    const auth = get(authStore);

    try {
      const res = await fetch(`${PUBLIC_API_URL}/valhalla/hoard/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify({ name, value: parseFloat(value) })
      });

      if (!res.ok) {
        const data = await res.json();
        const msg = Array.isArray(data.detail)
          ? data.detail.map(d => d.msg).join(", ")
          : data.detail;
        throw new Error(msg || "The Hoard would not accept this.");
      }

      name = "";
      value = "";
      await loadHoard();
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }
</script>

<div class="hoard-chamber">
  <h1 class="title">The Hoard</h1>
  <p class="subtitle">What is truly yours, weighed against what is owed.</p>

  {#if dataLoading}
    <p class="loading">Counting the gold...</p>
  {:else}
    <div class="summary">
      <div class="summary-item">
        <span class="label">Held</span>
        <span class="value held">${totalAssets.toFixed(2)}</span>
      </div>
      <div class="summary-item">
        <span class="label">Owed</span>
        <span class="value owed">${totalDebt.toFixed(2)}</span>
      </div>
      <div class="summary-item net-item">
        <span class="label">Net Worth</span>
        <span class="value {netWorth >= 0 ? 'positive' : 'negative'}">
          ${netWorth.toFixed(2)}
        </span>
      </div>
    </div>
  {/if}

  <form onsubmit={(e) => { e.preventDefault(); addAsset(); }}>
    <div class="row">
      <label>
        Asset Name
        <input type="text" bind:value={name} placeholder="Savings, checking..." />
      </label>
      <label>
        Value
        <input type="number" step="0.01" bind:value={value} placeholder="0.00" />
      </label>
    </div>

    {#if error}<p class="error">{error}</p>{/if}

    <button type="submit" class="submit-btn" disabled={loading}>
      {loading ? "Adding..." : "Add to the Hoard"}
    </button>
  </form>

  <div class="assets-section">
    <h2>Held</h2>
    {#if assets.length === 0}
      <p class="empty">Nothing in the Hoard yet.</p>
    {:else}
      {#each assets as a}
        <div class="asset-row">
          <span>{a.name}</span>
          <span>${a.value?.toFixed?.(2) ?? a.value}</span>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .hoard-chamber {
    max-width: 560px;
    margin: 4rem auto;
    padding: 3rem 2.5rem;
    background: radial-gradient(circle at center, #14120a, #000);
    border: 1px solid rgba(220, 190, 100, 0.3);
    border-radius: 12px;
    color: #f0e8d8;
  }

  .title {
    font-family: 'Cinzel', serif;
    font-size: 1.8rem;
    letter-spacing: 0.08em;
    margin: 0 0 0.3rem 0;
    text-shadow: 0 0 16px rgba(220, 190, 100, 0.35);
  }

  .subtitle {
    opacity: 0.6;
    font-size: 0.9rem;
    margin-bottom: 2rem;
    font-style: italic;
  }

  .summary {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 2rem;
    padding: 1.2rem 1.5rem;
    background: rgba(220, 190, 100, 0.06);
    border: 1px solid rgba(220, 190, 100, 0.2);
    border-radius: 10px;
  }

  .summary-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    flex: 1;
  }

  .label {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    opacity: 0.6;
  }

  .value {
    font-size: 1.2rem;
    font-family: 'Cinzel', serif;
  }

  .held { color: #e8d896; }
  .owed { color: #d69f9f; }
  .positive { color: #9fd6a0; }
  .negative { color: #d69f9f; }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .row {
    display: flex;
    gap: 1rem;
  }

  .row label {
    flex: 1;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    font-size: 0.85rem;
    opacity: 0.85;
  }

  input {
    padding: 0.55rem 0.75rem;
    border-radius: 6px;
    background: rgba(220, 190, 100, 0.06);
    border: 1px solid rgba(220, 190, 100, 0.25);
    color: #f0e8d8;
    font-size: 0.95rem;
    font-family: inherit;
  }

  input:focus {
    outline: none;
    border-color: rgba(220, 190, 100, 0.6);
  }

  .submit-btn {
    padding: 0.7rem;
    border-radius: 999px;
    border: 1px solid rgba(220, 190, 100, 0.4);
    background: linear-gradient(135deg, rgba(220,190,100,0.15), rgba(180,150,60,0.15));
    color: #f0e8d8;
    font-family: 'Cinzel', serif;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    font-size: 0.9rem;
    cursor: pointer;
  }

  .submit-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(220,190,100,0.28), rgba(180,150,60,0.28));
  }

  .submit-btn:disabled {
    opacity: 0.5;
  }

  .error {
    color: #f0a0a0;
    font-size: 0.85rem;
    margin: 0;
  }

  .assets-section {
    border-top: 1px solid rgba(220, 190, 100, 0.2);
    padding-top: 1.2rem;
  }

  .assets-section h2 {
    font-family: 'Cinzel', serif;
    font-size: 1.1rem;
    opacity: 0.85;
    margin-bottom: 0.75rem;
  }

  .asset-row {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0.7rem;
    margin-bottom: 0.4rem;
    background: rgba(220, 190, 100, 0.05);
    border: 1px solid rgba(220, 190, 100, 0.15);
    border-radius: 6px;
    font-size: 0.9rem;
  }

  .empty, .loading {
    opacity: 0.6;
    font-style: italic;
  }
</style>

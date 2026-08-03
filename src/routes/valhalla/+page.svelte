<script lang="ts">
  import { onMount } from "svelte";
  import { authStore } from "$lib/authStore";
  import { get } from "svelte/store";
  import { PUBLIC_API_URL } from '$env/static/public';

  let balance = $state(null);
  let loading = $state(true);
  let error = $state("");

  onMount(async () => {
    const auth = get(authStore);
    try {
      const res = await fetch(`${PUBLIC_API_URL}/valhalla/balances/view`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      if (!res.ok) throw new Error("Could not reach the Hall's ledger.");
      balance = await res.json();
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  });

  const runes = [
    { name: "The Ledger", desc: "Offer a transaction", href: "/valhalla/ledger" },
    { name: "The Burdens", desc: "Debts & recurring bills", href: "/valhalla/burdens" },
    { name: "The Harvest", desc: "Income", href: "/valhalla/harvest" },
    { name: "The Reckoning", desc: "Reconcile with the bank", href: "/valhalla/reckoning" },
    { name: "The Hoard", desc: "Assets & net worth", href: "/valhalla/hoard" },
    { name: "The Glen", desc: "Money & feeling, side by side", href: "/valhalla/glen" }
  ];
</script>

<div class="hall">
  <div class="mist"></div>
  <div class="rune-ring"></div>

  <h1 class="hall-title">The Hall</h1>

  {#if loading}
    <p class="loading">The ledger stirs...</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else}
    <div class="summary">
      <div class="summary-item">
        <span class="label">Harvest</span>
        <span class="value income">${balance.income_total.toFixed(2)}</span>
      </div>
      <div class="summary-item">
        <span class="label">Burdens</span>
        <span class="value expense">${balance.expense_total.toFixed(2)}</span>
      </div>
      <div class="summary-item balance-item">
        <span class="label">Balance</span>
        <span class="value {balance.balance >= 0 ? 'positive' : 'negative'}">
          ${balance.balance.toFixed(2)}
        </span>
      </div>
    </div>
  {/if}

  <div class="rune-grid">
    {#each runes as rune}
      <a href={rune.href} class="rune-card">
        <h3>{rune.name}</h3>
        <p>{rune.desc}</p>
      </a>
    {/each}
  </div>
</div>

<style>
  .hall {
    position: relative;
    min-height: 100vh;
    padding: 4rem 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: radial-gradient(circle at center, #0a0e14, #000);
    color: #dce8f0;
    overflow: hidden;
  }

  .mist {
    position: absolute;
    inset: -30%;
    background:
      radial-gradient(circle at 30% 20%, rgba(120, 170, 220, 0.12), transparent 70%),
      radial-gradient(circle at 70% 80%, rgba(200, 190, 140, 0.08), transparent 75%);
    filter: blur(50px);
    pointer-events: none;
    z-index: 0;
  }

  .rune-ring {
    position: absolute;
    top: 15%;
    left: 50%;
    width: 500px;
    height: 500px;
    transform: translateX(-50%);
    border-radius: 50%;
    border: 1px solid rgba(150, 190, 220, 0.15);
    box-shadow: 0 0 60px rgba(120, 170, 220, 0.1);
    pointer-events: none;
    z-index: 0;
  }

  .hall-title {
    position: relative;
    z-index: 2;
    font-family: 'Cinzel', serif;
    font-size: 2.5rem;
    letter-spacing: 0.1em;
    text-shadow: 0 0 20px rgba(150, 190, 220, 0.4);
    margin-bottom: 2rem;
  }

  .summary {
    position: relative;
    z-index: 2;
    display: flex;
    gap: 2rem;
    margin-bottom: 3rem;
    padding: 1.5rem 2.5rem;
    background: rgba(10, 14, 20, 0.6);
    border: 1px solid rgba(150, 190, 220, 0.2);
    border-radius: 12px;
    backdrop-filter: blur(8px);
  }

  .summary-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
  }

  .label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    opacity: 0.6;
  }

  .value {
    font-size: 1.4rem;
    font-family: 'Cinzel', serif;
  }

  .income { color: #9fd6a0; }
  .expense { color: #d69f9f; }
  .positive { color: #9fd6a0; }
  .negative { color: #d69f9f; }

  .rune-grid {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.5rem;
    max-width: 900px;
    width: 100%;
  }

  .rune-card {
    display: block;
    padding: 1.5rem;
    background: rgba(10, 14, 20, 0.5);
    border: 1px solid rgba(150, 190, 220, 0.2);
    border-radius: 12px;
    text-decoration: none;
    color: inherit;
    transition: all 0.2s ease;
  }

  .rune-card:hover {
    border-color: rgba(150, 190, 220, 0.5);
    background: rgba(150, 190, 220, 0.08);
    transform: translateY(-2px);
  }

  .rune-card h3 {
    font-family: 'Cinzel', serif;
    margin: 0 0 0.4rem 0;
    font-size: 1.1rem;
  }

  .rune-card p {
    margin: 0;
    font-size: 0.85rem;
    opacity: 0.7;
  }

  .loading, .error {
    position: relative;
    z-index: 2;
    margin-bottom: 3rem;
    opacity: 0.7;
  }
</style>

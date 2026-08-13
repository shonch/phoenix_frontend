<script lang="ts">
  import { onMount } from "svelte";
  import { apiFetch } from "$lib/api";

  let bankBalance = $state("");
  let checked = $state(false);
  let valhallaBalance = $state(0);
  let transactions = $state([]);
  let loading = $state(false);
  let error = $state("");
  let showFullHistory = $state(false);
  let lastReckonedDate = $state(null);
  let confirmingDelete = $state(null);

  async function loadLastReckoned() {
    try {
      const data = await apiFetch(`/valhalla/setup/last-reckoned`);
      lastReckonedDate = data.last_reckoned_date;
    } catch (e) {
      // silent — non-critical
    }
  }

  onMount(loadLastReckoned);

  async function reckon() {
    error = "";
    if (!bankBalance) {
      error = "The Reckoning needs your bank's actual balance.";
      return;
    }

    loading = true;

    try {
      const balData = await apiFetch(`/valhalla/balances/available`);
      valhallaBalance = balData.balance ?? 0;

      const txData = await apiFetch(`/valhalla/transactions/`);
      transactions = (txData.transactions ?? [])
        .filter(t => (t.status ?? "posted") === "posted")
        .sort((a, b) => b.date.localeCompare(a.date));

      checked = true;
    } catch (e) {
      error = "The Reckoning could not be performed.";
    } finally {
      loading = false;
    }
  }

  async function markAgreed() {
    try {
      await apiFetch(`/valhalla/setup/mark-agreed`, { method: "POST" });
      await loadLastReckoned();
    } catch (e) {
      // silent — non-critical
    }
  }

  function requestDelete(transactionId) {
    if (confirmingDelete === transactionId) {
      doDelete(transactionId);
    } else {
      confirmingDelete = transactionId;
      setTimeout(() => {
        if (confirmingDelete === transactionId) confirmingDelete = null;
      }, 4000);
    }
  }

  async function doDelete(transactionId) {
    confirmingDelete = null;
    try {
      await apiFetch(`/valhalla/transactions/${transactionId}`, { method: "DELETE" });
      const txData = await apiFetch(`/valhalla/transactions/`);
      transactions = (txData.transactions ?? [])
        .filter(t => (t.status ?? "posted") === "posted")
        .sort((a, b) => b.date.localeCompare(a.date));
    } catch (e) {
      error = "Could not delete that transaction.";
    }
  }

  const gap = $derived(checked ? parseFloat(bankBalance) - valhallaBalance : 0);
  const recentTransactions = $derived(
    showFullHistory || !lastReckonedDate
      ? transactions
      : transactions.filter(t => t.date >= lastReckonedDate)
  );
</script>

<div class="reckoning-chamber">
  <h1 class="title">The Reckoning</h1>
  <p class="subtitle">Does the bank agree with the Hall?</p>

  <form onsubmit={(e) => { e.preventDefault(); reckon(); }}>
    <label>
      Your bank's actual balance, right now
      <input type="number" step="0.01" bind:value={bankBalance} placeholder="0.00" />
    </label>

    {#if error}<p class="error">{error}</p>{/if}

    <button type="submit" disabled={loading}>
      {loading ? "Reckoning..." : "Perform the Reckoning"}
    </button>
  </form>

  {#if checked}
    <div class="result">
      <div class="result-row">
        <span>The Hall says</span>
        <strong>${valhallaBalance.toFixed(2)}</strong>
      </div>
      <div class="result-row">
        <span>The bank says</span>
        <strong>${parseFloat(bankBalance).toFixed(2)}</strong>
      </div>
      <div class="result-row gap-row" class:agree={Math.abs(gap) < 0.01}>
        <span>{Math.abs(gap) < 0.01 ? "They agree." : "The gap"}</span>
        {#if Math.abs(gap) >= 0.01}
          <strong>${gap.toFixed(2)}</strong>
        {/if}
      </div>

      {#if Math.abs(gap) < 0.01}
        <button type="button" class="agree-btn" onclick={markAgreed}>Mark this Reckoning</button>
      {/if}
    </div>

    <div class="transactions-section">
      <div class="section-header">
        <h2>What The Hall Recorded</h2>
        <button type="button" class="toggle-btn" onclick={() => showFullHistory = !showFullHistory}>
          {showFullHistory ? "Show recent only" : "Show full history"}
        </button>
      </div>
      {#each recentTransactions as t}
        <div class="tx-row">
          <span class="tx-date">{t.date}</span>
          <span class="tx-main">{t.category} — {t.type === "expense" ? "-" : "+"}${t.amount?.toFixed?.(2) ?? t.amount}</span>
          <span class="tx-actions">
            <button
              type="button"
              class="rune-btn delete-btn"
              class:confirming={confirmingDelete === t.transaction_id}
              onclick={() => requestDelete(t.transaction_id)}
              title={confirmingDelete === t.transaction_id ? "Click again to confirm" : "Delete this transaction"}
            >
              {confirmingDelete === t.transaction_id ? "Confirm?" : "✕"}
            </button>
          </span>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .reckoning-chamber {
    max-width: 560px;
    margin: 4rem auto;
    padding: 3rem 2.5rem;
    background: radial-gradient(circle at center, #0a1410, #000);
    border: 1px solid rgba(150, 210, 180, 0.25);
    border-radius: 12px;
    color: #dcf0e8;
  }

  .title {
    font-family: 'Cinzel', serif;
    font-size: 1.8rem;
    letter-spacing: 0.08em;
    margin: 0 0 0.3rem 0;
    text-shadow: 0 0 16px rgba(150, 210, 180, 0.3);
  }

  .subtitle {
    opacity: 0.6;
    font-size: 0.9rem;
    margin-bottom: 2rem;
    font-style: italic;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    font-size: 0.85rem;
    opacity: 0.85;
  }

  input {
    padding: 0.6rem 0.8rem;
    border-radius: 6px;
    background: rgba(150, 210, 180, 0.06);
    border: 1px solid rgba(150, 210, 180, 0.25);
    color: #dcf0e8;
    font-size: 1rem;
    font-family: inherit;
  }

  button {
    padding: 0.7rem;
    border-radius: 999px;
    border: 1px solid rgba(150, 210, 180, 0.4);
    background: linear-gradient(135deg, rgba(150,210,180,0.15), rgba(100,170,140,0.15));
    color: #dcf0e8;
    font-family: 'Cinzel', serif;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    font-size: 0.9rem;
    cursor: pointer;
  }

  button:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(150,210,180,0.28), rgba(100,170,140,0.28));
  }

  button:disabled {
    opacity: 0.5;
  }

  .error {
    color: #f0a0a0;
    font-size: 0.85rem;
    margin: 0;
  }

  .result {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(150, 210, 180, 0.2);
  }

  .result-row {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    font-size: 0.95rem;
  }

  .gap-row {
    font-weight: bold;
    color: #f0c090;
  }

  .gap-row.agree {
    color: #9fd6a0;
  }

  .agree-btn {
    margin-top: 0.75rem;
    font-size: 0.75rem;
    padding: 0.5rem 1rem;
  }

  .transactions-section {
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(150, 210, 180, 0.15);
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .section-header h2 {
    font-family: 'Cinzel', serif;
    font-size: 1rem;
    opacity: 0.8;
    margin: 0;
  }

  .toggle-btn {
    font-size: 0.7rem;
    padding: 0.35rem 0.7rem;
    opacity: 0.7;
  }

  .tx-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    padding: 0.4rem 0.6rem;
    margin-bottom: 0.3rem;
    background: rgba(150, 210, 180, 0.05);
    border-radius: 6px;
    font-size: 0.85rem;
  }

  .tx-actions {
    display: flex;
    gap: 0.4rem;
    margin-left: auto;
    padding-left: 0.75rem;
  }

  .rune-btn {
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    border: 1px solid rgba(150, 210, 180, 0.3);
    background: rgba(150, 210, 180, 0.05);
    color: #dcf0e8;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .delete-btn:hover {
    border-color: rgba(240, 160, 160, 0.6);
    background: rgba(240, 160, 160, 0.1);
  }

  .delete-btn.confirming {
    border-color: rgba(240, 160, 160, 0.9);
    background: rgba(240, 160, 160, 0.25);
    color: #f0a0a0;
  }
</style>

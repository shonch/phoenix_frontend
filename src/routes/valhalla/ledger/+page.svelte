<script lang="ts">
  import { apiFetch } from "$lib/api";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  let amount = $state("");
  let type = $state("expense");
  let category = $state("");
  let date = $state(new Date().toISOString().slice(0, 10));
  let source = $state("");
  let description = $state("");
  let loading = $state(false);
  let error = $state("");
  let success = $state(false);

  let burdens = $state([]);
  let selectedBurdenId = $state("");

  onMount(async () => {
    try {
      const data = await apiFetch("/valhalla/setup/dashboard");
      burdens = (data.commitments ?? []).filter(c => c.setup_id);
    } catch (e) {
      // silent — burden selection is optional, form still works without it
    }
  });

  async function carve() {
    error = "";
    if (!amount || !category || !source) {
      error = "The Ledger needs an amount, a category, and a source.";
      return;
    }

    loading = true;

    try {
      await apiFetch("/valhalla/transactions/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          type,
          category,
          date,
          source,
          description: description || "No description"
        })
      });

      if (selectedBurdenId) {
        await apiFetch(`/valhalla/setup/${selectedBurdenId}/pay`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: parseFloat(amount) })
        });
      }

      success = true;
      setTimeout(() => goto("/valhalla"), 1200);
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }
</script>

<div class="ledger-chamber">
  <div class="tally-stick"></div>

  <h1 class="title">The Ledger</h1>
  <p class="subtitle">Carve the truth of what moved, and why.</p>

  {#if success}
    <p class="success">Carved into the Ledger.</p>
  {:else}
    <form onsubmit={(e) => { e.preventDefault(); carve(); }}>
      <div class="row">
        <label>
          Amount
          <input type="number" step="0.01" bind:value={amount} placeholder="0.00" />
        </label>

        <label>
          Type
          <select bind:value={type}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
	    <option value="adjustment">Adjustment (opening balance, correction)</option>
          </select>
        </label>
      </div>

      <label>
        Category
        <input type="text" bind:value={category} placeholder="groceries, rent, wages..." />
      </label>

      <div class="row">
        <label>
          Date
          <input type="date" bind:value={date} />
        </label>

        <label>
          Source
          <input type="text" bind:value={source} placeholder="chase checking, cash..." />
        </label>
      </div>

      {#if type === "expense" && burdens.length > 0}
        <label>
          Paying off a Burden? <span class="optional">(optional)</span>
          <select bind:value={selectedBurdenId}>
            <option value="">Not a burden payment</option>
            {#each burdens as b}
              <option value={b.setup_id}>{b.name}</option>
            {/each}
          </select>
        </label>
      {/if}

      <label>
        Description <span class="optional">(optional)</span>
        <textarea bind:value={description} rows="3" placeholder="What was this, really?"></textarea>
      </label>

      {#if error}<p class="error">{error}</p>{/if}

      <button type="submit" disabled={loading}>
        {loading ? "Carving..." : "Carve it into the Ledger"}
      </button>
    </form>
  {/if}
</div>

<style>
  .ledger-chamber {
    position: relative;
    max-width: 520px;
    margin: 4rem auto;
    padding: 3rem 2.5rem 3rem 3.5rem;
    background: radial-gradient(circle at center, #0a0e14, #000);
    border: 1px solid rgba(150, 190, 220, 0.2);
    border-radius: 12px;
    color: #dce8f0;
  }

  .tally-stick {
    position: absolute;
    left: 0;
    top: 1.5rem;
    bottom: 1.5rem;
    width: 6px;
    background: linear-gradient(to bottom, rgba(150,190,220,0.05), rgba(150,190,220,0.05));
    background-image: repeating-linear-gradient(
      to bottom,
      rgba(150, 190, 220, 0.35) 0px,
      rgba(150, 190, 220, 0.35) 2px,
      transparent 2px,
      transparent 18px
    );
    box-shadow: 0 0 8px rgba(150, 190, 220, 0.3);
  }

  .title {
    font-family: 'Cinzel', serif;
    font-size: 1.8rem;
    letter-spacing: 0.08em;
    margin: 0 0 0.3rem 0;
    text-shadow: 0 0 16px rgba(150, 190, 220, 0.35);
  }

  .subtitle {
    opacity: 0.6;
    font-size: 0.9rem;
    margin-bottom: 2rem;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
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
    opacity: 0.8;
  }

  .optional {
    opacity: 0.5;
    font-weight: normal;
  }

  input, select, textarea {
    padding: 0.6rem 0.8rem;
    border-radius: 6px;
    background: rgba(150, 190, 220, 0.06);
    border: 1px solid rgba(150, 190, 220, 0.25);
    color: #dce8f0;
    font-size: 1rem;
    font-family: inherit;
  }

  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: rgba(150, 190, 220, 0.6);
    box-shadow: 0 0 12px rgba(150, 190, 220, 0.25);
  }

  button {
    margin-top: 0.5rem;
    padding: 0.8rem;
    border-radius: 999px;
    border: 1px solid rgba(150, 190, 220, 0.4);
    background: linear-gradient(135deg, rgba(150,190,220,0.15), rgba(100,140,180,0.15));
    color: #dce8f0;
    font-family: 'Cinzel', serif;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  button:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(150,190,220,0.28), rgba(100,140,180,0.28));
    box-shadow: 0 0 16px rgba(150, 190, 220, 0.2);
  }

  button:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .error {
    color: #f0a0a0;
    font-size: 0.85rem;
    margin: 0;
  }

  .success {
    text-align: center;
    color: #9fd6a0;
    font-size: 1.1rem;
    padding: 2rem 0;
  }
</style>

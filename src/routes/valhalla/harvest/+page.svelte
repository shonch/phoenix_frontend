<script lang="ts">
  import { authStore } from "$lib/authStore";
  import { get } from "svelte/store";
  import { PUBLIC_API_URL } from '$env/static/public';
  import { goto } from "$app/navigation";

  let amount = $state("");
  let category = $state("");
  let date = $state(new Date().toISOString().slice(0, 10));
  let source = $state("");
  let description = $state("");
  let loading = $state(false);
  let error = $state("");
  let success = $state(false);

  async function reap() {
    error = "";
    if (!amount || !category || !source) {
      error = "The Harvest needs an amount, a category, and a source.";
      return;
    }

    loading = true;
    const auth = get(authStore);

    try {
      const res = await fetch(`${PUBLIC_API_URL}/valhalla/transactions/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          type: "income",
          category,
          date,
          source,
          description: description || "No description"
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "The Harvest would not accept this offering.");
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

<div class="harvest-chamber">
  <div class="grain-mark"></div>

  <h1 class="title">The Harvest</h1>
  <p class="subtitle">What was gathered, and by what labor?</p>

  {#if success}
    <p class="success">Gathered into the Harvest.</p>
  {:else}
    <form onsubmit={(e) => { e.preventDefault(); reap(); }}>
      <label>
        Amount
        <input type="number" step="0.01" bind:value={amount} placeholder="0.00" />
      </label>

      <label>
        Category
        <input type="text" bind:value={category} placeholder="wages, gift, freelance..." />
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

      <label>
        Description <span class="optional">(optional)</span>
        <textarea bind:value={description} rows="3" placeholder="What was this, really?"></textarea>
      </label>

      {#if error}<p class="error">{error}</p>{/if}

      <button type="submit" disabled={loading}>
        {loading ? "Gathering..." : "Gather it into the Harvest"}
      </button>
    </form>
  {/if}
</div>

<style>
  .harvest-chamber {
    position: relative;
    max-width: 520px;
    margin: 4rem auto;
    padding: 3rem 2.5rem;
    background: radial-gradient(circle at center, #0a0e14, #000);
    border: 1px solid rgba(200, 190, 140, 0.25);
    border-radius: 12px;
    color: #dce8f0;
  }

  .grain-mark {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, transparent, rgba(200, 190, 140, 0.5), transparent);
  }

  .title {
    font-family: 'Cinzel', serif;
    font-size: 1.8rem;
    letter-spacing: 0.08em;
    margin: 0 0 0.3rem 0;
    text-shadow: 0 0 16px rgba(200, 190, 140, 0.3);
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

  input, textarea {
    padding: 0.6rem 0.8rem;
    border-radius: 6px;
    background: rgba(200, 190, 140, 0.06);
    border: 1px solid rgba(200, 190, 140, 0.25);
    color: #dce8f0;
    font-size: 1rem;
    font-family: inherit;
  }

  input:focus, textarea:focus {
    outline: none;
    border-color: rgba(200, 190, 140, 0.6);
    box-shadow: 0 0 12px rgba(200, 190, 140, 0.25);
  }

  button {
    margin-top: 0.5rem;
    padding: 0.8rem;
    border-radius: 999px;
    border: 1px solid rgba(200, 190, 140, 0.4);
    background: linear-gradient(135deg, rgba(200,190,140,0.15), rgba(160,150,100,0.15));
    color: #dce8f0;
    font-family: 'Cinzel', serif;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  button:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(200,190,140,0.28), rgba(160,150,100,0.28));
    box-shadow: 0 0 16px rgba(200, 190, 140, 0.2);
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

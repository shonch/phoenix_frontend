<script lang="ts">
  import { apiFetch } from "$lib/api";
  import { goto } from "$app/navigation";

  let step = $state(0);
  let whatHappened = $state("");
  let symbolicImage = $state("");
  let newBalance = $state("");

  let loading = $state(false);
  let error = $state("");
  let result = $state(null);

  const steps = [
    {
      id: "opening",
      label: "The Reckoning",
      prompt: "The Stone asks: what happened?"
    },
    {
      id: "symbolic_image",
      label: "Symbolic Image",
      prompt: "What single image marks this ending?"
    },
    {
      id: "threshold",
      label: "The New Balance",
      prompt: "What is your true balance now?"
    }
  ];

  function next() {
    error = "";
    if (step === 0 && !whatHappened.trim()) {
      error = "The Stone requires an answer before you continue.";
      return;
    }
    step += 1;
  }

  function back() {
    error = "";
    step -= 1;
  }

  async function complete() {
    error = "";
    if (!newBalance || isNaN(parseFloat(newBalance))) {
      error = "A true balance is required to complete the reset.";
      return;
    }

    loading = true;
    try {
      const res = await apiFetch("/valhalla/ragnarok/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          what_happened: whatHappened,
          symbolic_image: symbolicImage,
          new_balance: parseFloat(newBalance)
        })
      });
      result = res;
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }
</script>

<div class="ash-chamber">
  <div class="ember-field"></div>
  <div class="crack"></div>

  {#if result}
    <div class="aftermath">
      <h1 class="title">Ragnarök</h1>
      <p class="subtitle">The old ledger ends here. A new one begins.</p>

      <div class="summary">
        <div class="summary-row">
          <span class="label">Previous Balance</span>
          <span class="value">${result.previous_balance.toFixed(2)}</span>
        </div>
        <div class="summary-row">
          <span class="label">New Balance</span>
          <span class="value new">${result.new_balance.toFixed(2)}</span>
        </div>
        <div class="summary-row">
          <span class="label">Adjustment</span>
          <span class="value {result.adjustment_amount >= 0 ? 'positive' : 'negative'}">
            {result.adjustment_amount >= 0 ? "+" : ""}${result.adjustment_amount.toFixed(2)}
          </span>
        </div>
      </div>

      <button class="return-btn" onclick={() => goto("/valhalla")}>
        Return to the Hall
      </button>
    </div>
  {:else}
    <h1 class="title">Ragnarök</h1>
    <p class="subtitle">The ledger has gone dark. Before it wakes again, it must be reckoned with.</p>

    <div class="step-indicator">
      {#each steps as s, i}
        <div class="dot {i === step ? 'active' : ''} {i < step ? 'done' : ''}"></div>
      {/each}
    </div>

    <div class="step">
      <h2 class="step-label">{steps[step].label}</h2>
      <p class="prompt">{steps[step].prompt}</p>

      {#if step === 0}
        <textarea
          bind:value={whatHappened}
          rows="5"
          placeholder="What kept you away?"
        ></textarea>
      {:else if step === 1}
        <textarea
          bind:value={symbolicImage}
          rows="3"
          placeholder="Optional — what image marks this ending?"
        ></textarea>
      {:else if step === 2}
        <input
          type="number"
          step="0.01"
          bind:value={newBalance}
          placeholder="0.00"
        />
      {/if}

      {#if error}<p class="error">{error}</p>{/if}

      <div class="actions">
        {#if step > 0}
          <button class="back-btn" onclick={back} disabled={loading}>Back</button>
        {/if}

        {#if step < steps.length - 1}
          <button class="next-btn" onclick={next}>Continue</button>
        {:else}
          <button class="complete-btn" onclick={complete} disabled={loading}>
            {loading ? "Reckoning…" : "Complete the Reset"}
          </button>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .ash-chamber {
    position: relative;
    min-height: 100vh;
    padding: 4rem 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: radial-gradient(circle at center, #140a0a, #000);
    color: #f0dcdc;
    overflow: hidden;
  }

  .ember-field {
    position: absolute;
    inset: -30%;
    background:
      radial-gradient(circle at 30% 20%, rgba(220, 90, 60, 0.14), transparent 70%),
      radial-gradient(circle at 70% 80%, rgba(180, 40, 30, 0.1), transparent 75%);
    filter: blur(50px);
    pointer-events: none;
    z-index: 0;
    animation: emberPulse 6s ease-in-out infinite alternate;
  }

  @keyframes emberPulse {
    from { opacity: 0.6; }
    to   { opacity: 1; }
  }

  .crack {
    position: absolute;
    top: 0;
    left: 50%;
    width: 2px;
    height: 40%;
    background: linear-gradient(to bottom, rgba(255, 140, 80, 0.5), transparent);
    transform: translateX(-50%) rotate(3deg);
    pointer-events: none;
    z-index: 0;
  }

  .title {
    position: relative;
    z-index: 2;
    font-family: 'Cinzel', serif;
    font-size: 2.6rem;
    letter-spacing: 0.12em;
    text-shadow: 0 0 24px rgba(220, 90, 60, 0.5);
    margin-bottom: 0.4rem;
  }

  .subtitle {
    position: relative;
    z-index: 2;
    font-style: italic;
    opacity: 0.65;
    font-size: 0.95rem;
    margin-bottom: 2.5rem;
    text-align: center;
    max-width: 420px;
  }

  .step-indicator {
    position: relative;
    z-index: 2;
    display: flex;
    gap: 0.6rem;
    margin-bottom: 2.5rem;
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: rgba(220, 90, 60, 0.2);
    border: 1px solid rgba(220, 90, 60, 0.4);
    transition: all 0.3s ease;
  }

  .dot.active {
    background: rgba(220, 90, 60, 0.9);
    box-shadow: 0 0 12px rgba(220, 90, 60, 0.7);
  }

  .dot.done {
    background: rgba(220, 90, 60, 0.5);
  }

  .step {
    position: relative;
    z-index: 2;
    width: 100%;
    max-width: 480px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    background: rgba(20, 10, 10, 0.6);
    border: 1px solid rgba(220, 90, 60, 0.25);
    border-radius: 12px;
    padding: 2rem;
    backdrop-filter: blur(8px);
  }

  .step-label {
    font-family: 'Cinzel', serif;
    font-size: 1.1rem;
    opacity: 0.85;
    margin: 0;
  }

  .prompt {
    font-size: 1rem;
    opacity: 0.9;
    margin: 0 0 0.5rem 0;
  }

  textarea, input {
    padding: 0.7rem 0.9rem;
    border-radius: 8px;
    background: rgba(220, 90, 60, 0.06);
    border: 1px solid rgba(220, 90, 60, 0.3);
    color: #f0dcdc;
    font-size: 1rem;
    font-family: inherit;
    resize: vertical;
  }

  textarea:focus, input:focus {
    outline: none;
    border-color: rgba(220, 90, 60, 0.7);
    box-shadow: 0 0 12px rgba(220, 90, 60, 0.25);
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.8rem;
    margin-top: 0.5rem;
  }

  button {
    padding: 0.7rem 1.4rem;
    border-radius: 999px;
    border: 1px solid rgba(220, 90, 60, 0.4);
    background: linear-gradient(135deg, rgba(220,90,60,0.15), rgba(160,50,30,0.15));
    color: #f0dcdc;
    font-family: 'Cinzel', serif;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  button:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(220,90,60,0.3), rgba(160,50,30,0.3));
    box-shadow: 0 0 16px rgba(220, 90, 60, 0.25);
  }

  button:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .back-btn {
    background: transparent;
    opacity: 0.6;
  }

  .error {
    color: #f0a0a0;
    font-size: 0.85rem;
    margin: 0;
  }

  .aftermath {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .summary {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    background: rgba(20, 10, 10, 0.6);
    border: 1px solid rgba(220, 90, 60, 0.25);
    border-radius: 12px;
    padding: 2rem 2.5rem;
    margin-bottom: 2rem;
    min-width: 300px;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    gap: 2rem;
  }

  .summary-row .label {
    font-size: 0.8rem;
    opacity: 0.6;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .summary-row .value {
    font-family: 'Cinzel', serif;
    font-size: 1.1rem;
  }

  .value.new {
    color: #f0c090;
  }

  .value.positive {
    color: #9fd6a0;
  }

  .value.negative {
    color: #d69f9f;
  }

  .return-btn {
    padding: 0.8rem 2rem;
  }
</style>

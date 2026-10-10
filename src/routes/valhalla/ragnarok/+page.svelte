<script lang="ts">
  import { apiFetch } from "$lib/api";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  let step = $state(0);
  let whatHappened = $state("");
  let symbolicImage = $state("");
  let newBalance = $state("");

  let loading = $state(false);
  let error = $state("");
  let result = $state(null);

  // One random id per reset attempt. The server claims it before doing any
  // work, so a second click on a slow server, or a resend after a lost
  // response, can never run the reset twice.
  const requestId =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  // The gap: Burden payments that came due while the Ledger was dark.
  let gapLoading = $state(true);
  let gapError = $state("");
  let gapBurdens = $state([]);
  let gapStart = $state(null);
  // setup_id -> how many cycles (oldest first) the user says were paid
  let paidCount = $state<Record<string, number>>({});

  const baseSteps = [
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
      id: "burdens",
      label: "The Burdens",
      prompt: "While the ledger was dark, some Burdens came due. Which were paid?"
    },
    {
      id: "threshold",
      label: "The New Balance",
      prompt: "What is your true balance now?"
    }
  ];

  // The Burdens step only exists when something actually came due.
  let steps = $derived(
    baseSteps.filter((s) => s.id !== "burdens" || gapBurdens.length > 0)
  );
  let current = $derived(steps[step]);

  let totalMarked = $derived(
    Object.values(paidCount).reduce((sum, n) => sum + (n || 0), 0)
  );

  function messageFrom(e, fallback) {
    const raw = e?.message;
    if (!raw) return fallback;
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed?.detail === "string") return parsed.detail;
    } catch {
      // not JSON — use as-is
    }
    return raw;
  }

  function money(n) {
    return Number(n ?? 0).toFixed(2);
  }

  async function loadGap() {
    gapLoading = true;
    gapError = "";
    try {
      const res = await apiFetch("/valhalla/ragnarok/gap");
      gapBurdens = res.burdens ?? [];
      gapStart = res.gap_start ?? null;
    } catch (e) {
      gapBurdens = [];
      gapError = messageFrom(e, "Could not read which Burdens came due.");
    } finally {
      gapLoading = false;
    }
  }

  onMount(loadGap);

  // Cycles must be applied oldest-first, so the checkboxes behave as a
  // prefix: ticking one ticks everything before it; unticking one unticks
  // everything after it.
  function toggleCycle(burden, index) {
    const count = paidCount[burden.setup_id] ?? 0;
    paidCount[burden.setup_id] = index < count ? index : index + 1;
  }

  function next() {
    error = "";
    if (current.id === "opening" && !whatHappened.trim()) {
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
    if (loading) return;
    error = "";
    if (!newBalance || isNaN(parseFloat(newBalance))) {
      error = "A true balance is required to complete the reset.";
      return;
    }

    const paid = gapBurdens
      .filter((b) => (paidCount[b.setup_id] ?? 0) > 0)
      .map((b) => ({ setup_id: b.setup_id, cycles: paidCount[b.setup_id] }));

    loading = true;
    try {
      const res = await apiFetch("/valhalla/ragnarok/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_id: requestId,
          what_happened: whatHappened,
          symbolic_image: symbolicImage,
          new_balance: parseFloat(newBalance),
          paid
        })
      });
      result = res;
    } catch (e) {
      error = messageFrom(e, "The reset could not be completed.");
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

      {#if result.already_recorded}
        <p class="note">This reset had already been recorded — nothing was run a second time.</p>
      {/if}

      <div class="summary">
        <div class="summary-row">
          <span class="label">Previous Balance</span>
          <span class="value">${money(result.previous_balance)}</span>
        </div>
        <div class="summary-row">
          <span class="label">New Balance</span>
          <span class="value new">${money(result.new_balance)}</span>
        </div>
        <div class="summary-row">
          <span class="label">Adjustment</span>
          <span class="value {result.adjustment_amount >= 0 ? 'positive' : 'negative'}">
            {result.adjustment_amount >= 0 ? "+" : ""}${money(result.adjustment_amount)}
          </span>
        </div>
      </div>

      {#if result.burdens_paid?.length}
        <div class="summary paid-summary">
          <div class="paid-heading">Burdens marked paid</div>
          {#each result.burdens_paid as p}
            <div class="paid-row">
              <span>{p.name}</span>
              <span class="paid-detail">
                {p.cycles} payment{p.cycles === 1 ? "" : "s"}
                {#if p.paid_off}· paid off{:else if p.new_due_date}· next due {p.new_due_date}{/if}
              </span>
            </div>
          {/each}
        </div>
      {/if}

      {#if result.burden_errors?.length}
        <div class="summary">
          {#each result.burden_errors as msg}
            <p class="error">{msg}</p>
          {/each}
        </div>
      {/if}

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
      <h2 class="step-label">{current.label}</h2>
      <p class="prompt">{current.prompt}</p>

      {#if current.id === "opening"}
        <textarea
          bind:value={whatHappened}
          rows="5"
          placeholder="What kept you away?"
        ></textarea>
      {:else if current.id === "symbolic_image"}
        <textarea
          bind:value={symbolicImage}
          rows="3"
          placeholder="Optional — what image marks this ending?"
        ></textarea>
      {:else if current.id === "burdens"}
        <p class="explain">
          Tick each payment that was made{gapStart ? ` since ${gapStart}` : ""}. Anything left
          unticked stays overdue. No transactions are created — your true balance, entered next,
          already reflects the money that left.
        </p>

        <div class="burden-list">
          {#each gapBurdens as b (b.setup_id)}
            <div class="burden-card">
              <div class="burden-head">
                <span class="burden-name">{b.name}</span>
                <span class="burden-amount">${money(b.amount)}</span>
              </div>
              {#if b.plan_name}<div class="burden-plan">{b.plan_name}</div>{/if}

              {#each b.cycles as cy, idx}
                <label class="cycle">
                  <input
                    type="checkbox"
                    checked={idx < (paidCount[b.setup_id] ?? 0)}
                    onchange={() => toggleCycle(b, idx)}
                  />
                  <span>Due {cy.due_date}</span>
                  {#if cy.before_gap}
                    <span class="tag">already overdue before your last entry</span>
                  {/if}
                </label>
              {/each}

              {#if b.truncated}
                <p class="hint">More payments than this are overdue; the oldest are shown first.</p>
              {/if}
            </div>
          {/each}
        </div>

        <p class="tally">
          {totalMarked} payment{totalMarked === 1 ? "" : "s"} marked paid
        </p>
      {:else if current.id === "threshold"}
        <input
          type="number"
          step="0.01"
          bind:value={newBalance}
          placeholder="0.00"
        />
        {#if gapError}
          <p class="hint">
            The Burdens that came due could not be read ({gapError}), so none will be marked
            paid in this reset.
          </p>
        {/if}
      {/if}

      {#if error}<p class="error">{error}</p>{/if}

      <div class="actions">
        {#if step > 0}
          <button class="back-btn" onclick={back} disabled={loading}>Back</button>
        {/if}

        {#if step < steps.length - 1}
          <button
            class="next-btn"
            onclick={next}
            disabled={gapLoading && current.id === "symbolic_image"}
          >
            {gapLoading && current.id === "symbolic_image" ? "Reading the Burdens…" : "Continue"}
          </button>
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

  input[type="checkbox"] {
    padding: 0;
    width: 1.05rem;
    height: 1.05rem;
    accent-color: #dc5a3c;
    cursor: pointer;
    flex-shrink: 0;
  }

  .explain {
    margin: 0;
    font-size: 0.85rem;
    opacity: 0.7;
    line-height: 1.5;
  }

  .burden-list {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    max-height: 22rem;
    overflow-y: auto;
    padding-right: 0.2rem;
  }

  .burden-card {
    padding: 0.7rem 0.9rem;
    background: rgba(220, 90, 60, 0.06);
    border: 1px solid rgba(220, 90, 60, 0.25);
    border-radius: 8px;
  }

  .burden-head {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    font-size: 0.95rem;
  }

  .burden-name {
    font-family: 'Cinzel', serif;
    letter-spacing: 0.03em;
  }

  .burden-plan {
    font-size: 0.75rem;
    opacity: 0.55;
    margin-bottom: 0.3rem;
  }

  .cycle {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-top: 0.45rem;
    font-size: 0.88rem;
    cursor: pointer;
  }

  .tag {
    font-size: 0.72rem;
    color: #f0a0a0;
    opacity: 0.85;
  }

  .tally {
    margin: 0;
    font-size: 0.82rem;
    opacity: 0.7;
    text-align: right;
  }

  .hint {
    margin: 0.4rem 0 0;
    font-size: 0.78rem;
    opacity: 0.6;
    font-style: italic;
  }

  .note {
    position: relative;
    z-index: 2;
    margin: 0 0 1.2rem;
    font-size: 0.85rem;
    color: #f0c090;
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

  .paid-summary {
    padding: 1.4rem 2rem;
    text-align: left;
  }

  .paid-heading {
    font-size: 0.8rem;
    opacity: 0.6;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .paid-row {
    display: flex;
    justify-content: space-between;
    gap: 1.5rem;
    font-size: 0.9rem;
  }

  .paid-detail {
    opacity: 0.65;
    font-size: 0.8rem;
  }

  .return-btn {
    padding: 0.8rem 2rem;
  }
</style>

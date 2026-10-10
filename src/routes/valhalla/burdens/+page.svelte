<script lang="ts">
  import { apiFetch } from "$lib/api";
  import { onMount } from "svelte";

  let name = $state("");
  let planName = $state("");
  let category = $state("Debt");
  let amount = $state("");
  let recurrence = $state("monthly");
  let paymentsRemaining = $state("");
  let currentBalance = $state("");
  let dueDate = $state(new Date().toISOString().slice(0, 10));
  let archetype = $state("");
  let symbolicTag = $state("");
  let symbolicTime = $state("");
  let startDate = $state("");
  let endDate = $state("");
  let components = $state([]);
  let loading = $state(false);
  let error = $state("");
  let success = $state(false);

  let burdens = $state([]);
  let totalOutflow = $state(null);
  let expandedPlans = $state({});
  let confirmingDelete = $state(null);

  const symbolicTimeOptions = [
    { value: "🌅 Morning", label: "🌅 Morning" },
    { value: "🌙 Evening", label: "🌙 Evening" },
    { value: "🌀 Transition", label: "🌀 Transition" },
    { value: "🔥 Urgency", label: "🔥 Urgency" },
    { value: "💧 Release", label: "💧 Release" },
  ];

  const recurrenceLabels = {
    none: "one-time",
    weekly: "weekly",
    biweekly: "biweekly",
    monthly: "monthly",
    quarterly: "quarterly",
    annually: "annually",
  };

  // Plans: Burdens sharing a plan_name are shown together (e.g. a debt
  // company's whole payment schedule). Everything else lists individually.
  let planNames = $derived([...new Set(burdens.map((b) => b.plan_name).filter(Boolean))]);

  let groupedPlans = $derived.by(() => {
    const map = {};
    for (const b of burdens) {
      if (!b.plan_name) continue;
      (map[b.plan_name] ??= []).push(b);
    }
    return Object.entries(map).map(([plan, items]) => ({
      plan,
      items,
      total: items.reduce((sum, i) => sum + (Number(i.amount) || 0), 0),
      next: items[0]?.due_date,
      overdueCount: items.filter((i) => i.overdue).length,
    }));
  });

  let ungrouped = $derived(burdens.filter((b) => !b.plan_name));

  function addComponent() {
    components = [...components, { label: "", amount: "", tag: "" }];
  }

  function removeComponent(i: number) {
    components = components.filter((_, idx) => idx !== i);
  }

  function togglePlan(plan) {
    expandedPlans[plan] = !expandedPlans[plan];
  }

  function money(n) {
    return Number(n ?? 0).toFixed(2);
  }

  async function loadBurdens() {
    try {
      const [list, dash] = await Promise.all([
        apiFetch("/valhalla/setup/list"),
        apiFetch("/valhalla/setup/dashboard"),
      ]);
      burdens = list.burdens ?? [];
      totalOutflow = dash.total_outflow ?? null;
    } catch (e) {
      // silent — the list is secondary to the form itself
    }
  }

  onMount(loadBurdens);

  function requestDeleteBurden(setupId) {
    if (confirmingDelete === setupId) {
      doDeleteBurden(setupId);
    } else {
      confirmingDelete = setupId;
      setTimeout(() => {
        if (confirmingDelete === setupId) confirmingDelete = null;
      }, 4000);
    }
  }

  async function doDeleteBurden(setupId) {
    confirmingDelete = null;
    try {
      await apiFetch(`/valhalla/setup/${setupId}`, { method: "DELETE" });
      await loadBurdens();
    } catch (e) {
      error = "Could not remove that burden.";
    }
  }

  async function bind_() {
    error = "";
    if (!name || !amount || !dueDate) {
      error = "The Burdens need at least a name, amount, and due date.";
      return;
    }

    loading = true;

    try {
      await apiFetch("/valhalla/setup/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          plan_name: planName || null,
          category,
          amount: parseFloat(amount),
          recurrence,
          payments_remaining:
            recurrence !== "none" && paymentsRemaining ? parseInt(paymentsRemaining) : null,
          current_balance: currentBalance ? parseFloat(currentBalance) : null,
          due_date: dueDate,
          archetype: archetype || "Unassigned",
          symbolic_tag: symbolicTag || "Untitled",
          symbolic_time: symbolicTime || null,
          start_date: startDate || null,
          end_date: endDate || null,
          components: components
            .filter((c) => c.label)
            .map((c) => ({ name: c.label, amount: parseFloat(c.amount) || 0, description: c.tag || null })),
        }),
      });

      // Stay on the page so a whole payment plan can be entered one payment at
      // a time. Name, plan, category, amount and recurrence carry over (each
      // payment is still entered by hand); the fields that are specific to
      // one payment are cleared.
      success = true;
      dueDate = "";
      startDate = "";
      endDate = "";
      paymentsRemaining = "";
      currentBalance = "";
      components = [];
      await loadBurdens();
      setTimeout(() => {
        success = false;
      }, 2500);
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }
</script>

{#snippet burdenRow(c)}
  <div class="commitment-row" class:overdue={c.overdue}>
    <div class="commitment-top">
      <span class="commitment-name">{c.name}</span>
      <span class="commitment-amount">${money(c.amount)}</span>
      <button
        type="button"
        class="rune-btn delete-btn"
        class:confirming={confirmingDelete === c.setup_id}
        onclick={() => requestDeleteBurden(c.setup_id)}
        title={confirmingDelete === c.setup_id ? "Click again to confirm" : "Remove this burden"}
      >
        {confirmingDelete === c.setup_id ? "Confirm?" : "✕"}
      </button>
    </div>
    <span class="commitment-due">
      {c.due_date} — {recurrenceLabels[c.recurrence] ?? c.recurrence}
      {#if c.overdue}<strong class="overdue-tag"> · overdue</strong>{/if}
      {#if c.payments_remaining != null} · {c.payments_remaining} payments left{/if}
    </span>
  </div>
{/snippet}

<div class="burdens-chamber">
  <h1 class="title">The Burdens</h1>
  <p class="subtitle">Name the weight. Every piece of it, not just the part that shows.</p>

  {#if success}
    <p class="success">Bound into the Burdens.</p>
  {/if}

  <form onsubmit={(e) => { e.preventDefault(); bind_(); }}>
    <label>
      Name
      <input type="text" bind:value={name} placeholder="Car payment, NetCredit payment..." />
    </label>

    <label>
      Plan <span class="optional">(optional — groups payments from one plan together)</span>
      <input type="text" bind:value={planName} list="plan-names" placeholder="NetCredit" />
      <datalist id="plan-names">
        {#each planNames as p}
          <option value={p}></option>
        {/each}
      </datalist>
    </label>

    <div class="row">
      <label>
        Category
        <select bind:value={category}>
          <option value="Debt">Debt</option>
          <option value="Subscription">Subscription</option>
          <option value="Symbolic">Symbolic</option>
          <option value="Legacy">Legacy</option>
        </select>
      </label>

      <label>
        Payment Amount
        <input type="number" step="0.01" bind:value={amount} placeholder="0.00" />
      </label>
    </div>

    <label>
      Recurrence
      <select bind:value={recurrence}>
        <option value="none">One-time</option>
        <option value="weekly">Weekly</option>
        <option value="biweekly">Biweekly</option>
        <option value="monthly">Monthly</option>
        <option value="quarterly">Quarterly</option>
        <option value="annually">Annually</option>
      </select>
    </label>

    {#if recurrence !== "none"}
      <label>
        Payments Remaining <span class="optional">(leave blank if it never ends)</span>
        <input type="number" min="1" step="1" bind:value={paymentsRemaining} placeholder="48" />
      </label>
    {/if}

    {#if category === "Debt"}
      <label>
        Current Remaining Balance <span class="optional">(optional, for reference only)</span>
        <input type="number" step="0.01" bind:value={currentBalance} placeholder="From your latest statement" />
      </label>
    {/if}

    <div class="row">
      <label>
        {recurrence === "none" ? "Due Date" : "First Due Date"}
        <input type="date" bind:value={dueDate} />
      </label>
      <label>
        Start Date <span class="optional">(optional)</span>
        <input type="date" bind:value={startDate} />
      </label>
    </div>

    <label>
      End Date <span class="optional">(optional)</span>
      <input type="date" bind:value={endDate} />
    </label>

    <label>
      Archetype <span class="optional">(e.g. The Wanderer, The Guardian)</span>
      <input type="text" bind:value={archetype} />
    </label>

    <label>
      Symbolic Tag <span class="optional">(e.g. "Echo of Oslo")</span>
      <input type="text" bind:value={symbolicTag} />
    </label>

    <label>
      Symbolic Time
      <select bind:value={symbolicTime}>
        <option value="">— none —</option>
        {#each symbolicTimeOptions as opt}
          <option value={opt.value}>{opt.label}</option>
        {/each}
      </select>
    </label>

    <div class="components-section">
      <h3>Components</h3>
      {#each components as comp, i}
        <div class="component-row">
          <input type="text" bind:value={comp.label} placeholder="Insurance, service fee..." />
          <input type="number" step="0.01" bind:value={comp.amount} placeholder="Amount" />
          <input type="text" bind:value={comp.tag} placeholder="Emotional tag" />
          <button type="button" class="remove-btn" onclick={() => removeComponent(i)}>✕</button>
        </div>
      {/each}
      <button type="button" class="oracle-btn" onclick={addComponent}>🔮 Oracle +</button>
    </div>

    {#if error}<p class="error">{error}</p>{/if}

    <button type="submit" class="submit-btn" disabled={loading}>
      {loading ? "Binding..." : "Bind it into the Burdens"}
    </button>
  </form>

  <div class="commitments-section">
    <h2>What You Carry</h2>
    {#if totalOutflow}
      <p class="total-line">Due in the next 30 days: <strong>{totalOutflow}</strong></p>
    {/if}

    {#if burdens.length === 0}
      <p class="empty">Nothing bound yet.</p>
    {:else}
      {#each groupedPlans as g (g.plan)}
        <div class="plan-group">
          <button type="button" class="plan-header" onclick={() => togglePlan(g.plan)}>
            <span class="chevron">{expandedPlans[g.plan] ? "▾" : "▸"}</span>
            <span class="plan-name">{g.plan}</span>
            <span class="plan-meta">
              {g.items.length} payment{g.items.length === 1 ? "" : "s"} · ${money(g.total)} · next {g.next}
              {#if g.overdueCount > 0}<strong class="overdue-tag"> · {g.overdueCount} overdue</strong>{/if}
            </span>
          </button>
          {#if expandedPlans[g.plan]}
            {#each g.items as c (c.setup_id)}
              {@render burdenRow(c)}
            {/each}
          {/if}
        </div>
      {/each}

      {#each ungrouped as c (c.setup_id)}
        {@render burdenRow(c)}
      {/each}
    {/if}
  </div>
</div>

<style>
  .burdens-chamber {
    max-width: 560px;
    margin: 4rem auto;
    padding: 3rem 2.5rem;
    background: radial-gradient(circle at center, #140a0a, #000);
    border: 1px solid rgba(200, 100, 90, 0.25);
    border-radius: 12px;
    color: #f0dcdc;
  }

  .title {
    font-family: 'Cinzel', serif;
    font-size: 1.8rem;
    letter-spacing: 0.08em;
    margin: 0 0 0.3rem 0;
    text-shadow: 0 0 16px rgba(200, 100, 90, 0.3);
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
    gap: 1.1rem;
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

  .optional {
    opacity: 0.5;
    font-weight: normal;
    font-size: 0.75rem;
  }

  input, select {
    padding: 0.55rem 0.75rem;
    border-radius: 6px;
    background: rgba(200, 100, 90, 0.06);
    border: 1px solid rgba(200, 100, 90, 0.25);
    color: #f0dcdc;
    font-size: 0.95rem;
    font-family: inherit;
  }

  input:focus, select:focus {
    outline: none;
    border-color: rgba(200, 100, 90, 0.6);
    box-shadow: 0 0 10px rgba(200, 100, 90, 0.2);
  }

  .components-section {
    border-top: 1px solid rgba(200, 100, 90, 0.2);
    padding-top: 1rem;
    margin-top: 0.5rem;
  }

  .components-section h3 {
    margin: 0 0 0.75rem 0;
    font-size: 0.9rem;
    opacity: 0.8;
    font-weight: normal;
  }

  .component-row {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.6rem;
  }

  .component-row input {
    flex: 1;
  }

  .remove-btn {
    background: none;
    border: 1px solid rgba(200, 100, 90, 0.3);
    color: #f0a0a0;
    border-radius: 6px;
    padding: 0 0.7rem;
    cursor: pointer;
  }

  .oracle-btn {
    background: rgba(200, 100, 90, 0.1);
    border: 1px dashed rgba(200, 100, 90, 0.4);
    color: #f0dcdc;
    border-radius: 6px;
    padding: 0.5rem 1rem;
    cursor: pointer;
    font-size: 0.85rem;
  }

  .oracle-btn:hover {
    background: rgba(200, 100, 90, 0.2);
  }

  .submit-btn {
    margin-top: 0.5rem;
    padding: 0.8rem;
    border-radius: 999px;
    border: 1px solid rgba(200, 100, 90, 0.4);
    background: linear-gradient(135deg, rgba(200,100,90,0.15), rgba(160,60,50,0.15));
    color: #f0dcdc;
    font-family: 'Cinzel', serif;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    font-size: 0.9rem;
    cursor: pointer;
  }

  .submit-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(200,100,90,0.28), rgba(160,60,50,0.28));
  }

  .submit-btn:disabled {
    opacity: 0.5;
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
    padding: 0.5rem 0 1.2rem;
    margin: 0;
  }

  .commitments-section {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(200, 100, 90, 0.2);
  }

  .commitments-section h2 {
    font-family: 'Cinzel', serif;
    font-size: 1.2rem;
    opacity: 0.85;
    margin-bottom: 0.75rem;
  }

  .total-line {
    font-size: 0.9rem;
    opacity: 0.7;
    margin-bottom: 1rem;
  }

  .commitment-row {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding: 0.6rem 0.8rem;
    margin-bottom: 0.5rem;
    background: rgba(200, 100, 90, 0.05);
    border: 1px solid rgba(200, 100, 90, 0.15);
    border-radius: 8px;
    font-size: 0.9rem;
  }

  .commitment-row.overdue {
    border-color: rgba(240, 160, 160, 0.55);
    background: rgba(240, 160, 160, 0.08);
  }

  .commitment-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
  }

  .rune-btn {
    padding: 0.2rem 0.45rem;
    border-radius: 6px;
    border: 1px solid rgba(200, 100, 90, 0.3);
    background: rgba(200, 100, 90, 0.05);
    color: #f0dcdc;
    font-size: 0.7rem;
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

  .commitment-due {
    opacity: 0.6;
    font-size: 0.8rem;
  }

  .overdue-tag {
    color: #f0a0a0;
    opacity: 1;
  }

  .plan-group {
    margin-bottom: 0.7rem;
  }

  .plan-header {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.65rem 0.8rem;
    margin-bottom: 0.5rem;
    background: rgba(200, 100, 90, 0.1);
    border: 1px solid rgba(200, 100, 90, 0.3);
    border-radius: 8px;
    color: #f0dcdc;
    font-family: inherit;
    font-size: 0.9rem;
    text-align: left;
    cursor: pointer;
  }

  .plan-header:hover {
    background: rgba(200, 100, 90, 0.18);
  }

  .chevron {
    width: 1rem;
    opacity: 0.7;
  }

  .plan-name {
    font-family: 'Cinzel', serif;
    letter-spacing: 0.04em;
  }

  .plan-meta {
    margin-left: auto;
    font-size: 0.75rem;
    opacity: 0.65;
  }
</style>

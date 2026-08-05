<script lang="ts">
  import { authStore } from "$lib/authStore";
  import { get } from "svelte/store";
  import { PUBLIC_API_URL } from '$env/static/public';
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  let name = $state("");
  let category = $state("Debt");
  let amount = $state("");
  let recurrence = $state("monthly");
  let principal = $state("");
  let interestRate = $state("");
  let currentBalance = $state("");
  let termMonths = $state("");
  let dueDate = $state(new Date().toISOString().slice(0, 10));
  let archetype = $state("");
  let symbolicTag = $state("");
  let arcEnabled = $state(false);
  let symbolicTime = $state("");
  let startDate = $state("");
  let endDate = $state("");
  let components = $state([]);
  let loading = $state(false);
  let error = $state("");
  let success = $state(false);
  let commitments = $state([]);
  let totalOutflow = $state(null);

  const symbolicTimeOptions = [
    { value: "🌅 Morning", label: "🌅 Morning" },
    { value: "🌙 Evening", label: "🌙 Evening" },
    { value: "🌀 Transition", label: "🌀 Transition" },
    { value: "🔥 Urgency", label: "🔥 Urgency" },
    { value: "💧 Release", label: "💧 Release" },
  ];

  function addComponent() {
    components = [...components, { label: "", amount: "", tag: "" }];
  }

  function removeComponent(i: number) {
    components = components.filter((_, idx) => idx !== i);
  }

  async function loadDashboard() {
    const auth = get(authStore);
    try {
      const res = await fetch(`${PUBLIC_API_URL}/valhalla/setup/dashboard`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        commitments = data.commitments ?? [];
        totalOutflow = data.total_outflow ?? null;
      }
    } catch (e) {
      // silent — commitments are secondary to the form itself
    }
  }

  onMount(loadDashboard);

  async function bind_() {
    error = "";
    if (!name || !amount || !dueDate) {
      error = "The Burdens need at least a name, amount, and due date.";
      return;
    }

    loading = true;
    const auth = get(authStore);

    try {
      const res = await fetch(`${PUBLIC_API_URL}/valhalla/setup/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          name,
          category,
          amount: parseFloat(amount),
          recurrence,
          principal: principal ? parseFloat(principal) : 0,
          interest_rate: interestRate ? parseFloat(interestRate) / 100 : 0,
          current_balance: currentBalance ? parseFloat(currentBalance) : null,
          term_months: termMonths ? parseInt(termMonths) : null,
          due_date: dueDate,
          archetype: archetype || "Unassigned",
          symbolic_tag: symbolicTag || "Untitled",
          arc_enabled: arcEnabled,
          symbolic_time: symbolicTime || null,
          start_date: startDate || null,
          end_date: endDate || null,
          components: components
            .filter(c => c.label)
            .map(c => ({ name: c.label, amount: parseFloat(c.amount) || 0, description: c.tag || null }))
        })
      });

      if (!res.ok) {
        const data = await res.json();
        const msg = Array.isArray(data.detail)
          ? data.detail.map(d => d.msg).join(", ")
          : data.detail;
        throw new Error(msg || "The Burdens would not accept this weight.");
      }

      success = true;
      await loadDashboard();
      setTimeout(() => goto("/valhalla"), 1400);
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }
</script>

<div class="burdens-chamber">
  <h1 class="title">The Burdens</h1>
  <p class="subtitle">Name the weight. Every piece of it, not just the part that shows.</p>

  {#if success}
    <p class="success">Bound into the Burdens.</p>
  {:else}
    <form onsubmit={(e) => { e.preventDefault(); bind_(); }}>
      <label>
        Name
        <input type="text" bind:value={name} placeholder="Student loan, car payment..." />
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
          Total Payment Amount
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

      {#if category === "Debt"}
        <div class="row">
          <label>
            Principal
            <input type="number" step="0.01" bind:value={principal} placeholder="0.00" />
          </label>
          <label>
            Interest Rate (%)
            <input type="number" step="0.01" bind:value={interestRate} placeholder="0.0" />
          </label>
        </div>
        <div class="row">
          <label>
            Current Remaining Balance
            <input type="number" step="0.01" bind:value={currentBalance} placeholder="From your latest statement" />
          </label>
          <label>
            Term (months)
            <input type="number" bind:value={termMonths} placeholder="60" />
          </label>
        </div>
      {/if}

      <div class="row">
        <label>
          First Due Date
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

      <label class="checkbox-row">
        <input type="checkbox" bind:checked={arcEnabled} />
        Enable payoff arc simulation
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
  {/if}

  <div class="commitments-section">
    <h2>What You Carry</h2>
    {#if totalOutflow}
      <p class="total-line">Projected outflow: <strong>{totalOutflow}</strong></p>
    {/if}
    {#if commitments.length === 0}
      <p class="empty">Nothing bound yet.</p>
    {:else}
      {#each commitments as c}
        <div class="commitment-row">
          <div class="commitment-top">
            <span class="commitment-name">{c.name}</span>
            <span class="commitment-amount">${c.amount?.toFixed?.(2) ?? c.amount}</span>
          </div>
          <span class="commitment-due">{c.due_date} — {c.recurrence}</span>
          {#if c.interest_this_payment != null}
            <span class="commitment-breakdown">
              ${c.interest_this_payment.toFixed(2)} interest / ${c.principal_this_payment.toFixed(2)} principal — est. ${c.projected_balance.toFixed(2)} remaining
            </span>
          {/if}
        </div>
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

  .checkbox-row {
    flex-direction: row;
    align-items: center;
    gap: 0.6rem;
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
    padding: 2rem 0;
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

  .commitment-top {
    display: flex;
    justify-content: space-between;
  }

  .commitment-due {
    opacity: 0.6;
    font-size: 0.8rem;
  }

  .commitment-breakdown {
    opacity: 0.5;
    font-size: 0.75rem;
    font-style: italic;
  }
</style>

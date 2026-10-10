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

  // Editing a Burden in place
  let editingId = $state(null);
  let busyId = $state(null);
  let rowError = $state("");
  let notice = $state("");
  let form = $state({
    name: "",
    plan_name: "",
    category: "",
    amount: "",
    recurrence: "monthly",
    due_date: "",
    start_date: "",
    end_date: "",
    payments_remaining: "",
    total_payments: "",
    current_balance: "",
    archetype: "",
    symbolic_tag: "",
    symbolic_time: "",
  });

  const categoryOptions = ["Debt", "Subscription", "Symbolic", "Legacy"];

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

  // The API reports problems as {"detail": "..."}; show just the sentence.
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

  // ---------- Editing ----------

  function startEdit(c) {
    rowError = "";
    notice = "";
    confirmingDelete = null;
    editingId = c.setup_id;
    form = {
      name: c.name ?? "",
      plan_name: c.plan_name ?? "",
      category: c.category ?? "",
      amount: c.amount != null ? String(c.amount) : "",
      recurrence: c.recurrence ?? "none",
      due_date: c.due_date ?? "",
      start_date: c.start_date ?? "",
      end_date: c.end_date ?? "",
      payments_remaining: c.payments_remaining != null ? String(c.payments_remaining) : "",
      total_payments: c.total_payments != null ? String(c.total_payments) : "",
      current_balance: c.current_balance != null ? String(c.current_balance) : "",
      archetype: c.archetype ?? "",
      symbolic_tag: c.symbolic_tag ?? "",
      symbolic_time: c.symbolic_time ?? "",
    };
  }

  function cancelEdit() {
    editingId = null;
    rowError = "";
  }

  // Only the fields that actually differ from the stored Burden are sent.
  function buildChanges(orig) {
    const f = form;
    const changes: Record<string, unknown> = {};

    if (f.name.trim() !== (orig.name ?? "")) changes.name = f.name.trim();
    if (f.plan_name.trim() !== (orig.plan_name ?? "")) changes.plan_name = f.plan_name.trim();
    if (f.category !== (orig.category ?? "")) changes.category = f.category;
    if (Number(f.amount) !== Number(orig.amount) || f.amount === "") changes.amount = f.amount;
    if (f.recurrence !== (orig.recurrence ?? "none")) changes.recurrence = f.recurrence;
    if (f.due_date !== (orig.due_date ?? "")) changes.due_date = f.due_date;
    if (f.start_date !== (orig.start_date ?? "")) changes.start_date = f.start_date;
    if (f.end_date !== (orig.end_date ?? "")) changes.end_date = f.end_date;

    // Payment counts only matter while the Burden recurs. If it is being
    // switched to one-time, the server clears them on its own.
    if (f.recurrence !== "none") {
      const origRemaining = orig.payments_remaining != null ? String(orig.payments_remaining) : "";
      const origTotal = orig.total_payments != null ? String(orig.total_payments) : "";
      if (f.payments_remaining !== origRemaining) {
        changes.payments_remaining = f.payments_remaining === "" ? null : Number(f.payments_remaining);
      }
      if (f.total_payments !== origTotal) {
        changes.total_payments = f.total_payments === "" ? null : Number(f.total_payments);
      }
    }

    const origBalance = orig.current_balance != null ? String(orig.current_balance) : "";
    if (f.current_balance !== origBalance) {
      changes.current_balance = f.current_balance === "" ? null : f.current_balance;
    }

    if (f.archetype !== (orig.archetype ?? "")) changes.archetype = f.archetype;
    if (f.symbolic_tag !== (orig.symbolic_tag ?? "")) changes.symbolic_tag = f.symbolic_tag;
    if (f.symbolic_time !== (orig.symbolic_time ?? "")) changes.symbolic_time = f.symbolic_time;

    return changes;
  }

  async function saveEdit(orig) {
    rowError = "";
    const changes = buildChanges(orig);

    if (Object.keys(changes).length === 0) {
      editingId = null;
      return;
    }

    busyId = orig.setup_id;
    try {
      await apiFetch(`/valhalla/setup/${orig.setup_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });
      editingId = null;
      await loadBurdens();
      notice = `'${changes.name ?? orig.name}' updated.`;
      setTimeout(() => {
        notice = "";
      }, 3000);
    } catch (e) {
      rowError = messageFrom(e, "Could not save that change.");
    } finally {
      busyId = null;
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
  <div class="commitment-row" class:overdue={c.overdue} class:editing={editingId === c.setup_id}>
    <div class="commitment-top">
      <span class="commitment-name">{c.name}</span>
      <span class="commitment-amount">${money(c.amount)}</span>
      <button
        type="button"
        class="rune-btn edit-btn"
        onclick={() => (editingId === c.setup_id ? cancelEdit() : startEdit(c))}
        disabled={busyId !== null}
        title={editingId === c.setup_id ? "Close editor" : "Edit this burden"}
        aria-label="Edit {c.name}"
      >
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor"
             stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      </button>
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

    {#if editingId === c.setup_id}
      <form
        class="edit-panel"
        onsubmit={(e) => { e.preventDefault(); saveEdit(c); }}
      >
        <label>
          Name
          <input type="text" bind:value={form.name} />
        </label>

        <label>
          Plan <span class="optional">(blank removes it from any plan)</span>
          <input type="text" bind:value={form.plan_name} list="plan-names" />
        </label>

        <div class="row">
          <label>
            Category
            <select bind:value={form.category}>
              {#if form.category && !categoryOptions.includes(form.category)}
                <option value={form.category}>{form.category}</option>
              {/if}
              {#each categoryOptions as opt}
                <option value={opt}>{opt}</option>
              {/each}
            </select>
          </label>
          <label>
            Payment Amount
            <input type="number" step="0.01" bind:value={form.amount} />
          </label>
        </div>

        <label>
          Recurrence
          <select bind:value={form.recurrence}>
            <option value="none">One-time</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Biweekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="annually">Annually</option>
          </select>
        </label>

        {#if form.recurrence !== "none"}
          <div class="row">
            <label>
              Payments Remaining <span class="optional">(blank = never ends)</span>
              <input type="number" min="1" step="1" bind:value={form.payments_remaining} />
            </label>
            <label>
              Total Payments <span class="optional">(optional)</span>
              <input type="number" min="1" step="1" bind:value={form.total_payments} />
            </label>
          </div>
        {/if}

        <div class="row">
          <label>
            Next Due Date
            <input type="date" bind:value={form.due_date} />
          </label>
          <label>
            End Date <span class="optional">(optional)</span>
            <input type="date" bind:value={form.end_date} />
          </label>
        </div>
        <p class="hint">
          Changing the due date moves the schedule. Normally only paying a Burden advances it —
          use this to correct a wrong date.
        </p>

        <label>
          Start Date <span class="optional">(optional)</span>
          <input type="date" bind:value={form.start_date} />
        </label>

        {#if form.category === "Debt"}
          <label>
            Current Remaining Balance <span class="optional">(reference only; blank clears)</span>
            <input type="number" step="0.01" bind:value={form.current_balance} />
          </label>
        {/if}

        <label>
          Archetype
          <input type="text" bind:value={form.archetype} />
        </label>

        <label>
          Symbolic Tag
          <input type="text" bind:value={form.symbolic_tag} />
        </label>

        <label>
          Symbolic Time
          <select bind:value={form.symbolic_time}>
            <option value="">— none —</option>
            {#each symbolicTimeOptions as opt}
              <option value={opt.value}>{opt.label}</option>
            {/each}
          </select>
        </label>

        {#if rowError}<p class="error">{rowError}</p>{/if}

        <div class="edit-actions">
          <button type="submit" class="save-btn" disabled={busyId === c.setup_id}>
            {busyId === c.setup_id ? "Saving..." : "Save changes"}
          </button>
          <button type="button" class="cancel-btn" onclick={cancelEdit} disabled={busyId === c.setup_id}>
            Cancel
          </button>
        </div>
      </form>
    {/if}
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

    {#if notice}
      <p class="success small">{notice}</p>
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

  .success.small {
    font-size: 0.9rem;
    padding: 0 0 0.8rem;
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

  .commitment-row.editing {
    border-color: rgba(200, 100, 90, 0.55);
    background: rgba(200, 100, 90, 0.09);
  }

  .commitment-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
  }

  .commitment-name {
    flex: 1;
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
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .rune-btn:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .edit-btn:hover:not(:disabled) {
    border-color: rgba(200, 100, 90, 0.7);
    background: rgba(200, 100, 90, 0.18);
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

  .edit-panel {
    margin-top: 0.8rem;
    padding-top: 0.9rem;
    border-top: 1px dashed rgba(200, 100, 90, 0.3);
    gap: 0.9rem;
  }

  .hint {
    margin: -0.4rem 0 0;
    font-size: 0.75rem;
    opacity: 0.55;
    font-style: italic;
  }

  .edit-actions {
    display: flex;
    gap: 0.6rem;
  }

  .save-btn,
  .cancel-btn {
    padding: 0.5rem 1.1rem;
    border-radius: 999px;
    border: 1px solid rgba(200, 100, 90, 0.4);
    color: #f0dcdc;
    font-size: 0.85rem;
    cursor: pointer;
    font-family: inherit;
  }

  .save-btn {
    background: linear-gradient(135deg, rgba(200,100,90,0.25), rgba(160,60,50,0.25));
  }

  .save-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(200,100,90,0.4), rgba(160,60,50,0.4));
  }

  .cancel-btn {
    background: none;
    opacity: 0.8;
  }

  .save-btn:disabled,
  .cancel-btn:disabled {
    opacity: 0.5;
    cursor: default;
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

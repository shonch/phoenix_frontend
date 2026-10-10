<script lang="ts">
  import { onMount } from "svelte";
  import { apiFetch } from "$lib/api";

  let daily = $state([]);
  let foretoldTransactions = $state([]);
  let outlook = $state(null);
  let loading = $state(true);
  let error = $state("");
  let expandedDate = $state(null);
  let flashingDate = $state(null);

  // Row actions on the Awaiting Arrival list
  let editingId = $state(null);
  let landingId = $state(null);
  let removingId = $state(null);
  let busyId = $state(null);
  let rowError = $state({ id: null, message: "" });
  let form = $state({ amount: "", date: "", category: "", source: "", description: "" });
  let land = $state({ amount: "", date: "" });

  const now = new Date();
  const monthName = now.toLocaleString('default', { month: 'long' });
  const year = now.getFullYear();
  // Valhalla's backend works in UTC dates, so "today" here is the UTC date
  // to match the projection's first day and the server's rules.
  const todayStr = now.toISOString().slice(0, 10);

  // "YYYY-MM-DD" -> a local Date for that same calendar day. Never use
  // new Date("YYYY-MM-DD") for display: it parses as UTC midnight and lands
  // on the previous day in US time zones.
  function parseDate(dateStr) {
    const [y, m, d] = dateStr.slice(0, 10).split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function fmtDate(dateStr, opts) {
    if (!dateStr) return "";
    return parseDate(dateStr).toLocaleDateString('default', opts);
  }

  function money(n, digits = 2) {
    const v = Number(n) || 0;
    const rounded = Number(v.toFixed(digits));
    const body = Math.abs(rounded).toLocaleString("en-US", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    });
    return `${rounded < 0 ? "-" : ""}$${body}`;
  }

  const cents = (n) => Math.round((Number(n) || 0) * 100);

  const byDate = $derived.by(() => {
    const map = new Map();
    for (const d of daily) {
      map.set(d.date, d);
    }
    return map;
  });

  const calendarCells = $derived.by(() => {
    if (daily.length === 0) return [];

    const startWeekday = parseDate(daily[0].date).getDay();

    const cells = [];
    for (let i = 0; i < startWeekday; i++) {
      cells.push(null);
    }
    for (const d of daily) {
      cells.push(d);
    }
    return cells;
  });

  const expandedDay = $derived(
    expandedDate ? byDate.get(expandedDate) : null
  );

  // Individual foretold transactions on the expanded day
  const expandedItems = $derived.by(() => {
    if (!expandedDate) return { income: [], expense: [] };
    const onDay = foretoldTransactions.filter(t => t.date === expandedDate);
    return {
      income: onDay.filter(t => t.type === "income"),
      expense: onDay.filter(t => t.type === "expense")
    };
  });

  const sortedForetold = $derived(
    [...foretoldTransactions].sort((a, b) => a.date.localeCompare(b.date))
  );

  async function loadDaily() {
    const data = await apiFetch(`/valhalla/balances/projection/daily`);
    daily = data.daily ?? [];
  }

  async function loadForetold() {
    const txData = await apiFetch(`/valhalla/transactions/`);
    const today = new Date().toISOString().slice(0, 10);

    foretoldTransactions = (txData.transactions ?? []).filter(t => {
      if (t.status !== undefined) {
        return t.status === "scheduled";
      }
      // No status at all — fall back to date, same rule as the backend
      return t.date > today;
    });
  }

  // The outlook is secondary: if it fails, the calendar still works.
  async function loadOutlook() {
    try {
      outlook = await apiFetch(`/valhalla/balances/projection/outlook`);
    } catch (e) {
      outlook = null;
    }
  }

  async function refresh() {
    await Promise.all([loadDaily(), loadForetold(), loadOutlook()]);
  }

  onMount(async () => {
    try {
      await refresh();
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  });

  function handleDayClick(day) {
    if (!day) return;
    if (expandedDate === day.date) {
      expandedDate = null;
      return;
    }
    flashingDate = day.date;
    setTimeout(() => {
      flashingDate = null;
    }, 400);
    expandedDate = day.date;
  }

  // Day number; the first cell and the 1st of each month also show the month
  function dayLabel(dateStr) {
    const d = parseDate(dateStr);
    if (d.getDate() === 1 || dateStr === daily[0]?.date) {
      return `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`;
    }
    return String(d.getDate());
  }

  function burdenTotal(day) {
    return day.burden_amount ?? 0;
  }

  // ---------- Awaiting Arrival: edit / landed / remove ----------

  // The API layer may hand back the server's {"detail": "..."} as raw text
  function messageFrom(e) {
    const raw = e?.message ?? String(e);
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.detail) {
        return typeof parsed.detail === "string" ? parsed.detail : JSON.stringify(parsed.detail);
      }
    } catch {
      // not JSON — use the text as-is
    }
    return raw;
  }

  function plainDescription(t) {
    return t.description && t.description !== "No description" ? t.description : "";
  }

  function closePanels() {
    editingId = null;
    landingId = null;
    removingId = null;
    rowError = { id: null, message: "" };
  }

  function openEdit(t) {
    closePanels();
    form = {
      amount: t.amount,
      date: t.date,
      category: t.category ?? "",
      source: t.source ?? "",
      description: plainDescription(t)
    };
    editingId = t.transaction_id;
  }

  function openLand(t) {
    closePanels();
    // Prefill the scheduled date, or today if it is still in the future
    land = { amount: t.amount, date: t.date <= todayStr ? t.date : todayStr };
    landingId = t.transaction_id;
  }

  function openRemove(t) {
    closePanels();
    removingId = t.transaction_id;
  }

  async function saveEdit(t) {
    const id = t.transaction_id;
    const amount = Number(form.amount);
    const category = String(form.category ?? "").trim();
    const source = String(form.source ?? "").trim();
    const description = String(form.description ?? "").trim();
    const date = String(form.date ?? "");

    if (form.amount === "" || form.amount === null || !Number.isFinite(amount) || amount <= 0) {
      rowError = { id, message: "Amount must be greater than zero." };
      return;
    }
    if (!category) {
      rowError = { id, message: "Category cannot be empty." };
      return;
    }
    if (!date) {
      rowError = { id, message: "Choose an expected date." };
      return;
    }
    if (date !== t.date && date <= todayStr) {
      rowError = {
        id,
        message: "A foretold date must be in the future. If it has arrived, use Landed instead."
      };
      return;
    }

    // Send only what actually changed
    const changes = {};
    if (cents(amount) !== cents(t.amount)) changes.amount = amount;
    if (date !== t.date) changes.date = date;
    if (category !== (t.category ?? "")) changes.category = category;
    if (source !== (t.source ?? "")) changes.source = source;
    if (description !== plainDescription(t)) changes.description = description;

    if (Object.keys(changes).length === 0) {
      closePanels();
      return;
    }

    busyId = id;
    try {
      await apiFetch(`/valhalla/transactions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes)
      });
      closePanels();
      await refresh();
    } catch (e) {
      rowError = { id, message: messageFrom(e) };
    } finally {
      busyId = null;
    }
  }

  async function confirmLand(t) {
    const id = t.transaction_id;
    const amount = Number(land.amount);
    const landedOn = String(land.date ?? "");

    if (land.amount === "" || land.amount === null || !Number.isFinite(amount) || amount <= 0) {
      rowError = { id, message: "Amount must be greater than zero." };
      return;
    }
    if (!landedOn) {
      rowError = { id, message: "Choose the day it landed." };
      return;
    }
    if (landedOn > todayStr) {
      rowError = { id, message: "It cannot have landed in the future." };
      return;
    }

    busyId = id;
    let amountSaved = false;
    try {
      // If the real amount differs from the estimate, correct the estimate first
      if (cents(amount) !== cents(t.amount)) {
        await apiFetch(`/valhalla/transactions/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount })
        });
        amountSaved = true;
      }
      await apiFetch(
        `/valhalla/transactions/${id}/mark-posted?actual_date=${encodeURIComponent(landedOn)}`,
        { method: "PATCH" }
      );
      closePanels();
      await refresh();
    } catch (e) {
      const msg = messageFrom(e);
      rowError = {
        id,
        message: amountSaved
          ? `The amount was updated, but it could not be marked as landed: ${msg}`
          : msg
      };
      if (amountSaved) {
        try { await refresh(); } catch { /* the message above already tells the story */ }
      }
    } finally {
      busyId = null;
    }
  }

  async function confirmRemove(t) {
    const id = t.transaction_id;
    busyId = id;
    try {
      await apiFetch(`/valhalla/transactions/${id}`, { method: "DELETE" });
      closePanels();
      await refresh();
    } catch (e) {
      rowError = { id, message: messageFrom(e) };
    } finally {
      busyId = null;
    }
  }
</script>

{#snippet icon(name)}
  <svg class="icon" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"
       stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    {#if name === "edit"}
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    {:else if name === "flame"}
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    {:else if name === "trash"}
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    {:else if name === "check"}
      <polyline points="20 6 9 17 4 12" />
    {:else if name === "x"}
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    {/if}
  </svg>
{/snippet}

<div class="foretelling-chamber">
  <div class="haze"></div>

  <h1 class="title">The Foretelling</h1>
  <p class="subtitle">{monthName} {year} — what has landed, and what is yet to come.</p>

  {#if loading}
    <p class="loading">The runes are being cast...</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else}
    {#if outlook}
      <section class="outlook">
        <h2 class="outlook-title">The Outlook</h2>
        <p class="outlook-sub">Can the coming months be carried? Counts only income you have foretold.</p>

        {#each outlook.horizons as h}
          <div class="outlook-row" class:breach={h.breaches_floor}>
            <div class="outlook-horizon">
              {h.months} {h.months === 1 ? "month" : "months"}
              <span class="outlook-through">to {fmtDate(h.through, { month: 'short', day: 'numeric' })}</span>
            </div>
            <div class="outlook-figures">
              <div>
                Ends
                <strong class={h.ending_balance >= 0 ? 'positive' : 'negative'}>{money(h.ending_balance, 0)}</strong>
              </div>
              <div class="outlook-low">
                Lowest {money(h.lowest_balance, 0)} on {fmtDate(h.lowest_date, { month: 'short', day: 'numeric' })}
              </div>
            </div>
            <div class="outlook-verdict {h.breaches_floor ? 'negative' : 'positive'}">
              {#if h.breaches_floor}
                Falls below {money(outlook.floor, 0)} on {fmtDate(h.first_breach_date, { month: 'short', day: 'numeric' })}
              {:else}
                Holds
              {/if}
            </div>
          </div>
        {/each}

        {#if outlook.overdue_burden_total > 0}
          <p class="outlook-note">
            {money(outlook.overdue_burden_total)} in overdue Burdens is counted as due today.
          </p>
        {/if}
        {#if !outlook.floor}
          <p class="outlook-note">No safety floor set — measured against $0.</p>
        {/if}
      </section>
    {/if}

    <div class="weekday-row">
      {#each ["S", "M", "T", "W", "T", "F", "S"] as wd}
        <span class="weekday">{wd}</span>
      {/each}
    </div>

    <div class="calendar-grid">
      {#each calendarCells as day}
        {#if day === null}
          <div class="cell blank"></div>
        {:else}
          <button
            type="button"
            class="cell stone"
            class:today={day.date === todayStr}
            class:flashing={flashingDate === day.date}
            class:expanded={expandedDate === day.date}
            class:has-income={day.income_amount > 0}
            class:has-expense={day.expense_amount > 0 || burdenTotal(day) > 0}
            onclick={() => handleDayClick(day)}
          >
            <span class="day-number">{dayLabel(day.date)}</span>
            <span class="day-balance {day.balance >= 0 ? 'positive' : 'negative'}">
              {money(day.balance, 0)}
            </span>
            {#if day.income_amount > 0}
              <span class="mark gold-mark"></span>
            {/if}
            {#if day.expense_amount > 0 || burdenTotal(day) > 0}
              <span class="mark ash-mark" style="opacity: {Math.min(0.4 + ((day.expense_amount + burdenTotal(day)) / 500), 1)}"></span>
            {/if}
          </button>
        {/if}
      {/each}
    </div>

    {#if expandedDay}
      <div class="detail-panel">
        <h3 class="detail-date">
          {fmtDate(expandedDay.date, { weekday: 'long', month: 'long', day: 'numeric' })}
        </h3>
        <div class="detail-balance {expandedDay.balance >= 0 ? 'positive' : 'negative'}">
          {money(expandedDay.balance)}
        </div>

        {#if expandedDay.income_amount > 0}
          <div class="detail-row income">
            <span>Foretold income</span>
            <span>+{money(expandedDay.income_amount)}</span>
          </div>
          {#each expandedItems.income as t}
            <div class="detail-item income">
              <span>{t.category}{t.description && t.description !== "No description" ? ` — ${t.description}` : ""}</span>
              <span>+{money(t.amount)}</span>
            </div>
          {/each}
        {/if}

        {#if expandedDay.expense_amount > 0}
          <div class="detail-row expense">
            <span>Foretold expense</span>
            <span>-{money(expandedDay.expense_amount)}</span>
          </div>
          {#each expandedItems.expense as t}
            <div class="detail-item expense">
              <span>{t.category}{t.description && t.description !== "No description" ? ` — ${t.description}` : ""}</span>
              <span>-{money(t.amount)}</span>
            </div>
          {/each}
        {/if}

        {#if burdenTotal(expandedDay) > 0}
          <div class="detail-row expense">
            <span>Burdens due</span>
            <span>-{money(burdenTotal(expandedDay))}</span>
          </div>
          {#each expandedDay.burdens ?? [] as b}
            <div class="detail-item expense">
              <span>
                {b.name}
                {#if b.overdue}<span class="overdue-tag">overdue</span>{/if}
              </span>
              <span>-{money(b.amount)}</span>
            </div>
          {/each}
        {/if}

        {#if expandedDay.income_amount === 0 && expandedDay.expense_amount === 0 && burdenTotal(expandedDay) === 0}
          <p class="detail-empty">Nothing foretold for this day.</p>
        {/if}
      </div>
    {/if}

    <div class="awaiting-section">
      <h2 class="awaiting-title">Awaiting Arrival</h2>
      {#if sortedForetold.length === 0}
        <p class="empty">Nothing foretold right now.</p>
      {:else}
        {#each sortedForetold as t (t.transaction_id)}
          {@const id = t.transaction_id}
          {@const late = t.date < todayStr}
          <div class="awaiting-item" class:busy={busyId === id}>
            <div class="awaiting-row">
              <span class="awaiting-date">{t.date}</span>
              <span class="awaiting-main">
                <span class="awaiting-line">
                  <span>{t.category} — {t.type === "expense" ? "-" : "+"}{money(t.amount)}</span>
                  {#if late}
                    <span class="overdue-tag">{t.type === "expense" ? "overdue" : "late"}</span>
                  {/if}
                </span>
                {#if plainDescription(t)}
                  <span class="awaiting-note">{plainDescription(t)}</span>
                {/if}
              </span>
              <span class="row-actions">
                <button type="button" class="act" disabled={busyId === id}
                        onclick={() => openEdit(t)} title="Edit this foretold entry">
                  {@render icon("edit")}<span>Edit</span>
                </button>
                <button type="button" class="act land" disabled={busyId === id}
                        onclick={() => openLand(t)} title="It arrived — record it as landed">
                  {@render icon("flame")}<span>Landed</span>
                </button>
                <button type="button" class="act remove" disabled={busyId === id}
                        onclick={() => openRemove(t)} title="Remove this foretold entry">
                  {@render icon("trash")}<span>Remove</span>
                </button>
              </span>
            </div>

            {#if editingId === id}
              <form class="panel" onsubmit={(e) => { e.preventDefault(); saveEdit(t); }}>
                <div class="panel-grid">
                  <label>
                    Amount
                    <input type="number" step="0.01" min="0" bind:value={form.amount} />
                  </label>
                  <label>
                    Expected date
                    <input type="date" bind:value={form.date} />
                  </label>
                  <label>
                    Category
                    <input type="text" bind:value={form.category} />
                  </label>
                  <label>
                    Source
                    <input type="text" bind:value={form.source} />
                  </label>
                </div>
                <label>
                  Description
                  <input type="text" bind:value={form.description} placeholder="What is this, really?" />
                </label>
                <p class="panel-hint">
                  Moving the date? It must stay in the future. If it has already arrived, use Landed.
                </p>
                {#if rowError.id === id}<p class="row-error">{rowError.message}</p>{/if}
                <div class="panel-actions">
                  <button type="submit" class="act primary" disabled={busyId === id}>
                    {@render icon("check")}<span>{busyId === id ? "Saving…" : "Save"}</span>
                  </button>
                  <button type="button" class="act" onclick={closePanels}>
                    {@render icon("x")}<span>Cancel</span>
                  </button>
                </div>
              </form>
            {:else if landingId === id}
              <form class="panel" onsubmit={(e) => { e.preventDefault(); confirmLand(t); }}>
                <p class="panel-title">It arrived.</p>
                <div class="panel-grid">
                  <label>
                    Amount received
                    <input type="number" step="0.01" min="0" bind:value={land.amount} />
                  </label>
                  <label>
                    Landed on
                    <input type="date" max={todayStr} bind:value={land.date} />
                  </label>
                </div>
                {#if cents(land.amount) !== cents(t.amount)}
                  <p class="panel-hint">
                    The estimate was {money(t.amount)}; it will be updated to match.
                  </p>
                {/if}
                <p class="consequence">
                  Your balance will {t.type === "expense" ? "fall" : "rise"} by
                  {money(Number(land.amount) || 0)}. This becomes part of your history and
                  cannot be undone.
                </p>
                {#if rowError.id === id}<p class="row-error">{rowError.message}</p>{/if}
                <div class="panel-actions">
                  <button type="submit" class="act primary land" disabled={busyId === id}>
                    {@render icon("flame")}<span>{busyId === id ? "Recording…" : "Confirm landed"}</span>
                  </button>
                  <button type="button" class="act" onclick={closePanels}>
                    {@render icon("x")}<span>Cancel</span>
                  </button>
                </div>
              </form>
            {:else if removingId === id}
              <div class="panel">
                <p class="consequence">
                  Remove this foretold entry? It will no longer count in your projection.
                </p>
                {#if rowError.id === id}<p class="row-error">{rowError.message}</p>{/if}
                <div class="panel-actions">
                  <button type="button" class="act danger" disabled={busyId === id}
                          onclick={() => confirmRemove(t)}>
                    {@render icon("trash")}<span>{busyId === id ? "Removing…" : "Yes, remove"}</span>
                  </button>
                  <button type="button" class="act" onclick={closePanels}>
                    {@render icon("x")}<span>Keep</span>
                  </button>
                </div>
              </div>
            {:else if rowError.id === id}
              <p class="row-error inline">{rowError.message}</p>
            {/if}
          </div>
        {/each}
      {/if}
    </div>
  {/if}
</div>

<style>
  .foretelling-chamber {
    position: relative;
    max-width: 640px;
    margin: 4rem auto;
    padding: 3rem 2.5rem;
    color: #e8dcf0;
  }

  .haze {
    position: absolute;
    inset: -20%;
    background: radial-gradient(circle at 50% 20%, rgba(220, 200, 240, 0.1), transparent 70%);
    filter: blur(60px);
    pointer-events: none;
    z-index: 0;
  }

  .title {
    position: relative;
    z-index: 2;
    font-family: 'Cinzel', serif;
    font-size: 2rem;
    letter-spacing: 0.08em;
    margin: 0 0 0.3rem 0;
    text-shadow: 0 0 16px rgba(220, 200, 240, 0.35);
  }

  .subtitle {
    position: relative;
    z-index: 2;
    opacity: 0.6;
    font-size: 0.9rem;
    margin-bottom: 2rem;
    font-style: italic;
  }

  .outlook {
    position: relative;
    z-index: 2;
    margin-bottom: 2rem;
    padding: 1.2rem 1.5rem;
    background: rgba(10, 8, 14, 0.5);
    border: 1px solid rgba(220, 200, 240, 0.25);
    border-radius: 12px;
  }

  .outlook-title {
    font-family: 'Cinzel', serif;
    font-size: 1.1rem;
    margin: 0 0 0.2rem 0;
    opacity: 0.9;
  }

  .outlook-sub {
    margin: 0 0 1rem 0;
    font-size: 0.8rem;
    opacity: 0.55;
    font-style: italic;
  }

  .outlook-row {
    display: grid;
    grid-template-columns: 1.1fr 1.6fr 1.3fr;
    gap: 0.75rem;
    align-items: center;
    padding: 0.6rem 0;
    border-top: 1px solid rgba(220, 200, 240, 0.1);
    font-size: 0.85rem;
  }

  .outlook-horizon {
    font-family: 'Cinzel', serif;
    display: flex;
    flex-direction: column;
  }

  .outlook-through {
    font-family: inherit;
    font-size: 0.7rem;
    opacity: 0.5;
  }

  .outlook-low {
    font-size: 0.75rem;
    opacity: 0.65;
  }

  .outlook-verdict {
    font-size: 0.8rem;
    text-align: right;
  }

  .outlook-note {
    margin: 0.6rem 0 0 0;
    font-size: 0.75rem;
    opacity: 0.55;
    font-style: italic;
  }

  .weekday-row {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .weekday {
    text-align: center;
    font-size: 0.7rem;
    opacity: 0.5;
    letter-spacing: 0.1em;
  }

  .calendar-grid {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.5rem;
  }

  .cell {
    aspect-ratio: 1;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .cell.blank {
    background: transparent;
  }

  .cell.stone {
    background: rgba(220, 200, 240, 0.05);
    border: 1px solid rgba(220, 200, 240, 0.2);
    cursor: pointer;
    font-family: inherit;
    color: inherit;
    transition: all 0.25s ease;
    overflow: hidden;
  }

  .cell.stone:hover {
    border-color: rgba(220, 200, 240, 0.5);
    background: rgba(220, 200, 240, 0.1);
  }

  .cell.stone.today {
    border-color: rgba(255, 255, 255, 0.6);
    box-shadow: 0 0 12px rgba(255, 255, 255, 0.25);
  }

  .cell.stone.expanded {
    border-color: rgba(220, 200, 240, 0.9);
    background: rgba(220, 200, 240, 0.18);
    box-shadow: 0 0 20px rgba(220, 200, 240, 0.4);
  }

  .cell.stone.flashing {
    animation: stoneFlash 0.4s ease-out;
  }

  @keyframes stoneFlash {
    0%   { box-shadow: 0 0 0px rgba(255, 255, 255, 0); }
    40%  { box-shadow: 0 0 30px rgba(255, 255, 255, 0.9); background: rgba(255, 255, 255, 0.3); }
    100% { box-shadow: 0 0 20px rgba(220, 200, 240, 0.4); }
  }

  .day-number {
    font-size: 0.7rem;
    opacity: 0.6;
    position: absolute;
    top: 0.3rem;
    left: 0.4rem;
  }

  .day-balance {
    font-family: 'Cinzel', serif;
    font-size: 0.75rem;
    margin-top: 0.3rem;
  }

  .positive { color: #9fd6a0; }
  .negative { color: #d69f9f; }

  .mark {
    position: absolute;
    bottom: 0.35rem;
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .gold-mark {
    left: 0.4rem;
    background: #e8d896;
    box-shadow: 0 0 6px rgba(232, 216, 150, 0.8);
  }

  .ash-mark {
    right: 0.4rem;
    background: #4a4a52;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.6);
  }

  .detail-panel {
    position: relative;
    z-index: 2;
    margin-top: 2rem;
    padding: 1.5rem 2rem;
    background: rgba(10, 8, 14, 0.6);
    border: 1px solid rgba(220, 200, 240, 0.3);
    border-radius: 12px;
    backdrop-filter: blur(8px);
    animation: panelRise 0.3s ease-out;
  }

  @keyframes panelRise {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .detail-date {
    font-family: 'Cinzel', serif;
    font-size: 1.1rem;
    margin: 0 0 0.5rem 0;
    opacity: 0.9;
  }

  .detail-balance {
    font-family: 'Cinzel', serif;
    font-size: 1.6rem;
    margin-bottom: 1rem;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    padding: 0.4rem 0;
    font-size: 0.9rem;
    border-top: 1px solid rgba(220, 200, 240, 0.1);
  }

  .detail-row.income { color: #9fd6a0; }
  .detail-row.expense { color: #d69f9f; }

  .detail-item {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.15rem 0 0.15rem 1rem;
    font-size: 0.8rem;
    opacity: 0.8;
  }

  .detail-item.income { color: #9fd6a0; }
  .detail-item.expense { color: #d69f9f; }

  .overdue-tag {
    margin-left: 0.4rem;
    padding: 0.05rem 0.4rem;
    font-size: 0.65rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    border: 1px solid rgba(214, 159, 159, 0.6);
    border-radius: 999px;
    color: #d69f9f;
  }

  .detail-empty {
    opacity: 0.5;
    font-style: italic;
    font-size: 0.85rem;
  }

  .awaiting-section {
    position: relative;
    z-index: 2;
    margin-top: 2.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(220, 200, 240, 0.15);
  }

  .awaiting-title {
    font-family: 'Cinzel', serif;
    font-size: 1.1rem;
    opacity: 0.85;
    margin: 0 0 1rem 0;
  }

  .awaiting-item {
    margin-bottom: 0.5rem;
    background: rgba(220, 200, 240, 0.05);
    border: 1px solid rgba(220, 200, 240, 0.15);
    border-radius: 8px;
    font-size: 0.85rem;
    transition: opacity 0.2s ease;
  }

  .awaiting-item.busy {
    opacity: 0.6;
  }

  .awaiting-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem 0.75rem;
    padding: 0.6rem 0.8rem;
  }

  .awaiting-date {
    opacity: 0.6;
    white-space: nowrap;
  }

  .awaiting-main {
    flex: 1;
    min-width: 11rem;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .awaiting-line {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }

  .awaiting-note {
    font-size: 0.75rem;
    opacity: 0.55;
    font-style: italic;
  }

  .row-actions {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
  }

  .act {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.3rem 0.65rem;
    border-radius: 999px;
    border: 1px solid rgba(220, 200, 240, 0.3);
    background: rgba(220, 200, 240, 0.05);
    color: #e8dcf0;
    font-family: inherit;
    font-size: 0.75rem;
    letter-spacing: 0.03em;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .act:hover:not(:disabled) {
    border-color: rgba(220, 200, 240, 0.7);
    background: rgba(220, 200, 240, 0.14);
  }

  .act.land:hover:not(:disabled),
  .act.primary.land {
    border-color: rgba(232, 216, 150, 0.7);
    background: rgba(232, 216, 150, 0.15);
    color: #e8d896;
  }

  .act.remove:hover:not(:disabled),
  .act.danger {
    border-color: rgba(214, 159, 159, 0.7);
    background: rgba(214, 159, 159, 0.12);
    color: #d69f9f;
  }

  .act.primary {
    border-color: rgba(220, 200, 240, 0.6);
    background: rgba(220, 200, 240, 0.16);
  }

  .act:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .icon {
    flex-shrink: 0;
  }

  .panel {
    padding: 0.9rem 0.8rem 0.8rem;
    border-top: 1px solid rgba(220, 200, 240, 0.12);
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
  }

  .panel-title {
    margin: 0;
    font-family: 'Cinzel', serif;
    letter-spacing: 0.05em;
    color: #e8d896;
  }

  .panel-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.7rem;
  }

  .panel label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.75rem;
    opacity: 0.85;
  }

  .panel input {
    padding: 0.45rem 0.6rem;
    border-radius: 6px;
    background: rgba(220, 200, 240, 0.06);
    border: 1px solid rgba(220, 200, 240, 0.25);
    color: #e8dcf0;
    font-size: 0.9rem;
    font-family: inherit;
  }

  .panel input:focus {
    outline: none;
    border-color: rgba(220, 200, 240, 0.6);
    box-shadow: 0 0 10px rgba(220, 200, 240, 0.2);
  }

  .panel-hint {
    margin: 0;
    font-size: 0.75rem;
    opacity: 0.55;
    font-style: italic;
  }

  .consequence {
    margin: 0;
    font-size: 0.8rem;
    opacity: 0.85;
  }

  .panel-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .row-error {
    margin: 0;
    font-size: 0.8rem;
    color: #f0a0a0;
  }

  .row-error.inline {
    padding: 0 0.8rem 0.7rem;
  }

  .empty {
    opacity: 0.5;
    font-style: italic;
    font-size: 0.85rem;
  }

  .loading, .error {
    position: relative;
    z-index: 2;
    opacity: 0.7;
  }

  .error {
    color: #f0a0a0;
  }

  @media (max-width: 520px) {
    .foretelling-chamber {
      padding: 2rem 1rem;
    }

    .panel-grid {
      grid-template-columns: 1fr;
    }

    .outlook-row {
      grid-template-columns: 1fr;
    }

    .outlook-verdict {
      text-align: left;
    }
  }
</style>

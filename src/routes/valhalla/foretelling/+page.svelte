<script lang="ts">
  import { onMount } from "svelte";
  import { apiFetch } from "$lib/api";

  let daily = $state([]);
  let foretoldTransactions = $state([]);
  let loading = $state(true);
  let error = $state("");
  let expandedDate = $state(null);
  let flashingDate = $state(null);
  let markingLanded = $state(null);

  const now = new Date();
  const monthName = now.toLocaleString('default', { month: 'long' });
  const year = now.getFullYear();
  const todayStr = now.toISOString().slice(0, 10);

  const byDate = $derived.by(() => {
    const map = new Map();
    for (const d of daily) {
      map.set(d.date, d);
    }
    return map;
  });

  const calendarCells = $derived.by(() => {
    if (daily.length === 0) return [];

    const firstDay = new Date(daily[0].date);
    const startWeekday = firstDay.getDay();

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

  onMount(async () => {
    try {
      await Promise.all([loadDaily(), loadForetold()]);
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

  function dayNumber(dateStr) {
    return new Date(dateStr).getDate();
  }

  async function markLanded(transactionId) {
    markingLanded = transactionId;
    try {
      await apiFetch(`/valhalla/transactions/${transactionId}/mark-posted`, { method: "PATCH" });
      await Promise.all([loadDaily(), loadForetold()]);
    } catch (e) {
      error = "Could not mark that transaction as landed.";
    } finally {
      markingLanded = null;
    }
  }
</script>

<div class="foretelling-chamber">
  <div class="haze"></div>

  <h1 class="title">The Foretelling</h1>
  <p class="subtitle">{monthName} {year} — what has landed, and what is yet to come.</p>

  {#if loading}
    <p class="loading">The runes are being cast...</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else}
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
            class:has-expense={day.expense_amount > 0}
            onclick={() => handleDayClick(day)}
          >
            <span class="day-number">{dayNumber(day.date)}</span>
            <span class="day-balance {day.balance >= 0 ? 'positive' : 'negative'}">
              ${day.balance.toFixed(0)}
            </span>
            {#if day.income_amount > 0}
              <span class="mark gold-mark"></span>
            {/if}
            {#if day.expense_amount > 0}
              <span class="mark ash-mark" style="opacity: {Math.min(0.4 + (day.expense_amount / 500), 1)}"></span>
            {/if}
          </button>
        {/if}
      {/each}
    </div>

    {#if expandedDay}
      <div class="detail-panel">
        <h3 class="detail-date">
          {new Date(expandedDay.date).toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
        </h3>
        <div class="detail-balance {expandedDay.balance >= 0 ? 'positive' : 'negative'}">
          ${expandedDay.balance.toFixed(2)}
        </div>

        {#if expandedDay.income_amount > 0}
          <div class="detail-row income">
            <span>Foretold income</span>
            <span>+${expandedDay.income_amount.toFixed(2)}</span>
          </div>
        {/if}
        {#if expandedDay.expense_amount > 0}
          <div class="detail-row expense">
            <span>Foretold burden</span>
            <span>-${expandedDay.expense_amount.toFixed(2)}</span>
          </div>
        {/if}
        {#if expandedDay.income_amount === 0 && expandedDay.expense_amount === 0}
          <p class="detail-empty">Nothing foretold for this day.</p>
        {/if}
      </div>
    {/if}

    <div class="awaiting-section">
      <h2 class="awaiting-title">Awaiting Arrival</h2>
      {#if sortedForetold.length === 0}
        <p class="empty">Nothing foretold right now.</p>
      {:else}
        {#each sortedForetold as t}
          <div class="awaiting-row">
            <span class="awaiting-date">{t.date}</span>
            <span class="awaiting-main">
              {t.category} — {t.type === "expense" ? "-" : "+"}${t.amount?.toFixed?.(2) ?? t.amount}
            </span>
            <button
              type="button"
              class="rune-btn landed-btn"
              disabled={markingLanded === t.transaction_id}
              onclick={() => markLanded(t.transaction_id)}
              title="Mark as landed"
            >
              {markingLanded === t.transaction_id ? "…" : "🔥"}
            </button>
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

  .awaiting-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0.7rem;
    margin-bottom: 0.4rem;
    background: rgba(220, 200, 240, 0.05);
    border: 1px solid rgba(220, 200, 240, 0.15);
    border-radius: 8px;
    font-size: 0.85rem;
  }

  .awaiting-date {
    opacity: 0.6;
    white-space: nowrap;
  }

  .awaiting-main {
    flex: 1;
  }

  .rune-btn {
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    border: 1px solid rgba(220, 200, 240, 0.3);
    background: rgba(220, 200, 240, 0.05);
    color: #e8dcf0;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .landed-btn:hover:not(:disabled) {
    border-color: rgba(232, 216, 150, 0.7);
    background: rgba(232, 216, 150, 0.15);
  }

  .rune-btn:disabled {
    opacity: 0.5;
    cursor: default;
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
</style>

<script lang="ts">
  import { apiFetch } from "$lib/api";

  type Tx = {
    _id: string;
    amount: number;
    type: string;
    category: string;
    date: string;
    description?: string;
    source?: string;
    tags?: string[];
    status?: string;
  };

  const PAGE_SIZE = 25;

  const pad = (n: number) => String(n).padStart(2, "0");
  const today = new Date();

  let scope = $state<"month" | "all">("month");
  let viewYear = $state(today.getFullYear());
  let viewMonth = $state(today.getMonth());
  let q = $state("");
  let qDebounced = $state("");
  let typeFilter = $state("");
  let statusFilter = $state("posted");
  let sort = $state("date_desc");
  let page = $state(0);

  let rows = $state<Tx[]>([]);
  let total = $state(0);
  let loading = $state(true);
  let error = $state("");

  let monthStart = $derived(`${viewYear}-${pad(viewMonth + 1)}-01`);
  let monthEnd = $derived(
    `${viewYear}-${pad(viewMonth + 1)}-${pad(new Date(viewYear, viewMonth + 1, 0).getDate())}`
  );
  let monthTitle = $derived(
    new Date(viewYear, viewMonth, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })
  );

  let filtersActive = $derived(
    qDebounced !== "" || typeFilter !== "" || statusFilter !== "posted" || sort !== "date_desc"
  );
  let firstShown = $derived(total === 0 ? 0 : page * PAGE_SIZE + 1);
  let lastShown = $derived(Math.min(total, page * PAGE_SIZE + rows.length));
  let hasNext = $derived((page + 1) * PAGE_SIZE < total);

  const moneyFmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

  function shiftMonth(delta: number) {
    const d = new Date(viewYear, viewMonth + delta, 1);
    viewYear = d.getFullYear();
    viewMonth = d.getMonth();
  }

  function amountText(t: Tx) {
    const abs = moneyFmt.format(Math.abs(t.amount));
    if (t.type === "income") return `+${abs}`;
    if (t.type === "expense") return `\u2212${abs}`;
    return t.amount < 0 ? `\u2212${abs}` : abs;
  }

  function dateText(iso: string) {
    const [y, m, d] = (iso ?? "").split("-").map(Number);
    if (!y || !m || !d) return iso;
    return new Date(y, m - 1, d).toLocaleDateString(
      "en-US",
      scope === "all"
        ? { month: "short", day: "numeric", year: "numeric" }
        : { month: "short", day: "numeric" }
    );
  }

  function clearFilters() {
    q = "";
    qDebounced = "";
    typeFilter = "";
    statusFilter = "posted";
    sort = "date_desc";
  }

  // Wait for a pause in typing before searching.
  $effect(() => {
    const v = q;
    const t = setTimeout(() => {
      qDebounced = v.trim();
    }, 300);
    return () => clearTimeout(t);
  });

  let filterKey = $derived(
    JSON.stringify([scope, monthStart, qDebounced, typeFilter, statusFilter, sort])
  );
  let lastKey = "";
  let requestId = 0;

  async function load() {
    const id = ++requestId;
    const params = new URLSearchParams();
    if (scope === "month") {
      params.set("start_date", monthStart);
      params.set("end_date", monthEnd);
    }
    if (qDebounced) params.set("q", qDebounced);
    if (typeFilter) params.set("type", typeFilter);
    if (statusFilter) params.set("status", statusFilter);
    params.set("sort", sort);
    params.set("limit", String(PAGE_SIZE));
    params.set("skip", String(page * PAGE_SIZE));
    params.set("slim", "true");

    loading = true;
    error = "";
    try {
      const data = await apiFetch(`/valhalla/transactions/?${params.toString()}`);
      if (id !== requestId) return;
      rows = data.transactions ?? [];
      total = data.total ?? rows.length;
      if (rows.length === 0 && total > 0 && page > 0) {
        page = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1);
      }
    } catch (e) {
      if (id !== requestId) return;
      error = e instanceof Error ? e.message : "Could not load the history.";
      rows = [];
      total = 0;
    } finally {
      if (id === requestId) loading = false;
    }
  }

  // Any filter change returns to the first page; page changes just reload.
  $effect(() => {
    const key = filterKey;
    const p = page;
    if (key !== lastKey) {
      lastKey = key;
      if (p !== 0) {
        page = 0;
        return;
      }
    }
    load();
  });
</script>

<div class="history-chamber">
  <a class="back" href="/valhalla">&larr; The Hall</a>

  <h1 class="title">History</h1>
  <p class="subtitle">What moved, and when.</p>

  <div class="scope-bar">
    {#if scope === "month"}
      <div class="month-nav">
        <button type="button" class="nav-rune" aria-label="Previous month" onclick={() => shiftMonth(-1)}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 4 7 12 16 20" /></svg>
        </button>
        <span class="month-title">{monthTitle}</span>
        <button type="button" class="nav-rune" aria-label="Next month" onclick={() => shiftMonth(1)}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="8 4 17 12 8 20" /></svg>
        </button>
      </div>
    {:else}
      <span class="month-title">All time</span>
    {/if}
    <button type="button" class="scope-toggle" onclick={() => (scope = scope === "month" ? "all" : "month")}>
      {scope === "month" ? "Show all time" : "Back to months"}
    </button>
  </div>

  <div class="filters">
    <input
      type="search"
      class="search"
      placeholder="Search category, source, description..."
      aria-label="Search transactions"
      bind:value={q}
    />
    <div class="row">
      <select bind:value={typeFilter} aria-label="Type">
        <option value="">All types</option>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
        <option value="adjustment">Adjustment</option>
      </select>
      <select bind:value={statusFilter} aria-label="Status">
        <option value="posted">Landed</option>
        <option value="scheduled">Foretold</option>
        <option value="">Landed &amp; foretold</option>
      </select>
      <select bind:value={sort} aria-label="Sort">
        <option value="date_desc">Newest first</option>
        <option value="date_asc">Oldest first</option>
        <option value="amount_desc">Largest first</option>
        <option value="amount_asc">Smallest first</option>
      </select>
    </div>
  </div>

  {#if error}
    <p class="error">{error}</p>
  {:else if loading && rows.length === 0}
    <p class="muted">Reading the record...</p>
  {:else if rows.length === 0}
    <p class="muted">
      Nothing matches.
      {#if filtersActive}
        <button type="button" class="link-btn" onclick={clearFilters}>Clear filters</button>
      {/if}
    </p>
  {:else}
    <p class="count">{total} {total === 1 ? "entry" : "entries"}</p>

    <ul class="entries" class:dim={loading}>
      {#each rows as t (t._id)}
        <li class="entry">
          <div class="when">{dateText(t.date)}</div>
          <div class="what">
            <div class="what-main">
              <span class="category">{t.category}</span>
              {#if t.description && t.description.trim() !== "" && t.description.trim() !== "No description"}
                <span class="desc"> &mdash; {t.description.trim()}</span>
              {/if}
            </div>
            <div class="what-meta">
              {#if t.source}<span>{t.source}</span>{/if}
              {#if t.status === "scheduled"}<span class="chip">foretold</span>{/if}
              {#if t.type === "adjustment"}<span class="chip">adjustment</span>{/if}
              {#each t.tags ?? [] as tag}<span class="chip">{tag}</span>{/each}
            </div>
          </div>
          <div class="amt {t.type}">{amountText(t)}</div>
        </li>
      {/each}
    </ul>

    {#if total > PAGE_SIZE}
      <div class="pager">
        <button type="button" class="pager-btn" disabled={page === 0 || loading} onclick={() => (page -= 1)}>Previous</button>
        <span class="pager-info">{firstShown}&ndash;{lastShown} of {total}</span>
        <button type="button" class="pager-btn" disabled={!hasNext || loading} onclick={() => (page += 1)}>Next</button>
      </div>
    {/if}
  {/if}
</div>

<style>
  .history-chamber {
    max-width: 760px;
    margin: 4rem auto;
    padding: 2.5rem 2.5rem 3rem;
    background: radial-gradient(circle at center, #0a0e14, #000);
    border: 1px solid rgba(150, 190, 220, 0.2);
    border-radius: 12px;
    color: #dce8f0;
  }

  .back {
    display: inline-block;
    margin-bottom: 1rem;
    font-size: 0.8rem;
    color: #dce8f0;
    opacity: 0.55;
    text-decoration: none;
  }
  .back:hover { opacity: 0.9; }

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
    margin: 0 0 1.8rem 0;
  }

  .scope-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 1.2rem;
  }

  .month-nav {
    display: flex;
    align-items: center;
    gap: 0.8rem;
  }

  .month-title {
    font-family: 'Cinzel', serif;
    letter-spacing: 0.06em;
    font-size: 1.1rem;
    min-width: 9rem;
    text-align: center;
  }

  .nav-rune {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.2rem;
    height: 2.2rem;
    padding: 0;
    border-radius: 999px;
    border: 1px solid rgba(150, 190, 220, 0.35);
    background: rgba(150, 190, 220, 0.06);
    color: #dce8f0;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .nav-rune:hover {
    background: rgba(150, 190, 220, 0.2);
    box-shadow: 0 0 12px rgba(150, 190, 220, 0.25);
  }

  .scope-toggle, .pager-btn {
    padding: 0.5rem 1rem;
    border-radius: 999px;
    border: 1px solid rgba(150, 190, 220, 0.4);
    background: linear-gradient(135deg, rgba(150,190,220,0.15), rgba(100,140,180,0.15));
    color: #dce8f0;
    font-family: 'Cinzel', serif;
    letter-spacing: 0.05em;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .scope-toggle:hover, .pager-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(150,190,220,0.28), rgba(100,140,180,0.28));
    box-shadow: 0 0 16px rgba(150, 190, 220, 0.2);
  }
  .pager-btn:disabled { opacity: 0.4; cursor: default; }

  .filters {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    margin-bottom: 1.4rem;
  }

  .row {
    display: flex;
    gap: 0.8rem;
    flex-wrap: wrap;
  }
  .row select { flex: 1; min-width: 9rem; }

  input, select {
    padding: 0.6rem 0.8rem;
    border-radius: 6px;
    background: rgba(150, 190, 220, 0.06);
    border: 1px solid rgba(150, 190, 220, 0.25);
    color: #dce8f0;
    font-size: 0.95rem;
    font-family: inherit;
  }
  input:focus, select:focus {
    outline: none;
    border-color: rgba(150, 190, 220, 0.6);
    box-shadow: 0 0 12px rgba(150, 190, 220, 0.25);
  }

  .count {
    margin: 0 0 0.6rem 0;
    font-size: 0.8rem;
    opacity: 0.55;
  }

  .entries {
    list-style: none;
    margin: 0;
    padding: 0;
    transition: opacity 0.15s ease;
  }
  .entries.dim { opacity: 0.5; }

  .entry {
    display: grid;
    grid-template-columns: 5.5rem 1fr auto;
    gap: 1rem;
    align-items: baseline;
    padding: 0.8rem 0;
    border-top: 1px solid rgba(150, 190, 220, 0.12);
  }
  .entry:last-child { border-bottom: 1px solid rgba(150, 190, 220, 0.12); }

  .when {
    font-size: 0.85rem;
    opacity: 0.65;
    white-space: nowrap;
  }

  .what-main { font-size: 0.98rem; }
  .category { font-weight: 600; }
  .desc { opacity: 0.7; }

  .what-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-top: 0.25rem;
    font-size: 0.78rem;
    opacity: 0.6;
  }

  .chip {
    padding: 0 0.5rem;
    border-radius: 999px;
    border: 1px solid rgba(150, 190, 220, 0.3);
    font-size: 0.72rem;
  }

  .amt {
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    font-size: 1rem;
  }
  .amt.income { color: #9fd6a0; }
  .amt.expense { color: #dce8f0; }
  .amt.adjustment { color: #d6c89f; }

  .pager {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 1.4rem;
  }
  .pager-info { font-size: 0.85rem; opacity: 0.65; }

  .muted { opacity: 0.6; text-align: center; padding: 2rem 0; }

  .link-btn {
    background: none;
    border: none;
    color: #dce8f0;
    text-decoration: underline;
    cursor: pointer;
    font-size: inherit;
    padding: 0 0.3rem;
  }

  .error { color: #f0a0a0; font-size: 0.9rem; }

  @media (max-width: 560px) {
    .history-chamber { margin: 1rem; padding: 1.5rem 1.2rem 2rem; }
    .entry { grid-template-columns: 1fr auto; }
    .when { grid-column: 1 / -1; }
  }
</style>

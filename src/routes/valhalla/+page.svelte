<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { apiFetch } from "$lib/api";

  let balance = $state(null);
  let monthBalance = $state(null);
  let commitments = $state([]);
  let loading = $state(true);
  let error = $state("");
  let projectedEOM = $state(null);
  let lowest = $state(null);
  let ragnarokNudge = $state(null);

  const quotes = [
    "Cattle die, and kinsmen die, and so one dies one's self; but a noble name will never die, if good renown one gets.",
    "Cattle die, and kinsmen die; one thing now that never dies — the fame of a dead man's deeds.",
    "Full-stocked folds had the Fatling's sons, who bear now a beggar's staff: brief is wealth, as the winking of an eye, most faithless ever of friends.",
    "Early must he rise who wants to have another's cattle or life; seldom does a reclining wolf get the meat, nor a sleeping man victory.",
    "He hath need of his wits who wanders wide; aught simple will serve at home.",
    "It is best for man to be middle-wise, not overly cunning and clever: the fairest lives are led by those who know much, but not too much.",
    "The unwise man is awake all night, thinking of many things; when morning comes he is worn with care, and his trouble is just as it was.",
    "A better burden may no man bear on the way than his mother wit; no worse provision can he carry with him than too deep a draught of ale.",
    "The niggard is worried by everything; the mean man mopes over gifts.",
    "Give praise to the day at evening, to a woman on her pyre, to a weapon when tried, to a maid at wedlock, to ice when it is crossed, to ale that is drunk."
  ];


  const quote = quotes[Math.floor(Math.random() * quotes.length)];

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysInMonth = endOfMonth.getDate();
  const dayOfMonth = now.getDate();
  const monthProgress = dayOfMonth / daysInMonth;
  const startOfMonthStr = startOfMonth.toISOString().slice(0, 10);
  const endOfMonthStr = endOfMonth.toISOString().slice(0, 10);
  const todayStr = now.toISOString().slice(0, 10);
  const monthName = now.toLocaleString('default', { month: 'long' });

  // -$439.95, not $-439.95
  function money(n) {
    const v = Number(n) || 0;
    const rounded = Number(v.toFixed(2));
    const body = Math.abs(rounded).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return `${rounded < 0 ? "-" : ""}$${body}`;
  }

  // "YYYY-MM-DD" -> "Oct 28", read as a local calendar day. Never use
  // new Date("YYYY-MM-DD") for display: it parses as UTC midnight and lands
  // on the previous day in US time zones.
  function fmtShort(dateStr) {
    const [y, m, d] = dateStr.slice(0, 10).split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('default', { month: 'short', day: 'numeric' });
  }

  const upcomingBurdens = $derived(
    commitments.filter(c => c.due_date >= todayStr && c.due_date <= endOfMonthStr)
  );
  const upcomingTotal = $derived(
    upcomingBurdens.reduce((sum, c) => sum + (c.amount || 0), 0)
  );
  const lowestWhen = $derived(
    lowest ? (lowest.date === todayStr ? "today" : `on ${fmtShort(lowest.date)}`) : ""
  );


  onMount(async () => {
    try {
      // --- Ragnarök trigger check ---
      const lastEntryRes = await apiFetch("/valhalla/transactions/last-entry");
      if (lastEntryRes.last_date) {
        const last = new Date(lastEntryRes.last_date + "T00:00:00Z");
        const today = new Date();
        const msPerDay = 1000 * 60 * 60 * 24;
        const daysSince = Math.floor((today - last) / msPerDay);

        if (daysSince >= 8) {
          await goto("/valhalla/ragnarok");
          return;
        }
        if (daysSince >= 4) {
          ragnarokNudge = daysSince;
        }
      }

      const [balRes, monthRes, setupRes, projRes] = await Promise.allSettled([
        apiFetch(`/valhalla/balances/available`),
        apiFetch(`/valhalla/balances/view?start_date=${startOfMonthStr}`),
        apiFetch(`/valhalla/setup/dashboard`),
        apiFetch(`/valhalla/balances/projection/daily`),
      ]);

      if (balRes.status !== "fulfilled") {
        throw new Error("Could not reach the Hall's ledger.");
      }
      balance = balRes.value;

      monthBalance = monthRes.status === "fulfilled" ? monthRes.value : { balance: 0 };

      const setupData = setupRes.status === "fulfilled" ? setupRes.value : { commitments: [] };
      commitments = setupData.commitments ?? [];

      // The daily projection runs through the end of this month, so its last
      // day is the projected month's end and its minimum is the lowest point.
      const projDays = projRes.status === "fulfilled" ? (projRes.value.daily ?? []) : [];
      if (projDays.length > 0) {
        projectedEOM = projDays[projDays.length - 1].balance;
        lowest = projDays.reduce((min, d) => (d.balance < min.balance ? d : min), projDays[0]);
      }
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  });

  const runes = [
    { name: "The Ledger", desc: "Offer a transaction", href: "/valhalla/ledger" },
    { name: "The Burdens", desc: "Debts & recurring bills", href: "/valhalla/burdens" },
    { name: "The Harvest", desc: "Income", href: "/valhalla/harvest" },
    { name: "The Reckoning", desc: "Reconcile with the bank", href: "/valhalla/reckoning" },
    { name: "The Hoard", desc: "Assets & net worth", href: "/valhalla/hoard" },
    { name: "The Glen", desc: "Money & feeling, side by side", href: "/valhalla/glen" },
    { name: "The History", desc: "What moved, and when", href: "/valhalla/history" },
  ];
</script>


<div class="hall">
  <div class="mist"></div>
  <div class="rune-ring"></div>

  <h1 class="hall-title">The Hall</h1>
  <p class="blessing">— {quote}</p>

  {#if ragnarokNudge}
    <p class="ragnarok-nudge">It has been {ragnarokNudge} days since your last entry.</p>
  {/if}

  {#if loading}
    <p class="loading">The ledger stirs...</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else}
    <div class="summary">
      <div class="summary-item balance-item">
        <span class="label">Balance</span>
        <span class="value {balance.balance >= 0 ? 'positive' : 'negative'}">
          {money(balance.balance)}
        </span>
      </div>
    </div>

    <div class="moon-section">
      <h2 class="moon-title">The Turning of {monthName}</h2>
      <div class="moon-bar">
        <div class="moon-fill" style="width: {(1 - monthProgress) * 100}%"></div>
        <div class="moon-marker" style="left: {monthProgress * 100}%"></div>
      </div>
      <p class="moon-caption">Day {dayOfMonth} of {daysInMonth}</p>

      <a href="/valhalla/foretelling" class="foretelling-stone">
        <div class="stone-glow"></div>
        <span class="stone-label">The Foretelling</span>
        {#if projectedEOM !== null}
          <span class="stone-value {projectedEOM >= 0 ? 'positive' : 'negative'}">
            {money(projectedEOM)}
          </span>
        {/if}
        <span class="stone-caption">projected at month's end</span>
        {#if lowest}
          <span class="stone-low {lowest.balance >= 0 ? 'positive' : 'negative'}">
            Lowest: {money(lowest.balance)} {lowestWhen}
          </span>
        {/if}
      </a>

      <div class="cashflow-stats">
        <div class="cashflow-item">
          <span class="label">So Far This Month</span>
          <span class="value {monthBalance.balance >= 0 ? 'positive' : 'negative'}">{money(monthBalance.balance)}</span>
        </div>
        <div class="cashflow-item">
          <span class="label">Still Owed</span>
          <span class="value expense">{money(upcomingTotal)}</span>
        </div>
      </div>

      {#if upcomingBurdens.length > 0}
        <div class="upcoming-list">
          {#each upcomingBurdens as c}
            <div class="upcoming-row">
              <span>{c.name}</span>
              <span>{money(c.amount)} — {c.due_date}</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}

  <div class="rune-grid">
    {#each runes as rune}
      <a href={rune.href} class="rune-card">
        <h3>{rune.name}</h3>
        <p>{rune.desc}</p>
      </a>
    {/each}
  </div>
</div>

<style>
  .hall {
    position: relative;
    min-height: 100vh;
    padding: 4rem 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: radial-gradient(circle at center, #0a0e14, #000);
    color: #dce8f0;
    overflow: hidden;
  }

  .mist {
    position: absolute;
    inset: -30%;
    background:
      radial-gradient(circle at 30% 20%, rgba(120, 170, 220, 0.12), transparent 70%),
      radial-gradient(circle at 70% 80%, rgba(200, 190, 140, 0.08), transparent 75%);
    filter: blur(50px);
    pointer-events: none;
    z-index: 0;
  }

  .rune-ring {
    position: absolute;
    top: 15%;
    left: 50%;
    width: 500px;
    height: 500px;
    transform: translateX(-50%);
    border-radius: 50%;
    border: 1px solid rgba(150, 190, 220, 0.15);
    box-shadow: 0 0 60px rgba(120, 170, 220, 0.1);
    pointer-events: none;
    z-index: 0;
  }

  .foretelling-stone {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    width: 220px;
    padding: 1.5rem;
    margin: 0 auto 2.5rem;
    background: radial-gradient(circle at center, rgba(220, 200, 240, 0.08), rgba(10, 14, 20, 0.6));
    border: 1px solid rgba(220, 200, 240, 0.3);
    border-radius: 16px;
    text-decoration: none;
    color: inherit;
    cursor: pointer;
    transition: all 0.3s ease;
    overflow: hidden;
  }

  .foretelling-stone:hover {
    border-color: rgba(220, 200, 240, 0.7);
    box-shadow: 0 0 30px rgba(220, 200, 240, 0.25);
    transform: translateY(-3px);
  }

  .stone-glow {
    position: absolute;
    inset: -50%;
    background: radial-gradient(circle, rgba(220, 200, 240, 0.15), transparent 70%);
    animation: stoneGlowPulse 4s ease-in-out infinite alternate;
    pointer-events: none;
  }

  @keyframes stoneGlowPulse {
    from { opacity: 0.5; }
    to   { opacity: 1; }
  }

  .stone-label {
    position: relative;
    font-family: 'Cinzel', serif;
    font-size: 0.95rem;
    letter-spacing: 0.08em;
    opacity: 0.85;
  }

  .stone-value {
    position: relative;
    font-family: 'Cinzel', serif;
    font-size: 1.6rem;
    text-shadow: 0 0 12px currentColor;
  }

  .stone-caption {
    position: relative;
    font-size: 0.7rem;
    opacity: 0.5;
    font-style: italic;
  }

  .stone-low {
    position: relative;
    margin-top: 0.3rem;
    font-size: 0.75rem;
    opacity: 0.8;
    text-align: center;
  }


  .hall-title {
    position: relative;
    z-index: 2;
    font-family: 'Cinzel', serif;
    font-size: 2.5rem;
    letter-spacing: 0.1em;
    text-shadow: 0 0 20px rgba(150, 190, 220, 0.4);
    margin-bottom: 0.5rem;
  }

  .blessing {
    position: relative;
    z-index: 2;
    font-style: italic;
    opacity: 0.5;
    font-size: 0.9rem;
    margin-bottom: 2rem;
    text-align: center;
    max-width: 400px;
  }

  .ragnarok-nudge {
    position: relative;
    z-index: 2;
    font-size: 0.8rem;
    color: #d69f9f;
    opacity: 0.8;
    margin-bottom: 1rem;
  }

  .summary {
    position: relative;
    z-index: 2;
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-bottom: 2rem;
    padding: 1.5rem 2.5rem;
    background: rgba(10, 14, 20, 0.6);
    border: 1px solid rgba(150, 190, 220, 0.2);
    border-radius: 12px;
    backdrop-filter: blur(8px);
  }

  .summary-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
  }

  .label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    opacity: 0.6;
  }

  .value {
    font-size: 1.4rem;
    font-family: 'Cinzel', serif;
  }

  .expense { color: #d69f9f; }
  .positive { color: #9fd6a0; }
  .negative { color: #d69f9f; }

  .moon-section {
    position: relative;
    z-index: 2;
    width: 100%;
    max-width: 500px;
    padding: 1.5rem 2rem;
    margin-bottom: 2.5rem;
    background: rgba(10, 14, 20, 0.5);
    border: 1px solid rgba(220, 200, 240, 0.2);
    border-radius: 12px;
  }

  .moon-title {
    font-family: 'Cinzel', serif;
    font-size: 1rem;
    text-align: center;
    opacity: 0.8;
    margin: 0 0 1rem 0;
  }

  .moon-bar {
    position: relative;
    height: 8px;
    background: rgba(220, 200, 240, 0.1);
    border-radius: 999px;
    overflow: visible;
  }

  .moon-fill {
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    background: linear-gradient(90deg, rgba(220, 200, 240, 0.3), rgba(240, 230, 255, 0.95));
    border-radius: 999px;
    box-shadow: 0 0 16px rgba(220, 200, 240, 0.5);
    transition: width 0.3s ease;
  }

  .moon-marker {
    position: absolute;
    top: 50%;
    width: 14px;
    height: 14px;
    background: #ffffff;
    border-radius: 50%;
    box-shadow: 0 0 14px rgba(240, 230, 255, 1), 0 0 24px rgba(220, 200, 240, 0.6);
    transform: translate(-50%, -50%);
  }


  .moon-caption {
    text-align: center;
    font-size: 0.75rem;
    opacity: 0.5;
    margin: 0.6rem 0 1.2rem 0;
  }

  .cashflow-stats {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
  }

  .cashflow-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
    flex: 1;
  }

  .cashflow-item .value {
    font-size: 1.05rem;
  }

  .upcoming-list {
    margin-top: 1.2rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(220, 200, 240, 0.15);
  }

  .upcoming-row {
    display: flex;
    justify-content: space-between;
    padding: 0.3rem 0.4rem;
    font-size: 0.8rem;
    opacity: 0.75;
  }

  .rune-grid {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.5rem;
    max-width: 900px;
    width: 100%;
  }

  .rune-card {
    display: block;
    padding: 1.5rem;
    background: rgba(10, 14, 20, 0.5);
    border: 1px solid rgba(150, 190, 220, 0.2);
    border-radius: 12px;
    text-decoration: none;
    color: inherit;
    transition: all 0.2s ease;
  }

  .rune-card:hover {
    border-color: rgba(150, 190, 220, 0.5);
    background: rgba(150, 190, 220, 0.08);
    transform: translateY(-2px);
  }

  .rune-card h3 {
    font-family: 'Cinzel', serif;
    margin: 0 0 0.4rem 0;
    font-size: 1.1rem;
  }

  .rune-card p {
    margin: 0;
    font-size: 0.85rem;
    opacity: 0.7;
  }

  .loading, .error {
    position: relative;
    z-index: 2;
    margin-bottom: 3rem;
    opacity: 0.7;
  }
</style>

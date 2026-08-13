<script lang="ts">
  import { onMount } from "svelte";
  import { apiFetch } from "$lib/api";

  let balance = $state(null);
  let monthBalance = $state(null);
  let commitments = $state([]);
  let hoard = $state(null);
  let lastReckonedDate = $state(null);
  let loading = $state(true);
  let error = $state("");
  let projectedEOM = $state(null);
  const quotes = [
    "Cattle die, and kinsmen die, and so one dies one's self; but a noble name will never die, if good renown one gets.",
    "Cattle die, and kinsmen die; one thing now that never dies — the fame of a dead man's deeds.",
    "Full-stocked folds had the Fatling's sons, who bear now a beggar's staff: brief is wealth, as the winking of an eye, most faithless ever of friends.",
    "Early must he rise who wants to have another's cattle or life; seldom does a reclining wolf get the meat, nor a sleeping man victory.",
    "He hath need of his wits who wanders wide; aught simple will serve at home."
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

  const upcomingBurdens = $derived(
    commitments.filter(c => c.due_date >= todayStr && c.due_date <= endOfMonthStr)
  );
  const upcomingTotal = $derived(
    upcomingBurdens.reduce((sum, c) => sum + (c.amount || 0), 0)
  );
  const projectedEndOfMonth = $derived(
    monthBalance !== null ? monthBalance.balance - upcomingTotal : null
  );


  onMount(async () => {
    try {
    const [balRes, monthRes, setupRes, hoardRes, reckonedRes, projRes] = await Promise.allSettled([
        apiFetch(`/valhalla/balances/available`),
        apiFetch(`/valhalla/balances/view?start_date=${startOfMonthStr}`),

        apiFetch(`/valhalla/setup/dashboard`),
        apiFetch(`/valhalla/hoard/view`),
        apiFetch(`/valhalla/setup/last-reckoned`),
        apiFetch(`/valhalla/balances/projection/end-of-month`),
      ]);

      if (balRes.status !== "fulfilled") {
        throw new Error("Could not reach the Hall's ledger.");
      }
      balance = balRes.value;

      monthBalance = monthRes.status === "fulfilled" ? monthRes.value : { balance: 0 };

      const setupData = setupRes.status === "fulfilled" ? setupRes.value : { commitments: [] };
      commitments = setupData.commitments ?? [];

      hoard = hoardRes.status === "fulfilled" ? hoardRes.value : null;

      const reckonedData = reckonedRes.status === "fulfilled" ? reckonedRes.value : {};
      lastReckonedDate = reckonedData.last_reckoned_date ?? null;

      projectedEOM = projRes.status === "fulfilled" ? projRes.value.balance : null;
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
  ];
</script>


<div class="hall">
  <div class="mist"></div>
  <div class="rune-ring"></div>

  <h1 class="hall-title">The Hall</h1>
  <p class="blessing">— {quote}</p>

  {#if loading}
    <p class="loading">The ledger stirs...</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else}
    <div class="summary">
      <div class="summary-item">
        <span class="label">Harvest</span>
        <span class="value income">${balance.income_total.toFixed(2)}</span>
      </div>
      <div class="summary-item">
        <span class="label">Burdens</span>
        <span class="value expense">${balance.expense_total.toFixed(2)}</span>
      </div>
      <div class="summary-item balance-item">
        <span class="label">Balance</span>
        <span class="value {balance.balance >= 0 ? 'positive' : 'negative'}">
          ${balance.balance.toFixed(2)}
        </span>
      </div>
    </div>

    {#if hoard}
      <div class="secondary-row">
        <div class="mini-stat">
          <span class="mini-label">Net Worth</span>
          <span class="mini-value {hoard.net_worth >= 0 ? 'positive' : 'negative'}">${hoard.net_worth.toFixed(2)}</span>
        </div>
        <div class="mini-stat">
          <span class="mini-label">Last Reckoned</span>
          <span class="mini-value neutral">{lastReckonedDate ?? "Not yet"}</span>
        </div>
      </div>
    {/if}

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
      ${projectedEOM.toFixed(2)}
    </span>
  {/if}
  <span class="stone-caption">by month's end</span>
        </a>

      <div class="cashflow-stats">
        <div class="cashflow-item">
          <span class="label">So Far This Month</span>
          <span class="value {monthBalance.balance >= 0 ? 'positive' : 'negative'}">${monthBalance.balance.toFixed(2)}</span>
        </div>
        <div class="cashflow-item">
          <span class="label">Still Owed</span>
          <span class="value expense">${upcomingTotal.toFixed(2)}</span>
        </div>
        <div class="cashflow-item">
          <span class="label">Projected at Month's End</span>
          <span class="value {projectedEndOfMonth >= 0 ? 'positive' : 'negative'}">${projectedEndOfMonth.toFixed(2)}</span>
        </div>
      </div>

      {#if upcomingBurdens.length > 0}
        <div class="upcoming-list">
          {#each upcomingBurdens as c}
            <div class="upcoming-row">
              <span>{c.name}</span>
              <span>${c.amount?.toFixed?.(2) ?? c.amount} — {c.due_date}</span>
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
  margin-bottom: 2.5rem;
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

  .summary {
    position: relative;
    z-index: 2;
    display: flex;
    gap: 2rem;
    margin-bottom: 1.5rem;
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

  .income { color: #9fd6a0; }
  .expense { color: #d69f9f; }
  .positive { color: #9fd6a0; }
  .negative { color: #d69f9f; }
  .neutral { color: #dce8f0; }

  .secondary-row {
    position: relative;
    z-index: 2;
    display: flex;
    gap: 2rem;
    margin-bottom: 2rem;
  }

  .mini-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
    padding: 0.6rem 1.2rem;
    background: rgba(150, 190, 220, 0.05);
    border: 1px solid rgba(150, 190, 220, 0.15);
    border-radius: 8px;
  }

  .mini-label {
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    opacity: 0.5;
  }

  .mini-value {
    font-size: 0.95rem;
    font-family: 'Cinzel', serif;
  }

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

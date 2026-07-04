<script lang="ts">
  import PhoenixInscription from "$lib/components/PhoenixInscription.svelte";
  import Step from "$lib/Step.svelte";
  import { ritualSteps as steps } from "$lib/ritualSteps";
  import buildFragment from "$lib/builder";
  import generateInscription from "$lib/inscription";

  // Runes reactive state (const as required by runes mode)
  const currentStep = $state(0);
  const stage = $state<"ritual" | "closing">("ritual");
  const closingLine = $state("");
  const phoenixFragment = $state(null);
  const advancing = $state(false);

  // Derived step
  const step = $derived(() => steps[currentStep]);

  function back() {
    if (typeof currentStep !== "number") {
      console.warn("back: currentStep is not a number", currentStep);
      return;
    }
    if (currentStep > 0) {
      $currentStep = currentStep - 1;
    }
  }

  function next() {
    if (typeof currentStep !== "number") {
      console.warn("next: currentStep is not a number", currentStep);
      return;
    }
    if (currentStep >= steps.length - 1) return;

    $advancing = true;

    setTimeout(() => {
      $currentStep = currentStep + 1;
      $advancing = false;
    }, 1200);
  }

  async function offerRitual() {
    const fragment = buildFragment(steps);

    const res = await fetch("/rituals/fragments/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fragment)
    });

    if (!res.ok) {
      console.error("Phoenix ingestion failed:", await res.text());
      return;
    }

    $phoenixFragment = await res.json();

    const inscription = generateInscription(fragment);
    $closingLine = inscription;
    $stage = "closing";
  }
</script>

<div class="chamber">
  <div class="mist"></div>
  <div class="rune-ring"></div>

  {#if stage === "ritual"}
    <div class="step-wrap">
      <Step
        step={step}
        advancing={advancing}
      />
    </div>

    <div class="nav" style="outline: 2px solid rgba(255,0,0,0.06);">
      {#if currentStep > 0}
        <button class="nav-btn" on:click={back}>Back</button>
      {/if}

      {#if currentStep < steps.length - 1}
        <button class="nav-btn" on:click={next}>Next</button>
      {:else}
        <button class="offer" on:click={offerRitual}>Offer to the Stone</button>
      {/if}
    </div>
  {/if}

  {#if stage === "closing"}
    <div class="closing">
      <PhoenixInscription
        text={closingLine}
        letterDelay={120}
        glowColor="#7fffd4"
      />
    </div>
  {/if}
</div>

<style>
  .chamber {
    position: relative;
    min-height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .mist {
    position: absolute;
    inset: -40%;
    background:
      radial-gradient(circle at 20% 10%, rgba(0, 255, 255, 0.18), transparent 70%),
      radial-gradient(circle at 80% 90%, rgba(127, 255, 212, 0.15), transparent 75%),
      radial-gradient(circle at 50% 50%, rgba(0, 180, 255, 0.12), transparent 80%);
    filter: blur(48px);
    opacity: 0.85;
    animation: chamberBreath 22s ease-in-out infinite, mistDrift 60s linear infinite;
    pointer-events: none;
    z-index: 1;
    mix-blend-mode: screen;
  }

  .rune-ring {
    position: absolute;
    width: 420px;
    height: 420px;
    border-radius: 50%;
    border: 1px solid rgba(127, 255, 212, 0.18);
    box-shadow:
      0 0 24px rgba(0, 255, 255, 0.25),
      inset 0 0 32px rgba(0, 0, 0, 0.9);
    opacity: 0.55;
    animation: runePulse 18s ease-in-out infinite;
    pointer-events: none;
    z-index: 2;
  }

  .step-wrap {
    position: relative;
    z-index: 10;
  }

  .nav {
    margin-top: 2rem;
    display: flex;
    gap: 1rem;
    z-index: 10;
  }

  .nav-btn,
  .offer {
    padding: 0.6rem 1.4rem;
    border-radius: 999px;
    border: 1px solid rgba(127, 255, 212, 0.4);
    background: radial-gradient(circle at 0% 0%, #0b1822 0%, #020509 70%);
    color: #aefee0;
    font-family: "Cinzel", serif;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    box-shadow:
      0 0 12px rgba(0, 255, 255, 0.35),
      0 0 24px rgba(0, 0, 0, 0.9);
    transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  }

  .nav-btn:hover,
  .offer:hover {
    transform: translateY(-1px);
    border-color: rgba(127, 255, 212, 0.8);
    box-shadow:
      0 0 18px rgba(0, 255, 255, 0.55),
      0 0 32px rgba(0, 0, 0, 1);
  }

  .closing {
    max-width: 60%;
    text-align: center;
    z-index: 10;
  }

  @keyframes chamberBreath {
    0% { transform: scale(1) translateY(0); opacity: 0.5; }
    50% { transform: scale(1.08) translateY(-10px); opacity: 0.8; }
    100% { transform: scale(1) translateY(0); opacity: 0.5; }
  }

  @keyframes runePulse {
    0% { transform: scale(0.96); opacity: 0.4; }
    50% { transform: scale(1.04); opacity: 0.8; }
    100% { transform: scale(0.96); opacity: 0.4; }
  }

  @keyframes mistDrift {
    0% { transform: translate(-4%, 0) scale(1); }
    50% { transform: translate(4%, -2%) scale(1.08); }
    100% { transform: translate(-4%, 0) scale(1); }
  }
</style>


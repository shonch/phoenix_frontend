<script lang="ts">
  import PhoenixInscription from "$lib/components/PhoenixInscription.svelte";
  import Step from "./Step.svelte";
  import { ritualSteps } from "./ritualSteps";
  import buildFragment from "./builder";
  import generateInscription from "./inscription";

  // Runes Mode: implicit runes only
  let steps = $state(ritualSteps);
  let currentStep = $state(0);
  let stage = $state("ritual");
  let closingLine = $state("");
  let phoenixFragment = $state(null);
  let advancing = $state(false);

  function back() {
    if (currentStep > 0) {
      currentStep = currentStep - 1;
    }
  }

  function next() {
    if (currentStep >= steps.length - 1) return;

    advancing = true;
    setTimeout(() => {
      currentStep = currentStep + 1;
      advancing = false;
    }, 1200);
  }

  // ⭐ CRITICAL: persist response into the steps array
  function handleResponseChange(value: string) {
    steps[currentStep].response = value;
  }

  async function offerRitual() {
    const fragment = buildFragment(steps);

    const payload = {
      module: "phoenix.ritual",
      layer: "user",
      type: "fragment",
      raw_text: fragment.raw_text,
      body: fragment.body,
      tags: fragment.tags,
      source: "frontend",
      timestamp: new Date().toISOString()
    };

    console.log("Sending payload:", payload);

    const res = await fetch(
      "http://127.0.0.1:8000/rituals/fragments/log_emotion",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    if (!res.ok) {
      console.error("Phoenix ingestion failed:", await res.text());
      return;
    }

    phoenixFragment = await res.json();

    closingLine = generateInscription(fragment);
    stage = "closing";
  }
</script>

<div class="chamber">
  <div class="mist"></div>
  <div class="rune-ring"></div>

  {#if stage === "ritual"}
    <div class="step-wrap">
      <Step
        index={currentStep}
        steps={steps}
        advancing={advancing}
        onResponseChange={handleResponseChange}
      />
    </div>

    <div class="nav">
      {#if currentStep > 0}
        <button class="nav-btn" onclick={back}>Back</button>
      {/if}

      {#if currentStep < steps.length - 1}
        <button class="nav-btn" onclick={next}>Next</button>
      {:else}
        <button class="offer" onclick={offerRitual}>Offer to the Stone</button>
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
  /* your original styles */
</style>


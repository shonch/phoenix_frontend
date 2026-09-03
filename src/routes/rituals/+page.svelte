<script lang="ts">
  import { onMount } from "svelte";
  import { PUBLIC_API_URL } from '$env/static/public';
  import PhoenixInscription from "$lib/components/PhoenixInscription.svelte";
  import Step from "./Step.svelte";
  import { ritualSteps } from "./ritualSteps";
  import buildFragment from "./builder";
  import generateInscription from "./inscription";
  import { ritualPrompts } from "./ritualPrompts";
  import FireParticles from "$lib/components/FireParticles.svelte";
  import { inferTagsFromStep } from "./tagInference";
  import { invalidateAll } from '$app/navigation';
  import { phoenixState } from '$lib/stateStore';
  import { apiFetch } from '$lib/api';
const availableTags = $derived($phoenixState?.raw?.symbolic_tags ?? []);


$effect(() => {
  console.log("AVAILABLE TAGS:", availableTags);
});



// ritual type + token
let hasClassified = false;
let ritualType;
let token = "";
let capturedSteps = [];
let rejectedTagIds = {}; // { [stepId]: Set of tag_id }






import { authStore } from '$lib/authStore';
import { get } from 'svelte/store';

onMount(() => {
    const auth = get(authStore);
    token = auth.token ?? "";
    console.log("TOKEN LOADED FROM AUTH STORE:", token);
});



  // ⭐ FIXED: steps must start as an empty $state array
  let steps = $state([]);
  steps = structuredClone(ritualSteps);
  console.log("INITIAL STEPS:", steps);

  let currentStep = $state(0);
  let stage = $state("select");
  let closingLine = $state("");
  let phoenixFragment = $state(null);
  let advancing = $state(false);


    const ritualTypes = [
    { type: "emotion", label: "Emotion", rune: "ᛖ", element: "fire" },
    { type: "detective", label: "Detective", rune: "ᛞ", element: "lightning" },
    { type: "mirror", label: "Mirror", rune: "ᛗ", element: "ice" },
    { type: "grind", label: "Grind", rune: "ᚷ", element: "sun" },
    { type: "anti_grind", label: "Release", rune: "ᚱ", element: "wind" },
    { type: "threshold", label: "Threshold", rune: "ᚦ", element: "ice" },
    { type: "emerge", label: "Emerge", rune: "ᛖᛗ", element: "fire" },
    { type: "pulse", label: "Pulse", rune: "ᛈ", element: "lightning" },
  ].map((r, i, arr) => {


    const angle = (i / arr.length) * 2 * Math.PI - Math.PI / 2; // start at top
    const radius = 42; // percent of container
    const x = 50 + radius * Math.cos(angle);
    const y = 50 + radius * Math.sin(angle);
    return { ...r, x, y };
  });

  function selectRitual(type) {
    ritualType = type;
    hasClassified = true;
    steps = ritualPrompts[type].map(s => ({
      ...s,
      response: "",
      tags: [],
      createdTags: [],
      inferredTags: []
    }));
    currentStep = 0;
    stage = "ritual";
  }

  function back() {
    console.log("BACK FIRED — currentStep:", currentStep);
    if (currentStep > 0) currentStep = currentStep - 1;
  }

  // ⭐ FULLY LOGGED NEXT()
    async function next() {
  console.log("NEXT FIRED — currentStep:", currentStep);

  capturedSteps = [...capturedSteps, $state.snapshot(steps[currentStep])];

  if (currentStep >= steps.length - 1) {
    // ...

    console.log("NEXT BLOCKED — at final step");
      return;
    }

    advancing = true;
    console.log("ADVANCING TRUE");

    // Step forward
    currentStep = currentStep + 1;
    console.log("STEP UPDATED — now:", currentStep);

    // Flush render
    await Promise.resolve();
    console.log("FLUSHED");

    advancing = false;
    console.log("ADVANCING FALSE");
  }


  function handleResponseChange(value: string) {
  console.log("RESPONSE CHANGE — step:", currentStep, "value:", value);

  const s = steps[currentStep];
  s.response = String(value);

  if (s.response.trim()) {
    const inferred = inferTagsFromStep(s, availableTags);
    const rejected = rejectedTagIds[s.id] ?? new Set();
    s.inferredTags = structuredClone(
      inferred.filter((t) => !rejected.has(t.tag_id))
    );
  } else {
    s.inferredTags = [];
  }

  console.log("UPDATED STEP:", s);
}

function handleCreatedTags(tag: any) {
  console.log("🏷️ CREATED — currentStep:", currentStep, "hasClassified:", hasClassified);
  console.log("🏷️ CREATED — incoming tag:", tag);
  const s = steps[currentStep];
  const cleanTag = structuredClone(tag);
  const cleanId = cleanTag.tag_id ?? cleanTag._id;
  const alreadyThere = s.tags.find((t) => (t.tag_id ?? t._id) === cleanId);
  console.log("🏷️ CREATED — already attached?", !!alreadyThere, "step.tags before:", $state.snapshot(s.tags));
  if (!alreadyThere) {
    s.tags = [...s.tags, cleanTag];
  }
  console.log("🏷️ CREATED — step.tags after:", $state.snapshot(s.tags));
}

  function handleAcceptTag(tag: any) {
  console.log("ACCEPT TAG:", tag);

  const s = steps[currentStep];
  const cleanTag = structuredClone(tag);

  if (!s.tags.find((t) => t.tag_id === cleanTag.tag_id)) {
    s.tags = [...s.tags, cleanTag];
  }

  // remove from suggestions now that it's been accepted
  // delay removal from suggestions so the flame animation gets to play first
    setTimeout(() => {
      s.inferredTags = s.inferredTags.filter((t) => t.tag_id !== cleanTag.tag_id);
    }, 550);  

  console.log("UPDATED TAGS:", s.tags);
}




  async function offerRitual() {
  console.log("OFFER RITUAL — building fragment");

  const allSteps = steps.map(s => $state.snapshot(s));


  const fragment = structuredClone(buildFragment(allSteps, ritualType));
  // ...

  console.log("FRAGMENT:", fragment);

   try {
      phoenixFragment = await apiFetch(`/rituals/ingest/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fragment)
      });
    } catch (err) {
      console.error("INGEST ERROR:", err.message);
      return;
    }

   closingLine = generateInscription(fragment);
    stage = "closing";
    await invalidateAll(); // refresh dashboard data now that a real fragment exists

    // Reset ritual state so the NEXT ritual returns to selection instead
    // of reusing this one's leftover type/steps.
    hasClassified = false;
    ritualType = undefined;
    currentStep = 0;
    capturedSteps = [];
    steps = structuredClone(ritualSteps);
    stage = "select";

    console.log("RITUAL COMPLETE — fragment:", phoenixFragment);
    console.log("RITUAL STATE RESET FOR NEXT RITUAL");
  

}
</script>

<div class="fire-backdrop">
  <FireParticles />
</div>

<div class="chamber">
  <div class="ember-field"></div>
  <div class="heat-shimmer"></div>
  <div class="rune-ring"></div>

  {#if stage === "select"}

      <div class="ritual-select">
      <h2 class="select-title">Choose your path</h2>
      <div class="stone-circle">
        {#each ritualTypes as r}
                  <button
            type="button"
            class="stone-btn"
            data-element={r.element}
            style="left: {r.x}%; top: {r.y}%;"
            onclick={() => selectRitual(r.type)}
          >
            <span class="stone-rune">{r.rune}</span>
            <span class="stone-label">{r.label}</span>
            <span class="stone-particles"></span>
          </button>

        {/each}
      </div>
    </div>
  {/if}

  {#if stage === "ritual"}
    <div class="step-wrap">
      <Step
        index={currentStep}
        steps={steps}
        advancing={advancing}
        onResponseChange={handleResponseChange}
        onCreatedTags={handleCreatedTags}
        onAcceptTag={handleAcceptTag}

	token={token}
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
        letterDelay={35}
        glowColor="#ff8c42"
      />

      <div class="ritual-summary">
        <h3>Ritual Type</h3>
        <p>{phoenixFragment.ritual_type}</p>

        <h3>Symbolic Anchor</h3>
        <p>{phoenixFragment.fragment.metadata.symbolic_anchor}</p>

        <h3>Tags</h3>
        <ul>
          {#each phoenixFragment.fragment.tags as tag}
            <li>{tag.name}</li>
          {/each}
        </ul>
      </div>
    </div>
  {/if}
</div>

<style>
  .fire-backdrop {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }

  .chamber {
    position: relative;
    z-index: 1;
    max-width: 640px;
    margin: 4rem auto;
    padding: 3rem 2.5rem;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .ember-field,
  .heat-shimmer {
    position: absolute;
    inset: 0;
    z-index: -1;
    pointer-events: none;
  }

    .rune-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 620px;
    height: 620px;
    max-width: 90vw;
    max-height: 90vw;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    border: 2px solid rgba(255, 140, 66, 0.4);
    box-shadow:
      0 0 40px rgba(255, 140, 66, 0.2),
      inset 0 0 40px rgba(255, 140, 66, 0.1);
    animation: rotateRing 24s linear infinite, ringFlicker 2.5s ease-in-out infinite alternate;
    pointer-events: none;
    z-index: -1;
  }

  @keyframes rotateRing {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to   { transform: translate(-50%, -50%) rotate(360deg); }
  }

  @keyframes ringFlicker {
    0% {
      border-color: rgba(255, 140, 66, 0.35);
      box-shadow:
        0 0 30px rgba(255, 100, 30, 0.25),
        inset 0 0 30px rgba(255, 100, 30, 0.1);
    }
    30% {
      border-color: rgba(255, 180, 90, 0.6);
      box-shadow:
        0 0 55px rgba(255, 160, 60, 0.4),
        inset 0 0 45px rgba(255, 140, 66, 0.2);
    }
    55% {
      border-color: rgba(255, 120, 40, 0.45);
      box-shadow:
        0 0 40px rgba(255, 90, 20, 0.3),
        inset 0 0 35px rgba(255, 100, 30, 0.15);
    }
    100% {
      border-color: rgba(255, 200, 120, 0.7);
      box-shadow:
        0 0 60px rgba(255, 180, 90, 0.45),
        inset 0 0 50px rgba(255, 160, 60, 0.25);
    }
  }


  .ritual-select {
    position: relative;
    z-index: 2;
    text-align: center;
  }

  .select-title {
    font-family: var(--phoenix-font, 'Cinzel', serif);
    letter-spacing: 0.1em;
    color: #ffb87a;
    text-transform: uppercase;
    font-size: 1.1rem;
    margin-bottom: 2rem;
  }

    .stone-circle {
    position: relative;
    width: 560px;
    height: 560px;
    max-width: 90vw;
    max-height: 90vw;
    margin: 0 auto;
  }

      .stone-btn {
    position: absolute;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
    width: 120px;
    padding: 1.6rem 0.8rem;
    border-radius: 14px;
    border: 1px solid rgba(255, 140, 66, 0.3);
    background: radial-gradient(circle at 50% 30%, rgba(255, 140, 66, 0.1), rgba(20, 12, 8, 0.6));
    color: #fbeee2;
    cursor: pointer;
    overflow: hidden;
    transition: transform 0.25s ease, box-shadow 0.3s ease, border-color 0.3s ease;
    box-shadow: 0 0 0px rgba(255, 140, 66, 0);
  }

  .stone-btn::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 20%, rgba(255, 180, 120, 0.25), transparent 65%);
    opacity: 0;
    transition: opacity 0.4s ease;
    pointer-events: none;
  }

        .stone-btn:hover {
    border-color: rgba(255, 180, 120, 0.8);
    transform: translate(-50%, -50%) translateY(-5px) scale(1.04);

      box-shadow:
      0 0 24px rgba(255, 140, 66, 0.35),
      inset 0 0 16px rgba(255, 140, 66, 0.15);
  }

  .stone-btn:hover::before {
    opacity: 1;
  }
  


  .stone-rune {
    position: relative;
    font-size: 2rem;
    transition: text-shadow 0.3s ease;
  }

  .stone-btn:hover .stone-rune {
    text-shadow: 0 0 12px #ffb87a, 0 0 24px #ff8c42;
  }
    .stone-particles {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .stone-btn:hover .stone-particles {
    opacity: 1;
  }

  /* FIRE */
  .stone-btn[data-element="fire"]:hover .stone-rune {
    text-shadow: 0 0 10px #ff6a00, 0 0 20px #ff3c00, 0 0 30px #ff2200;
  }

  .stone-btn[data-element="fire"] .stone-particles::before {
    content: "";
    position: absolute;
    top: 30%;
    left: 50%;
    width: 4px;
    height: 4px;
    background: #ffb080;
    border-radius: 50%;
    animation: stoneSparks 0.8s infinite ease-out;
  }

  @keyframes stoneSparks {
    0% { transform: translate(0,0) scale(1); opacity: 1; }
    100% { transform: translate(10px,-24px) scale(0.2); opacity: 0; }
  }

  /* ICE */
  .stone-btn[data-element="ice"]:hover .stone-rune {
    text-shadow: 0 0 12px #a0eaff, 0 0 24px #d0f7ff;
  }

  .stone-btn[data-element="ice"] .stone-particles::before {
    content: "";
    position: absolute;
    top: 30%;
    left: 50%;
    width: 3px;
    height: 3px;
    background: #d0f7ff;
    border-radius: 50%;
    animation: stoneFrost 1.2s infinite ease-in-out;
  }

  @keyframes stoneFrost {
    0% { transform: translate(0,0); opacity: 0.8; }
    100% { transform: translate(-10px,10px); opacity: 0; }
  }

  /* LIGHTNING */
  .stone-btn[data-element="lightning"]:hover .stone-rune {
    text-shadow: 0 0 14px #ffffff, 0 0 28px #e0eaff;
    animation: stoneFlicker 0.15s infinite;
  }

  @keyframes stoneFlicker {
    0% { opacity: 1; }
    50% { opacity: 0.6; }
    100% { opacity: 1; }
  }

  /* WIND */
  .stone-btn[data-element="wind"]:hover .stone-rune {
    text-shadow: 0 0 10px #b0dfff, 0 0 20px #80cfff;
  }

  .stone-btn[data-element="wind"] .stone-particles::before {
    content: "";
    position: absolute;
    top: 30%;
    left: 50%;
    width: 3px;
    height: 3px;
    background: #80cfff;
    border-radius: 50%;
    animation: stoneDrift 1.5s infinite ease-out;
  }

  @keyframes stoneDrift {
    0% { transform: translate(0,0); opacity: 0.7; }
    100% { transform: translate(18px,0); opacity: 0; }
  }

  /* SUN */
  .stone-btn[data-element="sun"]:hover .stone-rune {
    text-shadow: 0 0 12px #fff7b0, 0 0 24px #ffe680;
  }


  .stone-label {
    position: relative;
    font-family: var(--phoenix-font, 'Cinzel', serif);
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    opacity: 0.75;
    transition: opacity 0.3s ease;
  }

  .stone-btn:hover .stone-label {
    opacity: 1;
  }


  .step-wrap {
    position: relative;
    z-index: 2;
  }

  .nav {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .nav-btn,
  .offer {
    font-family: var(--phoenix-font, 'Cinzel', serif);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-size: 0.85rem;
    padding: 0.7rem 1.6rem;
    border-radius: 999px;
    border: 1px solid rgba(255, 140, 66, 0.4);
    background: rgba(255, 140, 66, 0.08);
    color: #fbeee2;
    cursor: pointer;
    box-shadow:
      0 0 10px rgba(255, 140, 66, 0.15),
      inset 0 0 8px rgba(255, 140, 66, 0.1);
    transition: transform 0.15s ease, box-shadow 0.2s ease, background 0.2s ease;
  }

  .nav-btn:hover,
  .offer:hover {
    background: rgba(255, 140, 66, 0.18);
    box-shadow:
      0 0 18px rgba(255, 140, 66, 0.3),
      inset 0 0 12px rgba(255, 140, 66, 0.2);
    transform: scale(1.03);
  }

  .offer {
    border-color: rgba(255, 200, 120, 0.6);
    background: linear-gradient(135deg, rgba(255,140,66,0.18), rgba(255,60,20,0.18));
  }

  .closing {
    position: relative;
    z-index: 2;
    text-align: center;
  }

  .ritual-summary {
    margin-top: 2rem;
    text-align: left;
  }

  .ritual-summary h3 {
    color: #ffb87a;
    font-size: 1rem;
    margin-bottom: 0.2rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .ritual-summary p,
  .ritual-summary ul {
    margin-bottom: 1rem;
    color: #fbeee2;
  }
</style>

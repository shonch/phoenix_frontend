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
  let stage = $state("ritual");
  let closingLine = $state("");
  let phoenixFragment = $state(null);
  let advancing = $state(false);

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

    // ⭐ CLASSIFIER TRIGGER
    // ⭐ CLASSIFIER TRIGGER
    if (!hasClassified) {
      hasClassified = true;
      console.log("CLASSIFIER TRIGGER — using step 0:", steps[0]);
      // ...rest unchanged


    const payload = {
  fragment: {
    metadata: {
      raw_inputs: [
        {
          step: String(steps[0].id),
          label: String(steps[0].label),
          text: String(steps[0].response ?? "")
        }
      ]
    }
  }
};


      console.log("CLASSIFIER PAYLOAD:", payload);

       const res = await fetch(`${PUBLIC_API_URL}/rituals/classify/`, {
       method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      console.log("CLASSIFIER STATUS:", res.status);

      if (!res.ok) {
        console.error("CLASSIFIER ERROR:", await res.text());
        return;
      }

      const data = await res.json();
      console.log("CLASSIFIER RESULT:", data);

      ritualType = String(data.ritual_type);
      console.log("RITUAL TYPE SET:", ritualType);

     const newSteps = ritualPrompts[ritualType].map((s, i) => {
  if (i === 0) {
    return {
      ...s,
      response: $state.snapshot(steps[0]).response,
      tags: $state.snapshot(steps[0]).tags,
      createdTags: $state.snapshot(steps[0]).createdTags,
      inferredTags: []
    };
  }
  return {
    ...s,
    response: "",
    tags: [],
    createdTags: [],
    inferredTags: []
  };
});


      console.log("NEW STEPS BEFORE ASSIGN:", newSteps);

      steps = newSteps;


      console.log("STEPS REPLACED — now:", steps);
    }
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

    console.log("UPDATED TAGS:", s.tags);
  }

  function handleRejectTag(tag: any) {
  console.log("REJECT TAG:", tag);

  const s = steps[currentStep];
  const stepId = s.id;

  if (!rejectedTagIds[stepId]) {
    rejectedTagIds[stepId] = new Set();
  }
  rejectedTagIds[stepId].add(tag.tag_id);

  // remove immediately from the visible suggestions
  s.inferredTags = s.inferredTags.filter((t) => t.tag_id !== tag.tag_id);

  console.log("REJECTED SO FAR for step", stepId, ":", [...rejectedTagIds[stepId]]);
}


  async function offerRitual() {
  console.log("OFFER RITUAL — building fragment");

  const allSteps = steps.map(s => $state.snapshot(s));


  const fragment = structuredClone(buildFragment(allSteps, ritualType));
  // ...

  console.log("FRAGMENT:", fragment);

    const res = await fetch(`${PUBLIC_API_URL}/rituals/ingest/`, {
    method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(fragment)
    });

    console.log("INGEST STATUS:", res.status);

    if (!res.ok) {
      console.error("INGEST ERROR:", await res.text());
      return;
    }

    phoenixFragment = await res.json();
    closingLine = generateInscription(fragment);
    stage = "closing";
    await invalidateAll(); // refresh dashboard data now that a real fragment exists

    // Reset ritual state so the NEXT ritual re-runs classification instead
    // of reusing this one's leftover type/steps. Without this, hasClassified
    // stays true for the rest of the browser session and every subsequent
    // ritual silently skips classification entirely.
    hasClassified = false;
    ritualType = undefined;
    currentStep = 0;
    capturedSteps = [];
    steps = structuredClone(ritualSteps);

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

  {#if stage === "ritual"}
    <div class="step-wrap">
      <Step
        index={currentStep}
        steps={steps}
        advancing={advancing}
        onResponseChange={handleResponseChange}
        onCreatedTags={handleCreatedTags}
        onAcceptTag={handleAcceptTag}
	onRejectTag={handleRejectTag}
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
    border: 2px solid rgba(255, 140, 66, 0.3);
    box-shadow:
      0 0 40px rgba(255, 140, 66, 0.2),
      inset 0 0 40px rgba(255, 140, 66, 0.1);
    animation: rotateRing 24s linear infinite;
    pointer-events: none;
    z-index: -1;
  }

  @keyframes rotateRing {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to   { transform: translate(-50%, -50%) rotate(360deg); }
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

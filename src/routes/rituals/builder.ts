import { get } from 'svelte/store';
import { phoenixState } from '$lib/stateStore';

type PhoenixTag = {
  name: string;
  emoji?: string;
  archetype?: string;
  color?: string;
  category?: string;
  emotional_weight?: number;
  description?: string;
};

type PhoenixStep = {
  id: string | number;
  label?: string;
  prompt?: string;
  response?: string;
  tags?: PhoenixTag[];
  createdTags?: PhoenixTag[];
  inferredTags?: PhoenixTag[];
};

export function buildFragment(steps: PhoenixStep[], ritualType: string = "emotion") {
  // 1. Pull cached Phoenix state (from /state)
  const state = get(phoenixState);
  if (!state) {
    throw new Error("Phoenix state not initialized. Load dashboard first.");
  }

  const raw = state.raw ?? {};
  const allTags: PhoenixTag[] = raw.tags ?? [];

  // 2. Normalize steps
  const cleanSteps = steps.map((s) => ({
    id: String(s.id ?? ""),
    label: String(s.label ?? ""),
    prompt: String(s.prompt ?? ""),
    response: String(s.response ?? ""),
    tags: Array.from(s.tags ?? []),
    createdTags: Array.from(s.createdTags ?? []),
    inferredTags: Array.from(s.inferredTags ?? [])
  }));

  // 3. Infer tags per step using Mongo tag definitions
  const enrichedSteps = cleanSteps.map((step) => {
    const text = (step.response || "").toLowerCase();

    const inferred: PhoenixTag[] = [];

    for (const tag of allTags) {
      const name = tag.name?.toLowerCase() ?? "";
      const desc = tag.description?.toLowerCase() ?? "";
      if (!name && !desc) continue;

      const nameMatch = name && new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(text);
      const descMatch = desc && new RegExp(`\\b${desc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(text);

      if (nameMatch || descMatch) {
        inferred.push(structuredClone(tag));
      }
    }

    return {
      ...step,
      inferredTags: [...step.inferredTags, ...inferred]
    };
  });

  // 4. Build raw_inputs for backend
  const rawInputs = enrichedSteps.map((s) => ({
    step: s.id,
    label: s.label,
    text: s.response
  }));

  // 5. Merge all tag objects (tags + createdTags + inferredTags)
  const mergedTags: PhoenixTag[] = [];

  for (const s of enrichedSteps) {
    for (const t of s.tags) {
      mergedTags.push(structuredClone(t));
    }
    for (const t of s.createdTags) {
      mergedTags.push(structuredClone(t));
    }
  }

  // 6. Symbolic anchor = the user's own answer to the "Symbolic Image" step,
  // verbatim. Not generated, not inferred — literally quoting what they
  // already wrote, since every ritual already asks this question directly.
  const symbolic_anchor = getSymbolicAnchor(enrichedSteps);

  // 7. Final fragment payload (same shape backend expects)
  const fragment = {
    ritual_type: ritualType,
    fragment: {
      metadata: {
        raw_inputs: rawInputs,
        symbolic_anchor
      },
      tags: mergedTags
    }
  };

  return structuredClone(fragment);
}

// Uses the user's own Symbolic Image answer as the anchor, trimmed to a
// reasonable title length. Falls back to "Untitled" only if that step was
// left blank — no generated/guessed text ever substitutes for it.
function getSymbolicAnchor(steps: { id: string; response: string }[]): string {
  const symbolicStep = steps.find((s) => s.id === "symbolic_image");
  const answer = (symbolicStep?.response ?? "").trim();

  if (!answer) return "Untitled";

  const MAX_LEN = 60;
  if (answer.length <= MAX_LEN) return answer;
  return answer.slice(0, MAX_LEN).trim() + "…";
}

export default buildFragment;

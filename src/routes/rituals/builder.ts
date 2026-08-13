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
  const anchors = raw.anchors ?? [];
  const archetypes = raw.archetypes ?? [];

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


  // 6. Generate symbolic anchor from text + archetypes + anchors
  const allResponses = enrichedSteps.map((s) => s.response).join(" ");
  const symbolic_anchor = generateSymbolicAnchor(allResponses, mergedTags, anchors, archetypes);


  // 7. Final fragment payload (same shape backend expects)
  const fragment = {
    ritual_type: ritualType, // now the real classified value, passed in
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

// Simple anchor generator using tags + anchors + text

function generateSymbolicAnchor(
  text: string,
  tags: PhoenixTag[],
  anchors: any[],
  archetypes: any[],
  inferredTags: PhoenixTag[] = []
): string {
  const t = text.toLowerCase().trim();

  if (Array.isArray(anchors)) {
    const match = anchors.find((a: any) => {
      const key = (a.keyword || a.name || "").toLowerCase();
      return key && t.includes(key);
    });
    if (match) return match.name || match.label || "Juniper green";
  }

  if (t) {
    if (t.includes("calm") || t.includes("peace") || t.includes("rest")) return "Soft River Blue";
    if (t.includes("fear") || t.includes("worry") || t.includes("anxious")) return "Ashen Grey";
    if (t.includes("anger") || t.includes("rage") || t.includes("frustration")) return "Molten Ember";
    if (t.includes("hope") || t.includes("light") || t.includes("future")) return "Aurora Gold";
  }

  // Prefer a tag actually inferred from THIS fragment's text over any random
  // tag with an archetype from the full merged pool (which could come from
  // an unrelated step or an old tag with no relevance to this content).
  const relevantMythic = inferredTags.find((tag) => tag.archetype);
  if (relevantMythic) {
    return relevantMythic.name || relevantMythic.archetype || "Juniper green";
  }

  if (!t) return "Quiet Dawn";
  return "Juniper green";
}

export default buildFragment;

import type { RitualStep } from "./types";

export default function buildFragment(steps: RitualStep[]) {
  const timestamp = new Date().toISOString();

  // ⭐ Raw inputs from ALL steps
  const raw_inputs = steps.map((s) => ({
    step: s.id,
    label: s.label,
    text: s.response?.trim() ?? ""
  }));

  // ⭐ Full ritual body (concatenate all responses)
  const full_body = raw_inputs
    .map((r) => `${r.label}: ${r.text}`)
    .join("\n\n");

  // ⭐ Flatten tags
  const accepted_tags = steps.flatMap((s) => s.tags ?? []);
  const created_tags = steps.flatMap((s) => s.createdTags ?? []);
  const inferred_tags = steps.flatMap((s) => s.inferredTags ?? []);

  // ⭐ Extract ritual metadata
  const opening_prompt   = getStep(steps, "opening");
  const clarification    = getStep(steps, "clarification");
  const symbolic_image   = getStep(steps, "symbolic_image");
  const emotional_tone   = getStep(steps, "emotion");
  const threshold        = getStep(steps, "threshold");
  const final_fragment   = getStep(steps, "final_fragment");

  // ⭐ Mode inference
  const mode = inferMode({
    emotional_tone,
    threshold,
    inferred_tags
  });

  // ⭐ Symbolic anchor (image > first tag > fallback)
  const symbolic_anchor =
    symbolic_image ||
    accepted_tags[0]?.name ||
    created_tags[0]?.name ||
    inferred_tags[0]?.name ||
    "unresolved-symbol";

  // ⭐ Threshold type
  const threshold_type = classifyThreshold(threshold);

  // ⭐ Convert accepted tags → Phoenix Tag objects
  const tag_objects = accepted_tags.map((t) => ({
    tag_id: t.tag_id ?? null,
    name: t.name,
    emoji: t.emoji,
    color: t.color,
    archetype: t.archetype,
    visibility: t.visibility ?? "private",
    user_id: t.user_id ?? "system"
  }));

  // ⭐ Final Phoenix Ritual Fragment Object (frontend → backend)
  return {
    module: "ritual",
    layer: "fragment",
    type: "emotional_fragment",

    title: final_fragment || symbolic_anchor,
    subject: symbolic_anchor,

    raw_text: full_body,
    body: final_fragment || full_body,

    tags: tag_objects,

    source: "frontend",
    timestamp,

    metadata: {
      opening_prompt,
      clarification,
      symbolic_image,
      emotional_tone,
      threshold,

      raw_inputs,
      accepted_tags,
      created_tags,
      inferred_tags,

      symbolic_anchor,
      threshold_type,
      emotional_mode: mode
    },

    extra: {},
    version: "phoenixos.v1.1"
  };
}

// ⭐ Helper: get response for a step
function getStep(steps: RitualStep[], id: string): string {
  return steps.find((s) => s.id === id)?.response?.trim() ?? "";
}

// ⭐ Threshold classifier
function classifyThreshold(threshold: string) {
  const t = threshold.toLowerCase();
  if (t.includes("end") || t.includes("leave")) return "release";
  if (t.includes("begin") || t.includes("start")) return "initiation";
  if (t.includes("cross") || t.includes("boundary")) return "threshold";
  return "transition";
}

// ⭐ Emotional mode inference
function inferMode({ emotional_tone, threshold, inferred_tags }) {
  const tone = emotional_tone.toLowerCase();

  if (tone.includes("grief") || tone.includes("loss")) return "grief";
  if (tone.includes("fear") || tone.includes("anxiety")) return "threshold";
  if (tone.includes("awe") || tone.includes("wonder")) return "frisson";

  if (inferred_tags.some((t) => t.type === "grief")) return "grief";
  if (inferred_tags.some((t) => t.type === "threshold")) return "threshold";
  if (inferred_tags.some((t) => t.type === "frisson")) return "frisson";

  if (threshold.toLowerCase().includes("crossing")) return "threshold";

  return "neutral";
}


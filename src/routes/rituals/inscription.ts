export default function generateInscription(fragment: any) {
  const ritualType = fragment.ritual_type || fragment.metadata?.ritual_type || "ritual";

  const {
    symbolic_anchor,
    emotional_mode,
    threshold_type,
    accepted_tags = [],
    created_tags = [],
    inferred_tags = []
  } = fragment.metadata || {};

  const allTags = [
    ...accepted_tags,
    ...created_tags,
    ...inferred_tags
  ].map(t => t.name || t.label).filter(Boolean);

  const seed = chooseSeed(emotional_mode, threshold_type);
  const ritualLine = ritualSummary(ritualType);
  const anchorLine = anchorSummary(symbolic_anchor, emotional_mode, threshold_type);
  const tagLine = tagSummary(allTags);

  return [
    seed,
    ritualLine,
    anchorLine,
    tagLine,
    "The Archive accepts your offering."
  ].filter(Boolean).join(" ");
}


// ⭐ Ritual type → mythic description
function ritualSummary(type: string) {
  const map: Record<string, string> = {
    pulse: "A Pulse Fragment enters the chamber.",
    emotion: "An Emotion Fragment settles into the engine.",
    grind: "A Grind Fragment grinds against the inner stone.",
    anti_grind: "An Anti‑Grind Fragment softens the chamber.",
    detective: "A Detective Fragment reveals a hidden thread.",
    mirror: "A Mirror Fragment reflects what was unseen.",
    emerge: "An Emerge Fragment rises from the depths.",
    threshold: "A Threshold Fragment crosses into the Archive."
  };

  return map[type] || "A Ritual Fragment is offered.";
}


// ⭐ Symbolic anchor + emotional mode + threshold → mythic line
function anchorSummary(anchor: string, mode: string, threshold: string) {
  const parts = [];

  if (anchor) parts.push(`Anchored in ${anchor}`);
  if (mode) parts.push(mode.charAt(0).toUpperCase() + mode.slice(1));
  if (threshold) parts.push(threshold.charAt(0).toUpperCase() + threshold.slice(1));

  return parts.length ? parts.join(", ") + "." : "";
}


// ⭐ Tags → mythic summary
function tagSummary(tags: string[]) {
  if (!tags.length) return "";
  return `Tags carried into the Archive: ${tags.join(", ")}.`;
}


// ⭐ Choose inscription seed based on mode + threshold
function chooseSeed(mode: string, threshold: string) {
  const seeds = {
    grief: [
      "The quiet earth holds your sorrow gently.",
      "A soft wind carries the weight you set down.",
      "The night listens without judgment."
    ],
    threshold: [
      "The doorway widens before you.",
      "Something old exhales; something new inhales.",
      "The path shifts under your feet."
    ],
    frisson: [
      "A spark dances in the unseen air.",
      "Wonder hums beneath the surface.",
      "The world leans closer to hear you."
    ],
    neutral: [
      "The engine hums in quiet acceptance.",
      "The chamber holds your words without hurry.",
      "Stillness gathers around your offering."
    ]
  };

  const pool = seeds[mode] || seeds.neutral;
  return pool[Math.floor(Math.random() * pool.length)];
}


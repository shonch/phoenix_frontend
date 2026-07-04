export default function generateInscription(fragment: any) {
  const { symbolic_anchor, emotional_mode, threshold_type } = fragment.metadata;

  const seed = chooseSeed(emotional_mode, threshold_type);

  return `${seed}  The ${symbolic_anchor || "fragment"} settles into the engine. The offering is complete.`;
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


export function createPhoenixTag({
  name,
  emoji = "🏷️",
  color = "#999999",
  archetype = "unclassified",
  category = "custom",
  visibility = "private",
  description = "",
  user_id = "system"
}) {
  const now = new Date().toISOString();

  return {
    // Mongo ID (temporary on frontend)
    _id: crypto.randomUUID(),

    // Canonical Phoenix ID
    tag_id: crypto.randomUUID(),

    // Core identity fields
    tag_name: name,
    name,
    label: name,

    // Visual + symbolic fields
    emoji,
    color,
    archetype,
    emotional_weight: 0.5,

    // System metadata
    source_system: "phoenix",
    description,
    category,
    visibility,
    user_id,
    user_ids: [],

    // Lifecycle + promotion
    version: 1,
    usage_count: 0,
    times_used: 0,
    promoted: false,
    promotion_score: 0,
    promotion_status: "candidate",
    last_promoted_at: null,


    // Timestamps
    created_at: now
  };
}


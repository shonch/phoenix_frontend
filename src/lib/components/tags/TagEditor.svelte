<script lang="ts">
  import TagBadge from "./TagBadge.svelte";

  const {
    tag,
    onsave,
    oncancel
  } = $props();

  let name = $state(tag.name ?? "");
  let emoji = $state(tag.emoji ?? "🏷️");
  let color = $state(tag.color ?? "#7fffd4");
  let archetype = $state(tag.archetype ?? "");
  let visibility = $state(tag.visibility ?? "private");
  let emotionalWeight = $state(tag.emotional_weight ?? 0.5);

  const colorSwatches = [
    "#7fffd4", "#ff8c42", "#a0eaff", "#c9a6ff",
    "#ffcf70", "#8ab4ff", "#ff6a6a", "#99ff99"
  ];

  const emojiSwatches = [
    "🌀", "🏷️", "🔥", "🌊", "🪞", "🌙", "⚡", "🕵️",
    "🎯", "🗝️", "⭐", "🌑", "🌿", "💠", "🩸", "🦅"
  ];

  function save() {
    const updated = {
      ...tag,
      name,
      emoji,
      color,
      archetype,
      visibility,
      emotional_weight: emotionalWeight
    };

    onsave?.(updated);
  }
</script>

<div class="editor">
  <h3>Edit Tag</h3>

  <TagBadge tag={{
    name,
    emoji,
    color,
    archetype,
    visibility
  }} />

  <div class="field">
    <label>Name</label>
    <input value={name} oninput={(e) => name = e.target.value} />
  </div>

  <div class="field">
    <label>
      Emoji
      <span class="hint">(Mac: ⌘ Ctrl Space, then search)</span>
    </label>
    <div class="emoji-swatches">
      {#each emojiSwatches as e}
        <button
          class="emoji-swatch"
          class:selected={emoji === e}
          onclick={() => emoji = e}
        >{e}</button>
      {/each}
    </div>
    <input value={emoji} oninput={(e) => emoji = e.target.value} placeholder="or type your own" />
  </div>

  <div class="field">
    <label>Color</label>
    <div class="color-swatches">
      {#each colorSwatches as swatch}
        <button
          class="swatch"
          class:selected={color === swatch}
          style={`background:${swatch}`}
          onclick={() => color = swatch}
        ></button>
      {/each}
    </div>
  </div>

  <div class="field">
    <label>What role does this feeling play?</label>
    <input
      value={archetype}
      oninput={(e) => archetype = e.target.value}
      placeholder="e.g. guardian, wanderer, mourner, spark..."
    />
    <span class="hint">Leave blank if nothing comes to mind — you can add it later.</span>
  </div>

  <div class="field">
    <label>Weight — Feather to Stone</label>
    <div class="weight-slider">
      <span class="weight-icon">🪶</span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={emotionalWeight}
        oninput={(e) => emotionalWeight = parseFloat(e.target.value)}
      />
      <span class="weight-icon">🪨</span>
    </div>
  </div>

  <div class="field">
    <label>Visibility</label>
    <select value={visibility} onchange={(e) => visibility = e.target.value}>
      <option value="private">Private</option>
      <option value="public">Public</option>
    </select>
  </div>

  <div class="actions">
    <button class="save" onclick={save}>Save</button>
    <button class="cancel" onclick={oncancel}>Cancel</button>
  </div>
</div>

<style>
  .editor {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    padding: 1rem;
    border-radius: 12px;

    background: rgba(0, 0, 0, 0.45);
    border: 1px solid rgba(127, 255, 212, 0.25);
    backdrop-filter: blur(6px);
    color: #e8fdf6;
  }

  h3 {
    margin: 0;
    font-size: 1.2rem;
    opacity: 0.9;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  label {
    font-size: 0.85rem;
    opacity: 0.8;
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
  }

  .hint {
    font-size: 0.75rem;
    opacity: 0.55;
    font-style: italic;
  }

  input, select {
    padding: 0.5rem 0.7rem;
    border-radius: 8px;
    background: rgba(127, 255, 212, 0.12);
    border: 1px solid rgba(127, 255, 212, 0.35);
    color: #e8fdf6;
    font-size: 1rem;
    backdrop-filter: blur(4px);
  }

  .color-swatches,
  .emoji-swatches {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
  }

  .swatch {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid transparent;
    cursor: pointer;
  }

  .swatch.selected {
    border-color: #fff;
  }

  .emoji-swatch {
    width: 34px;
    height: 34px;
    font-size: 1.2rem;
    border-radius: 8px;
    border: 1px solid rgba(127, 255, 212, 0.2);
    background: rgba(127, 255, 212, 0.08);
    cursor: pointer;
  }

  .emoji-swatch.selected {
    border-color: #7fffd4;
    background: rgba(127, 255, 212, 0.25);
  }

  .weight-slider {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .weight-slider input[type="range"] {
    flex: 1;
    accent-color: #7fffd4;
  }

  .weight-icon {
    font-size: 1.3rem;
    opacity: 0.85;
  }

  .actions {
    display: flex;
    gap: 0.6rem;
    margin-top: 0.5rem;
  }

  .save, .cancel {
    padding: 0.5rem 1.2rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid rgba(127, 255, 212, 0.35);
    background: rgba(127, 255, 212, 0.15);
    color: #e8fdf6;
  }

  .save:hover {
    background: rgba(127, 255, 212, 0.3);
  }

  .cancel:hover {
    background: rgba(255, 127, 127, 0.25);
  }
</style>

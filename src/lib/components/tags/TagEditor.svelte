<script lang="ts">
  import TagBadge from "./TagBadge.svelte";

  const {
    tag,
    onsave,
    oncancel
  } = $props();

  // Local editable state
  let name = $state(tag.name ?? "");
  let emoji = $state(tag.emoji ?? "🏷️");
  let color = $state(tag.color ?? "#7fffd4");
  let archetype = $state(tag.archetype ?? "");
  let visibility = $state(tag.visibility ?? "private");

  function save() {
    const updated = {
      ...tag,
      name,
      emoji,
      color,
      archetype,
      visibility
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
    <label>Emoji</label>
    <input value={emoji} oninput={(e) => emoji = e.target.value} />
  </div>

  <div class="field">
    <label>Color</label>
    <input type="color" value={color} oninput={(e) => color = e.target.value} />
  </div>

  <div class="field">
    <label>Archetype</label>
    <input value={archetype} oninput={(e) => archetype = e.target.value} />
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


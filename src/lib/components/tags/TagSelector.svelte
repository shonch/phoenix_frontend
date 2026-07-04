<script lang="ts">
  import TagChip from "./TagChip.svelte";

  // Props from parent
  const {
    selected = [],
    onselect,
    oncreate,
    placeholder = "Add a tag..."
  } = $props();

  let query = $state("");
  let suggestions = $state([]);
  let loading = $state(false);

  // ⭐ Fetch suggestions from backend
  async function fetchSuggestions(text: string) {
    if (!text.trim()) {
      suggestions = [];
      return;
    }

    loading = true;

    try {
      const res = await fetch(`/api/tags/suggest?query=${encodeURIComponent(text)}`);
      const data = await res.json();
      suggestions = data.tags || [];
    } catch (err) {
      console.error("Tag suggestion error:", err);
    }

    loading = false;
  }

  // ⭐ Handle input typing
  function onInput(e: Event) {
    const target = e.target as HTMLInputElement;
    query = target.value;
    fetchSuggestions(query);
  }

  // ⭐ Select an existing tag
  function selectTag(tag) {
    onselect?.(tag);
    query = "";
    suggestions = [];
  }

  // ⭐ Create a new tag
  async function createTag() {
    if (!query.trim()) return;

    const newTag = {
      tag_id: null,
      name: query.trim(),
      emoji: "🏷️",
      color: "#7fffd4",
      archetype: null,
      visibility: "private",
      user_id: "shon"
    };

    oncreate?.(newTag);

    query = "";
    suggestions = [];
  }
</script>

<div class="selector">
  <!-- Selected tags -->
  <div class="selected">
    {#each selected as tag (tag.tag_id ?? tag.name)}
      <TagChip tag={tag} />
    {/each}
  </div>

  <!-- Input -->
  <input
    class="input"
    value={query}
    placeholder={placeholder}
    oninput={onInput}
  />

  <!-- Suggestions -->
  {#if suggestions.length > 0}
    <div class="suggestions">
      {#each suggestions as tag (tag.tag_id)}
        <div class="suggestion" onclick={() => selectTag(tag)}>
          {tag.emoji ?? "🏷️"} {tag.name}
        </div>
      {/each}

      <!-- Create new tag option -->
      <div class="suggestion create" onclick={createTag}>
        ➕ Create “{query}”
      </div>
    </div>
  {/if}
</div>

<style>
  .selector {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    width: 100%;
  }

  .selected {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .input {
    width: 100%;
    padding: 0.6rem 0.8rem;
    border-radius: 8px;
    background: rgba(127, 255, 212, 0.12);
    border: 1px solid rgba(127, 255, 212, 0.35);
    color: #e8fdf6;
    font-size: 1rem;
    backdrop-filter: blur(4px);
  }

  .suggestions {
    background: rgba(0, 0, 0, 0.45);
    border: 1px solid rgba(127, 255, 212, 0.25);
    border-radius: 8px;
    padding: 0.4rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    backdrop-filter: blur(6px);
  }

  .suggestion {
    padding: 0.4rem 0.6rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .suggestion:hover {
    background: rgba(127, 255, 212, 0.2);
  }

  .create {
    opacity: 0.8;
    font-style: italic;
  }
</style>


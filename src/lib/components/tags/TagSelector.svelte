
<script lang="ts">
  import TagChip from "./TagChip.svelte";
  import TagEditor from "./TagEditor.svelte";
  import { createPhoenixTag } from "../../../routes/rituals/TagFactory";
  import { apiFetch } from "$lib/api";

  const {
    selected = [],
    onselect,
    oncreate,
    placeholder = "Add a tag...",
    token = ""
  } = $props();

  const safeSelected = $derived(() => {
    if (!selected) return [];
    try {
      return Array.from(selected);
    } catch {
      return [];
    }
  });

  let query = $state("");
  let suggestions = $state([]);
  let loading = $state(false);
  let editingTag = $state(null);

  const safeSuggestions = $derived(() => {
    if (!suggestions) return [];
    try {
      return Array.from(suggestions);
    } catch {
      return [];
    }
  });

   async function fetchSuggestions(text: string) {
    if (!text.trim()) {
      suggestions = [];
      return;
    }

    loading = true;

    try {
      const data = await apiFetch(`/tags/suggest?query=${encodeURIComponent(text)}`);
      suggestions = Array.isArray(data.tags) ? data.tags : [];
    } catch (err) {
      console.error("Tag suggestion error:", err);
      suggestions = [];
    }

    loading = false;
}

function onInput(e: Event) {
    const target = e.target as HTMLInputElement;
    query = target.value;
    fetchSuggestions(query);
  }

  function selectTag(tag) {
    onselect?.(tag);
    query = "";
    suggestions = [];
  }

  // ⭐ Instead of creating the tag immediately, open the editor
  // with a properly-shaped blank tag for the user to refine.
  function startCreateTag() {
    if (!query.trim()) return;

    editingTag = createPhoenixTag({
      name: query.trim()
    });

    suggestions = [];
  }

  async function handleEditorSave(updatedTag: any) {
    try {
      const savedTag = await apiFetch("/tags/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTag)
      });

      oncreate?.(savedTag);
    } catch (err) {
      console.error("Tag create error:", err);
    } finally {
      editingTag = null;
      query = "";
    }
  }

  function handleEditorCancel() {
    editingTag = null;
  }
</script>

<div class="selector">
  <div class="selected">
    {#each safeSelected as tag (tag.tag_id ?? tag.name)}
      <TagChip tag={tag} />
    {/each}
  </div>

  {#if editingTag}
    <TagEditor
      tag={editingTag}
      onsave={handleEditorSave}
      oncancel={handleEditorCancel}
    />
  {:else}
    <input
      class="input"
      value={query}
      placeholder={placeholder}
      oninput={onInput}
    />

    {#if safeSuggestions.length > 0 || query.trim()}
      <div class="suggestions">
        {#each safeSuggestions as tag (tag.tag_id ?? tag.name)}
          <div class="suggestion" onclick={() => selectTag(tag)}>
            {String(tag.emoji ?? "🏷️")} {String(tag.name)}
          </div>
        {/each}

        {#if query.trim()}
          <div class="suggestion create" onclick={startCreateTag}>
            ➕ Create "{query}"
          </div>
        {/if}
      </div>
    {/if}
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

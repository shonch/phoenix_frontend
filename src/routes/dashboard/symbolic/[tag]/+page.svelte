<script lang="ts">
  import { goto } from "$app/navigation";
  import TagBadge from "$lib/components/tags/TagBadge.svelte";
  import TagEditor from "$lib/components/tags/TagEditor.svelte";

  const { data } = $props();

  let editing = $state(false);

  function backToSymbolic() {
    goto("/dashboard/symbolic");
  }

  function handleSave(updatedTag) {
    // TODO: wire to a real update endpoint once one exists
    console.log("Would save:", updatedTag);
    editing = false;
  }
</script>

<div class="tag-detail">
  <button class="back-btn" onclick={backToSymbolic}>← Back to Symbolic</button>

  {#if !data.tag}
    <p class="empty">Tag "{data.tagName}" not found.</p>
  {:else if editing}
    <TagEditor
      tag={data.tag}
      onsave={handleSave}
      oncancel={() => editing = false}
    />
  {:else}
    <TagBadge tag={data.tag} />

    <div class="detail-fields">
      <p><strong>Name:</strong> {data.tag.name ?? data.tag.tag_name}</p>
      <p><strong>Archetype:</strong> {data.tag.archetype ?? "—"}</p>
      <p><strong>Emotional Weight:</strong> {data.tag.emotional_weight ?? "unset"}</p>
      <p><strong>Category:</strong> {data.tag.category ?? "—"}</p>
      <p><strong>Visibility:</strong> {data.tag.visibility ?? "—"}</p>
      <p><strong>Times Used:</strong> {data.tag.usage_count ?? data.tag.times_used ?? 0}</p>
      <p><strong>Promotion Status:</strong> {data.tag.promotion_status ?? "—"}</p>
    </div>

    <button class="edit-btn" onclick={() => editing = true}>Edit Tag</button>
  {/if}
</div>

<style>
  .tag-detail {
    padding: 2rem;
    max-width: 600px;
    margin: 0 auto;
    color: #dce7f5;
  }

  .back-btn {
    background: none;
    border: 1px solid rgba(200, 200, 255, 0.25);
    color: inherit;
    padding: 0.4rem 0.9rem;
    border-radius: 8px;
    cursor: pointer;
    margin-bottom: 1.5rem;
  }

  .detail-fields {
    margin-top: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .edit-btn {
    margin-top: 1.5rem;
    padding: 0.5rem 1.2rem;
    border-radius: 8px;
    cursor: pointer;
    border: 1px solid rgba(127, 255, 212, 0.35);
    background: rgba(127, 255, 212, 0.15);
    color: inherit;
  }

  .empty {
    opacity: 0.6;
    font-style: italic;
  }
</style>

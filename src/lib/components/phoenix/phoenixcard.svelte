<script lang="ts">
  import TagChip from "$lib/components/tags/TagChip.svelte";

  // UnifiedFragment from the formatter
  const { fragment } = $props();

  const {
    id,
    title,
    preview,
    tags,
    createdAt,
    emotionalMode,
    symbolicAnchor,
    threshold
  } = fragment;
</script>

<div class="card">
  <div class="header">
    <h2 class="title">{title}</h2>
    <div class="meta">
      {#if emotionalMode}
        <span class="pill mode">{emotionalMode}</span>
      {/if}

      {#if symbolicAnchor}
        <span class="pill symbol">{symbolicAnchor}</span>
      {/if}

      {#if threshold}
        <span class="pill threshold">{threshold}</span>
      {/if}
    </div>
  </div>

  <div class="preview">
    {preview}
  </div>

  {#if tags.length > 0}
    <div class="tags">
      {#each tags as tag}
        <TagChip tag={tag} />
      {/each}
    </div>
  {/if}

  <div class="footer">
    <span class="timestamp">{createdAt}</span>
  </div>
</div>

<style>
  .card {
    padding: 1rem;
    border-radius: 12px;
    background: rgba(0,0,0,0.45);
    border: 1px solid rgba(127,255,212,0.25);
    backdrop-filter: blur(6px);
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .card:hover {
    background: rgba(0,0,0,0.55);
    border-color: rgba(127,255,212,0.45);
  }

  .title {
    margin: 0;
    font-size: 1.2rem;
    color: #e8fdf6;
  }

  .meta {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
  }

  .pill {
    padding: 0.2rem 0.5rem;
    border-radius: 6px;
    font-size: 0.75rem;
    opacity: 0.85;
    border: 1px solid rgba(127,255,212,0.35);
  }

  .preview {
    opacity: 0.9;
    font-size: 0.95rem;
    line-height: 1.4;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .footer {
    font-size: 0.75rem;
    opacity: 0.6;
  }
</style>


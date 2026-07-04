<script lang="ts">
  import TagBadge from "$lib/components/tags/TagBadge.svelte";

  // UnifiedFragment from the formatter
  const { fragment } = $props();

  const {
    title,
    html,
    tags,
    createdAt,
    emotionalMode,
    symbolicAnchor,
    threshold,
    raw
  } = fragment;

  let showRaw = $state(false);
</script>

<div class="detail">
  <h1 class="title">{title}</h1>

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

    <span class="timestamp">{createdAt}</span>
  </div>

  {#if tags.length > 0}
    <div class="tags">
      {#each tags as tag}
        <TagBadge tag={tag} />
      {/each}
    </div>
  {/if}

  <div class="content" {@html html}></div>

  <button class="raw-toggle" onclick={() => showRaw = !showRaw}>
    {showRaw ? "Hide Raw JSON" : "Show Raw JSON"}
  </button>

  {#if showRaw}
    <pre class="raw">{JSON.stringify(raw, null, 2)}</pre>
  {/if}
</div>

<style>
  .detail {
    padding: 2rem;
    max-width: 800px;
    margin: 0 auto;
    color: #e8fdf6;
  }

  .title {
    margin: 0 0 1rem 0;
    font-size: 2rem;
  }

  .meta {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }

  .pill {
    padding: 0.25rem 0.6rem;
    border-radius: 6px;
    font-size: 0.8rem;
    border: 1px solid rgba(127,255,212,0.35);
    opacity: 0.85;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-bottom: 1.5rem;
  }

  .content {
    line-height: 1.6;
    font-size: 1.05rem;
    margin-bottom: 2rem;
  }

  .raw-toggle {
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
    background: rgba(127,255,212,0.15);
    border: 1px solid rgba(127,255,212,0.35);
    color: #e8fdf6;
    cursor: pointer;
    margin-bottom: 1rem;
  }

  .raw {
    background: rgba(0,0,0,0.35);
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 0.85rem;
  }
</style>


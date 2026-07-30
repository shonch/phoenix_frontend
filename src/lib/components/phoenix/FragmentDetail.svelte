<script lang="ts">
  import TagBadge from "$lib/components/tags/TagBadge.svelte";
  import { goto } from "$app/navigation";

  const { fragment } = $props();

  const {
    title,
    tags,
    createdAt,
    emotionalMode,
    symbolicAnchor,
    threshold,
    raw
  } = fragment;

  const rawInputs = raw?.metadata?.raw_inputs ?? [];

  let showRaw = $state(false);
</script>

<div class="detail">
  <button class="back-btn" onclick={() => goto('/dashboard/fragments')}>← Back to Fragments</button>

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

  {#if rawInputs.length > 0}
    <div class="steps">
      {#each rawInputs as input}
        <div class="step-block">
          <h3 class="step-label">{input.label}</h3>
          <p class="step-text">{input.text}</p>
        </div>
      {/each}
    </div>
  {/if}

  <button class="raw-toggle" onclick={() => showRaw = !showRaw}>
    {showRaw ? "Hide Raw JSON" : "Show Raw JSON"}
  </button>

  {#if showRaw}
    <pre class="raw">{JSON.stringify(raw, null, 2)}</pre>
  {/if}
</div>

<style>
  /* existing styles unchanged, plus: */
  .back-btn {
    background: none;
    border: 1px solid rgba(127,255,212,0.35);
    color: #e8fdf6;
    padding: 0.4rem 0.9rem;
    border-radius: 8px;
    cursor: pointer;
    margin-bottom: 1.5rem;
  }
  .back-btn:hover {
    border-color: #7fffd4;
  }

  .steps {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .step-block {
    border-left: 2px solid rgba(127,255,212,0.3);
    padding-left: 1rem;
  }

  .step-label {
    margin: 0 0 0.25rem 0;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #7fffd4;
    opacity: 0.8;
  }

  .step-text {
    margin: 0;
    font-size: 1.05rem;
    line-height: 1.5;
  }
</style>

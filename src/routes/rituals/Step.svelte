<script lang="ts">
  import StoneText from "$lib/components/StoneText.svelte";
  import StoneTextarea from "$lib/components/StoneTextarea.svelte";
  import FloatingTags from "./FloatingTags.svelte";
  import AcceptedTags from "./AcceptedTags.svelte";
  import TagSelector from "$lib/components/tags/TagSelector.svelte";

  const {
    index,
    steps,
    advancing,
    onResponseChange,
    onCreatedTags,
    onAcceptTag,
    onRejectTag
  } = $props();

  // ⭐ Recompute whenever index or steps changes
  const safeStep = $derived.by(() => {
    const rawStep = steps[index] ?? {};
    return {
      id: String(rawStep.id ?? ""),
      label: String(rawStep.label ?? ""),
      prompt: String(rawStep.prompt ?? ""),
      response: String(rawStep.response ?? ""),
      tags: Array.from(rawStep.tags ?? []),
      createdTags: Array.from(rawStep.createdTags ?? []),
      inferredTags: Array.from(rawStep.inferredTags ?? [])
    };
  });

  function handleInput(v: string) {
    onResponseChange(String(v));
  }

  function handleAcceptTag(tag: any) {
    onAcceptTag(structuredClone(tag));
  }

  function handleRejectTag(tag: any) {
  onRejectTag($state.snapshot(tag));
}

  function handleCreatedTags(tags: any[]) {
    onCreatedTags(structuredClone(tags));
  }
</script>

<div class="step-root active">
  <div class="step-header">
    <h2 class="step-label">{safeStep.label}</h2>
    <div class="step-meta">{advancing ? "Advancing…" : ""}</div>
  </div>

  <div class="prompt-wrap">
    <StoneText text={safeStep.prompt} />
  </div>

  {#if safeStep.inferredTags.length > 0}
    <FloatingTags
      suggestions={safeStep.inferredTags}
      accept={handleAcceptTag}
      reject={handleRejectTag}
    />
  {/if}

  <StoneTextarea
    value={safeStep.response}
    onInput={handleInput}
  />

  <AcceptedTags tags={safeStep.tags} />

  <TagSelector
    selected={safeStep.createdTags}
    onselect={handleAcceptTag}
    oncreate={handleCreatedTags}
  />
</div>

<style>
  /* unchanged */
</style>

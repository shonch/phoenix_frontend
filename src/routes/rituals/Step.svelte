<script lang="ts">
  const { index, steps, advancing, onResponseChange } = $props();

  // Local reactive step reference
  let step = $state(steps[index]);

  // Keep step synced with parent steps array
  $effect(() => {
    step = steps[index];
  });

  function onInput(e: Event) {
    const v = (e.target as HTMLTextAreaElement).value;

    // Update local reactive step
    step.response = v;

    // Update parent steps array
    onResponseChange(v);
  }
</script>

<div class="step-root">
  <div class="step-header">
    <h2 class="step-label">{step.label}</h2>
    <div class="step-meta">{advancing ? "Advancing…" : ""}</div>
  </div>

  <p class="step-prompt">{step.prompt}</p>

  <textarea
    class="step-text"
    rows="6"
    value={step.response}
    oninput={onInput}
    placeholder="Write your fragment here..."
  ></textarea>

  <div class="step-tags">
    <small>
      tags:
      {step.tags.map(t => t.name ?? t).join(", ")}
    </small>
  </div>
</div>


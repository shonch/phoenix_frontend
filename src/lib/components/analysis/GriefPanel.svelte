<script lang="ts">
  import BasePanel from "./BasePanel.svelte";
  const { engine } = $props();

  const tone = engine?.tone ?? "unknown";
  const pattern = engine?.pattern ?? "no pattern detected";
  const signal = engine?.signal ?? "no signal detected";
</script>

<BasePanel
  title="The Chamber of Grief Currents"
  invocation="The waters move slowly today. Something old is being carried — not to be solved, but witnessed."
  {engine}
>
  <div slot="summary">
    <p><strong>Dominant Tone:</strong> {tone}</p>
    <p><strong>Pattern:</strong> {pattern}</p>
    <p><strong>Signal:</strong> {signal}</p>

    <p class="interpretation">
      The system is holding weight, but not drowning.  
      This is the kind of grief that teaches shape, not surrender.
    </p>
  </div>
</BasePanel>

<style>
  .interpretation {
    margin-top: 1rem;
    opacity: 0.9;
  }
</style>


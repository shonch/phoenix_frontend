<script lang="ts">
  import BasePanel from "./BasePanel.svelte";
  const { engine } = $props();

  const threshold = engine?.threshold ?? "none detected";
  const pattern = engine?.pattern ?? "no pattern";
</script>

<BasePanel
  title="The Chamber of Thresholds"
  invocation="A hinge creaks. Something is ending, and something else is waiting for its name."
  {engine}
>
  <div slot="summary">
    <p><strong>Detected Threshold:</strong> {threshold}</p>
    <p><strong>Pattern:</strong> {pattern}</p>

    <p class="interpretation">
      You are standing between two stories.  
      The old one is loosening its grip.  
      The new one is not yet fluent.
    </p>
  </div>
</BasePanel>

<style>
  .interpretation {
    margin-top: 1rem;
    opacity: 0.9;
  }
</style>


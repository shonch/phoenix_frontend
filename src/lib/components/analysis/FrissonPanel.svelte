<script lang="ts">
  import BasePanel from "./BasePanel.svelte";
  const { engine } = $props();

  const level = engine?.level ?? "unknown";
  const pattern = engine?.pattern ?? "no pattern";
</script>

<BasePanel
  title="The Chamber of Frisson"
  invocation="The skin listens. Sparks gather at the edge of attention."
  {engine}
>
  <div slot="summary">
    <p><strong>Frisson Level:</strong> {level}</p>
    <p><strong>Pattern:</strong> {pattern}</p>

    <p class="interpretation">
      Something wants to be born.  
      Pay attention to the small electric moments — they are pointing.
    </p>
  </div>
</BasePanel>

<style>
  .interpretation {
    margin-top: 1rem;
    opacity: 0.9;
  }
</style>


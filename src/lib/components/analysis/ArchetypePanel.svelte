<script lang="ts">
  import BasePanel from "./BasePanel.svelte";
  const { engine } = $props();

  const dominant = engine?.dominant ?? "none";
  const supporting = engine?.supporting ?? [];
</script>

<BasePanel
  title="The Chamber of Archetypes"
  invocation="Old patterns stir. The myth beneath the moment reveals its shape."
  {engine}
>
  <div slot="summary">
    <p><strong>Dominant Archetype:</strong> {dominant}</p>
    <p><strong>Supporting:</strong> {supporting.join(", ")}</p>

    <p class="interpretation">
      Archetypes are not roles — they are gravitational pulls.  
      This is the one shaping your current horizon.
    </p>
  </div>
</BasePanel>


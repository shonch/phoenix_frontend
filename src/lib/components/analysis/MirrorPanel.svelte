<script lang="ts">
  import BasePanel from "./BasePanel.svelte";
  const { engine } = $props();

  const reflection = engine?.reflection ?? "no reflection detected";
  const shadow = engine?.shadow ?? "no shadow detected";
</script>

<BasePanel
  title="The Chamber of Mirrors"
  invocation="The self looks back. Not as it was, but as it is becoming."
  {engine}
>
  <div slot="summary">
    <p><strong>Reflection:</strong> {reflection}</p>
    <p><strong>Shadow:</strong> {shadow}</p>

    <p class="interpretation">
      Identity is not fixed; it ripples.  
      What you see here is not judgment — it is orientation.
    </p>
  </div>
</BasePanel>


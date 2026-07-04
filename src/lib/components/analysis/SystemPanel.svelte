<script lang="ts">
  import BasePanel from "./BasePanel.svelte";
  const { engine } = $props();

  const status = engine?.status ?? "unknown";
  const load = engine?.load ?? "normal";
</script>

<BasePanel
  title="The Chamber of the System"
  invocation="The engine hums. The architecture breathes."
  {engine}
>
  <div slot="summary">
    <p><strong>Status:</strong> {status}</p>
    <p><strong>Load:</strong> {load}</p>

    <p class="interpretation">
      The system is stable.  
      The work continues beneath the surface.
    </p>
  </div>
</BasePanel>


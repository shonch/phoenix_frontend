<script>
  import GriefPanel from "$lib/components/analysis/GriefPanel.svelte";
  const { data } = $props();
  const engine = data?.engine ?? {};
</script>

<GriefPanel engine={engine} />


<script>
  import FrissonPanel from "$lib/components/analysis/FrissonPanel.svelte";
  const { data } = $props();
  const engine = data?.engine ?? {};
</script>

<FrissonPanel engine={engine} />


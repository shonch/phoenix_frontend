<script>
  import ThresholdPanel from "$lib/components/analysis/ThresholdPanel.svelte";
  const { data } = $props();
  const engine = data?.engine ?? {};
</script>

<ThresholdPanel engine={engine} />


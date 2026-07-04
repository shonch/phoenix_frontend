<script>
  import SystemPanel from "$lib/components/analysis/SystemPanel.svelte";
  const { data } = $props();
  const engine = data?.engine ?? {};
</script>

<SystemPanel engine={engine} />


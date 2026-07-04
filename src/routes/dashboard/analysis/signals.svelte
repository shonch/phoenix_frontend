<script>
  import SignalPanel from "$lib/components/analysis/SignalPanel.svelte";
  const { data } = $props();
  const engine = data?.engine ?? {};
</script>

<SignalPanel engine={engine} />


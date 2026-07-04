<script>
  import MirrorPanel from "$lib/components/analysis/MirrorPanel.svelte";
  const { data } = $props();
  const engine = data?.engine ?? {};
</script>

<MirrorPanel engine={engine} />


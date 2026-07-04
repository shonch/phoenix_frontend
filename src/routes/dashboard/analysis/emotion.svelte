<script>
  import ArchetypePanel from "$lib/components/analysis/ArchetypePanel.svelte";
  const { data } = $props();
  const engine = data?.engine ?? {};
</script>

<ArchetypePanel engine={engine} />


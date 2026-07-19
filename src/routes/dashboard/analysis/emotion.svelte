<script>
  import EmotionFrequencyPanel from "$lib/components/analysis/EmotionFrequencyPanel.svelte";
  const { data } = $props();
  const engine = data?.engine ?? {};
</script>

<EmotionFrequencyPanel {engine} />

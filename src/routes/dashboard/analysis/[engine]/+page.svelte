<script>
    import AnalysisPanel from '$lib/AnalysisPanel.svelte';

    import GrindEngine from '$lib/engines/grind.svelte';
    import GriefEngine from '$lib/engines/grief.svelte';
    import ThresholdEngine from '$lib/engines/thresholds.svelte';
    import SignalsEngine from '$lib/engines/signals.svelte';
    import MirrorEngine from '$lib/engines/mirror.svelte';

    // NEW ENGINES
    import FrissonEngine from '$lib/engines/frisson.svelte';
    import EmotionEngine from '$lib/engines/emotion.svelte';
    import DetectiveEngine from '$lib/engines/detective.svelte';

    const { data } = $props();

    const name = $derived(data.name);
    const engine = $derived(data.engine);
</script>

{#key name}
    {#if name === 'grind'}
        <GrindEngine data={engine} />

    {:else if name === 'grief'}
        <GriefEngine data={engine} />

    {:else if name === 'thresholds'}
        <ThresholdEngine data={engine} />

    {:else if name === 'signals'}
        <SignalsEngine data={engine} />

    {:else if name === 'mirror'}
        <MirrorEngine data={engine} />

    {:else if name === 'frisson'}
        <FrissonEngine data={engine} />

    {:else if name === 'emotion'}
        <EmotionEngine data={engine} />

    {:else if name === 'detective'}
        <DetectiveEngine data={engine} />

    {:else}
        <AnalysisPanel
            title={name}
            summary="No custom UI yet"
            details={engine}
        />
    {/if}
{/key}


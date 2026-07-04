<script lang="ts">
    import FragmentCodex from '$lib/components/codex/FragmentCodex.svelte';
    import { formatFragmentList } from '$lib/formatters/phoenixFormatter';

    // Get everything passed from +page.js
    const props = $props();

    // 🔍 Inspect what SvelteKit actually passed
    console.log("PAGE RAW PROPS:", props);
    console.log("PROPS KEYS:", Object.keys(props));

    // SvelteKit page components ALWAYS receive loader output under `data`
    const data = props.data ?? {};

    console.log("DATA:", data);
    console.log("DATA.fragments:", data.fragments);

    // Make data reactive
    const reactiveData = $state(data);

    // Derived fragments
    const fragments = $derived(() => {
        const input = reactiveData.fragments ?? [];
        console.log("FRAGMENTS INPUT:", input);

        const output = formatFragmentList(input);
        console.log("FRAGMENTS OUTPUT:", output);

        return output;
    });
</script>

<h1 class="page-title">Fragments Codex</h1>

{#each fragments() as frag}
    <FragmentCodex fragment={frag} />
{/each}


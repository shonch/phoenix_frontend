<script lang="ts">
    import FragmentDetail from "$lib/components/phoenix/FragmentDetail.svelte";
    import { formatFragment } from "$lib/formatters/phoenixFormatter";

    const { data } = $props();

    const fragment = $derived(() =>
        formatFragment(data.fragment)
    );
</script>

<FragmentDetail fragment={$fragment} />


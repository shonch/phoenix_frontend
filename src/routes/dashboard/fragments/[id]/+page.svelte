<script lang="ts">
    import FragmentDetail from "$lib/components/phoenix/FragmentDetail.svelte";
    import { formatFragment } from "$lib/formatters/phoenixFormatter";

    const { data } = $props();

    const fragment = data.fragment ? formatFragment(data.fragment) : null;
</script>

{#if fragment}
    <FragmentDetail fragment={fragment} />
{:else}
    <p class="not-found">Fragment not found.</p>
{/if}

<style>
    .not-found {
        margin-top: 2rem;
        color: #999;
        text-align: center;
    }
</style>

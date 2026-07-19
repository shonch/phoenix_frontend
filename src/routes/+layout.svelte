<script lang="ts">
  import RunicNav from "$lib/components/navigation/RunicNav.svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";

  const current = $derived($page.url.pathname);
  const hideSidebar = $derived(current.startsWith("/rituals"));
  const isIngest = $derived(hideSidebar);
</script>

<style src="./+layout.css"></style>

<div
  class="mode-rune"
  role="button"
  tabindex="0"
  onclick={() => goto(isIngest ? '/dashboard' : '/rituals')}
>
  {#if isIngest}
    ᚠ
  {:else}
    ᚦ
  {/if}
</div>

<div class="layout">
  {#if !hideSidebar}
    <RunicNav />
  {/if}

  <main>
    <slot />
  </main>
</div>

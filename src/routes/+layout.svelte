<script lang="ts">
  import RunicNav from "$lib/components/navigation/RunicNav.svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { apiFetch } from "$lib/api";

  const current = $derived($page.url.pathname);
  const hideSidebar = $derived(current.startsWith("/rituals"));
  const isIngest = $derived(hideSidebar);

  let showAccountPanel = $state(false);
  let recoveryCode = $state(null);
  let generatingCode = $state(false);
  let recoveryError = $state("");

  async function handleGenerateCode() {
    generatingCode = true;
    recoveryError = "";
    try {
      const data = await apiFetch("/auth/generate-recovery-code", { method: "POST" });
      recoveryCode = data.recovery_code;
    } catch (e) {
      recoveryError = e.message;
    } finally {
      generatingCode = false;
    }
  }
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

<div
  class="account-rune"
  role="button"
  tabindex="0"
  onclick={() => showAccountPanel = !showAccountPanel}
>
  ᛝ
</div>

{#if showAccountPanel}
  <div class="account-panel">
    <button type="button" class="close-btn" onclick={() => showAccountPanel = false}>✕</button>
    <h3>Account</h3>

    {#if recoveryCode}
      <p class="recovery-warning">Save this now — it won't be shown again.</p>
      <p class="recovery-code">{recoveryCode}</p>
    {:else}
      <button type="button" onclick={handleGenerateCode} disabled={generatingCode}>
        {generatingCode ? "Generating..." : "Generate Recovery Code"}
      </button>
      {#if recoveryError}<p class="recovery-error">{recoveryError}</p>{/if}
    {/if}
  </div>
{/if}

<div class="layout">
  {#if !hideSidebar}
    <RunicNav />
  {/if}

  <main class:with-nav={!hideSidebar}>
    <slot />
  </main>
</div>

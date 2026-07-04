<script lang="ts">
  import BasePanel from "./BasePanel.svelte";
  const { engine } = $props();

  const alerts = engine?.alerts ?? [];
</script>

<BasePanel
  title="The Chamber of Signals"
  invocation="The system whispers. Some signals are faint; others insist."
  {engine}
>
  <div slot="summary">
    {#if alerts.length === 0}
      <p>No active signals.</p>
    {:else}
      <ul>
        {#each alerts as a}
          <li>{a}</li>
        {/each}
      </ul>
    {/if}

    <p class="interpretation">
      Signals are not warnings — they are invitations to attention.
    </p>
  </div>
</BasePanel>


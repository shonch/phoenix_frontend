<script lang="ts">
  const { title, invocation, engine } = $props();
  let showRaw = $state(false);
</script>

<div class="panel">
  <h2 class="title">{title}</h2>
  <p class="invocation">{invocation}</p>

  <slot name="summary" />

  <button class="raw-toggle" onclick={() => showRaw = !showRaw}>
    {showRaw ? "Hide Engine Output" : "Show Engine Output"}
  </button>

  {#if showRaw}
    <pre class="raw">{JSON.stringify(engine, null, 2)}</pre>
  {/if}
</div>

<style>
  .panel {
    padding: 1.5rem;
    border-radius: 12px;
    background: rgba(0,0,0,0.45);
    border: 1px solid rgba(127,255,212,0.25);
    margin-bottom: 2rem;
  }
  .title {
    margin: 0 0 0.5rem 0;
    font-size: 1.4rem;
    color: #7fffd4;
  }
  .invocation {
    opacity: 0.85;
    margin-bottom: 1rem;
    font-style: italic;
  }
  .raw-toggle {
    margin-top: 1rem;
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
    background: rgba(127,255,212,0.15);
    border: 1px solid rgba(127,255,212,0.35);
    color: #e8fdf6;
    cursor: pointer;
  }
  .raw {
    margin-top: 1rem;
    background: rgba(0,0,0,0.35);
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
  }
</style>


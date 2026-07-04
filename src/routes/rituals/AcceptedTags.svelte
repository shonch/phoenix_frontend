<script lang="ts">
  // Svelte 5 props
  const { tags } = $props();
</script>

<div class="accepted-container">
  {#each tags as tag (tag.id)}
    <span class="chip">{tag.name}</span>
  {/each}
</div>

<style>
  .accepted-container {
    margin-top: 1rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
  }

  .chip {
    background: rgba(127, 255, 212, 0.15);
    border: 1px solid rgba(127, 255, 212, 0.35);
    padding: 0.35rem 0.9rem;
    border-radius: 12px;
    font-size: 0.9rem;
    color: #e8fdf6;
    backdrop-filter: blur(4px);
    transition: all 0.2s ease;
    cursor: default;
  }

  .chip:hover {
    background: rgba(127, 255, 212, 0.25);
    transform: translateY(-1px);
  }
</style>


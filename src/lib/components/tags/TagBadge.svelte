<script lang="ts">
  const { tag } = $props();
</script>

<div
  class="badge"
  style={`--tag-color:${tag.color ?? "#7fffd4"}`}
>
  <div class="emoji">{tag.emoji ?? "🏷️"}</div>

  <div class="info">
    <div class="name">{tag.name}</div>

    {#if tag.archetype}
      <div class="archetype">{tag.archetype}</div>
    {/if}
  </div>
</div>

<style>
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;

    padding: 0.45rem 0.9rem;
    border-radius: 12px;

    background: rgba(127, 255, 212, 0.12);
    border: 1px solid rgba(127, 255, 212, 0.35);

    color: #e8fdf6;
    font-size: 0.95rem;

    backdrop-filter: blur(4px);
    transition: all 0.25s ease;
  }

  .badge:hover {
    background: rgba(127, 255, 212, 0.22);
    transform: translateY(-1px);
  }

  .emoji {
    font-size: 1.3rem;
    line-height: 1;
  }

  .info {
    display: flex;
    flex-direction: column;
    line-height: 1.1;
  }

  .name {
    font-weight: 600;
    font-size: 0.95rem;
  }

  .archetype {
    font-size: 0.75rem;
    opacity: 0.75;
  }
</style>


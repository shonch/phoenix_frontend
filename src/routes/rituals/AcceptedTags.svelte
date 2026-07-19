<script lang="ts">
  const { tags } = $props();

  // ⭐ Proxy‑safe unwrap
  const safeTags = $derived(() => {
    if (!tags) return [];
    try {
      return Array.from(tags);
    } catch {
      return [];
    }
  });
</script>

<div class="accepted-container">
  {#each safeTags as tag (tag.id)}
    <span class="rune-chip">
      {String(tag.name)}
    </span>
  {/each}
</div>

<style>
  .accepted-container {
    margin-top: 1.4rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.7rem;
    justify-content: center;
    padding: 0.6rem;
    border-top: 1px solid rgba(255, 140, 66, 0.25);
    border-bottom: 1px solid rgba(255, 140, 66, 0.25);
    backdrop-filter: blur(4px);
  }

  .rune-chip {
    padding: 0.45rem 1rem;
    font-size: 0.95rem;
    color: #fbeee2;
    background: rgba(20, 10, 6, 0.55);
    border: 1px solid rgba(255, 140, 66, 0.35);
    border-radius: 14px;
    box-shadow:
      inset 0 0 10px rgba(255, 140, 66, 0.25),
      0 0 10px rgba(255, 140, 66, 0.35);
    animation:
      runePulse 3.2s ease-in-out infinite alternate,
      emberShimmer 6s ease-in-out infinite;
    backdrop-filter: blur(3px);
    transition: all 0.25s ease;
  }

  .rune-chip:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow:
      inset 0 0 14px rgba(255, 140, 66, 0.35),
      0 0 14px rgba(255, 140, 66, 0.55);
  }

  @keyframes runePulse {
    from {
      box-shadow:
        inset 0 0 8px rgba(255, 140, 66, 0.25),
        0 0 8px rgba(255, 140, 66, 0.25);
    }
    to {
      box-shadow:
        inset 0 0 14px rgba(255, 140, 66, 0.35),
        0 0 14px rgba(255, 140, 66, 0.45);
    }
  }

  @keyframes emberShimmer {
    0%   { opacity: 0.92; }
    50%  { opacity: 1; }
    100% { opacity: 0.92; }
  }
</style>


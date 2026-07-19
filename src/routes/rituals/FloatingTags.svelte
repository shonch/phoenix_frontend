<script lang="ts">
  const { suggestions, accept, reject } = $props();

  // ⭐ Proxy‑safe unwrap
  const safeSuggestions = $derived.by(() => {
    if (!suggestions) return [];
    try {
      return Array.from(suggestions);
    } catch {
      return [];
    }
  });

  let seeds = $state([]);

  $effect(() => {
    seeds = safeSuggestions.map(() => Math.random());
  });
</script>

<div class="floating-container">
  {#each safeSuggestions as tag, i (tag.tag_id)}
    <div
      class="ember-tag"
      style={`
        --seed:${seeds[i]};
        --x:${(seeds[i] * 60 + 20).toFixed(2)}%;
        --delay:${(seeds[i] * .4).toFixed(2)}s;
      `}
    >
      <span class="tag-label" onclick={() => accept(tag)}>
        {String(tag.name ?? tag.tag_name)}
      </span>
      <span class="tag-reject" onclick={() => reject(tag)}>✕</span>
    </div>
  {/each}
</div>

<style>
  .floating-container {
    position: relative;
    width: 100%;
    height: 160px;
    pointer-events: none;
    overflow: hidden;
    margin-top: 1rem;
  }

  .ember-tag {
    position: absolute;
    left: var(--x);
    top: 140%;
    transform: translateX(-50%);
    padding: 0.35rem 0.5rem 0.35rem 0.9rem;
    background: rgba(255, 140, 66, 0.18);
    border: 1px solid rgba(255, 140, 66, 0.35);
    border-radius: 14px;
    color: #fbeee2;
    font-size: 0.9rem;
    pointer-events: auto;
    backdrop-filter: blur(4px);
    opacity: 0.9;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    animation:
  emberRise 3s ease-out forwards,
  emberPulse 2.8s ease-in-out infinite alternate;

animation-delay: var(--delay);


    box-shadow:
      0 0 6px rgba(255, 140, 66, 0.35),
      inset 0 0 6px rgba(255, 140, 66, 0.25);

    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }

  .tag-label {
    cursor: pointer;
  }

  .tag-reject {
    cursor: pointer;
    opacity: 0.6;
    font-size: 0.75rem;
    padding: 0 0.15rem;
  }

  .tag-reject:hover {
    opacity: 1;
    color: #ff6666;
  }

  @keyframes emberRise {
    0% {
      transform: translateX(-50%) translateY(0);
      opacity: 0.9;
    }
    100% {
      transform: translateX(calc(-50% + (var(--seed) * 40px - 20px)))
                 translateY(-260px);
      opacity: 0.9;
    }
  }

  @keyframes emberPulse {
    from {
      box-shadow:
        0 0 6px rgba(255, 140, 66, 0.25),
        inset 0 0 6px rgba(255, 140, 66, 0.15);
    }
    to {
      box-shadow:
        0 0 12px rgba(255, 140, 66, 0.45),
        inset 0 0 12px rgba(255, 140, 66, 0.25);
    }
  }
</style>

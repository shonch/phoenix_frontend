<script lang="ts">
  const { suggestions, accept } = $props();

  const safeSuggestions = $derived.by(() => {
    if (!suggestions) return [];
    try {
      return Array.from(suggestions);
    } catch {
      return [];
    }
  });

  let seeds = $state(new Map());       // tag_id -> random seed, assigned once
  let positions = $state(new Map());   // tag_id -> {x, y}, assigned once
  let caught = $state(new Set());

  $effect(() => {
    // Assign a seed/position only to NEW tags — never touch existing ones
    for (const tag of safeSuggestions) {
      if (!seeds.has(tag.tag_id)) {
        seeds.set(tag.tag_id, Math.random());
      }
    }
  });

  function getPosition(tag) {
    if (positions.has(tag.tag_id)) {
      return positions.get(tag.tag_id);
    }
    // First time seeing this tag — pick a free-ish random spot once, permanently
    const seed = seeds.get(tag.tag_id) ?? Math.random();
    const x = seed * 70 + 15;               // 15%–85% horizontal
    const y = ((seed * 7) % 1) * 70 + 15;    // pseudo-independent vertical spread
    const pos = { x, y };
    positions.set(tag.tag_id, pos);
    return pos;
  }

  function handleAccept(tag) {
    if (caught.has(tag.tag_id)) return;
    caught.add(tag.tag_id);
    caught = new Set(caught);
    accept(tag);
  }
</script>

<div class="floating-container">
  {#each safeSuggestions as tag (tag.tag_id)}
    {@const pos = getPosition(tag)}
    {@const seed = seeds.get(tag.tag_id) ?? 0}
    <div
      class="ember-tag"
      class:caught={caught.has(tag.tag_id)}
      style={`
        --x:${pos.x.toFixed(2)}%;
        --y:${pos.y.toFixed(2)}%;
        --delay:${(seed * .8).toFixed(2)}s;
      `}
      onclick={() => handleAccept(tag)}
    >
      <span class="tag-label">
        {String(tag.name ?? tag.tag_name)}
      </span>
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
    top: var(--y);
    transform: translate(-50%, -50%);
    padding: 0.35rem 0.9rem;
    background: rgba(255, 140, 66, 0.18);
    border: 1px solid rgba(255, 140, 66, 0.35);
    border-radius: 14px;
    color: #fbeee2;
    font-size: 0.9rem;
    pointer-events: auto;
    backdrop-filter: blur(4px);
    cursor: pointer;
    display: flex;
    align-items: center;
    will-change: opacity, filter;

    animation: emberPulse 2.8s ease-in-out infinite alternate;
    animation-delay: var(--delay);

    filter: drop-shadow(0 0 6px rgba(255, 140, 66, 0.35));
    transition: background 0.3s ease, border-color 0.3s ease, transform 0.15s ease;
  }

  .ember-tag:hover {
    transform: translate(-50%, -50%) scale(1.04);
  }

  .ember-tag.caught {
    background: rgba(255, 200, 80, 0.28);
    border-color: rgba(255, 215, 120, 0.75);
    cursor: default;
    animation: emberFlare 0.5s ease-out forwards, emberGlowSteady 2.4s ease-in-out 0.5s infinite alternate;
  }

  @keyframes emberPulse {
    from { opacity: 0.85; filter: drop-shadow(0 0 5px rgba(255, 140, 66, 0.3)); }
    to   { opacity: 1;    filter: drop-shadow(0 0 11px rgba(255, 140, 66, 0.5)); }
  }

  @keyframes emberFlare {
    0%   { transform: translate(-50%, -50%) scale(1);    filter: drop-shadow(0 0 6px rgba(255, 200, 80, 0.35)); }
    40%  { transform: translate(-50%, -50%) scale(1.15); filter: drop-shadow(0 0 20px rgba(255, 215, 120, 0.85)); }
    100% { transform: translate(-50%, -50%) scale(1);    filter: drop-shadow(0 0 13px rgba(255, 215, 120, 0.55)); }
  }

  @keyframes emberGlowSteady {
    from { filter: drop-shadow(0 0 9px rgba(255, 200, 80, 0.35)); }
    to   { filter: drop-shadow(0 0 15px rgba(255, 215, 120, 0.55)); }
  }
</style>

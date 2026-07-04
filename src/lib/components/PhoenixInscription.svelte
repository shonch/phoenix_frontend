<script lang="ts">
  import { tick } from "svelte";

  // Runes Mode props
  const { text, letterDelay = 60, glowColor = "#7fffd4" } = $props();

  // Reactive state
  let displayed = $state("");
  let index = $state(0);
  let chars = $state<string[]>([]);

  // Keep chars synced with displayed text
  $effect(() => {
    chars = displayed.split("");
  });

  // Reset + animate whenever text changes
  $effect(async () => {
    // Reset state
    displayed = "";
    index = 0;

    // If no text, do nothing
    if (!text || text.length === 0) return;

    // Wait for DOM to settle
    await tick();

    // Start animation
    animate();
  });

  function animate() {
    if (index < text.length) {
      displayed = displayed + text[index];
      index = index + 1;

      // Schedule next frame
      setTimeout(animate, letterDelay);
    }
  }
</script>

<div class="inscription">
  {#each chars as char}
    <span class="glyph" style={`--glow:${glowColor};`}>
      {char === " " ? "\u00A0" : char}
    </span>
  {/each}
</div>

<style>
  .inscription {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    font-size: 1.4rem;
    color: #eafff5;
  }

  .glyph {
    display: inline-block;
    animation: glow 1.2s ease-in-out infinite alternate;
  }

  @keyframes glow {
    from { text-shadow: 0 0 4px var(--glow); }
    to   { text-shadow: 0 0 12px var(--glow); }
  }
</style>


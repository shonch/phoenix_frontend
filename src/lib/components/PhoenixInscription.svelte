<script lang="ts">
  import { tick } from "svelte";

  const { text, letterDelay = 60, glowColor = "#7fffd4" } = $props();

  let displayed = $state("");
  let index = $state(0);

  const words = $derived(displayed.split(" "));

  $effect(async () => {
    displayed = "";
    index = 0;

    if (!text || text.length === 0) return;

    await tick();
    animate();
  });

  function animate() {
    if (index < text.length) {
      displayed = displayed + text[index];
      index = index + 1;
      setTimeout(animate, letterDelay);
    }
  }
</script>

<div class="inscription">{#each words as word, wi}<span class="word">{#each word.split("") as char}<span class="glyph" style={`--glow:${glowColor};`}>{char}</span>{/each}</span>{#if wi < words.length - 1}<span class="glyph">&nbsp;</span>{/if}{/each}</div>

<style>
  .inscription {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    font-size: 1.4rem;
    color: #eafff5;
  }

  .word {
    display: inline-block;
    white-space: nowrap;
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

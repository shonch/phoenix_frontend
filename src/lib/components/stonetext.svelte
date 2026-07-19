<script lang="ts">
  const { text } = $props();

  // Make it a plain string, not a signal/function
  const safeText = $derived(String(text ?? ""));

  let anim = $state("idle");

  $effect(() => {
    anim = "entering";
    setTimeout(() => {
      anim = "active";
    }, 450);
  });
</script>

<div class={`stone-text ${anim}`}>
  {#if safeText}
    {#each safeText.split("") as char, i}
      <span class="glyph" style={`--i:${i};`}>
        {char === " " ? "\u00A0" : char}
      </span>
    {/each}
  {/if}
</div>

<style>
  .stone-text {
    display: inline-block;
    font-size: 1.35rem;
    letter-spacing: 0.04em;
    color: #fbeee2;
    text-shadow: 0 0 4px rgba(255, 140, 66, 0.4);
    opacity: 1;
    transform: none;
  }

  .stone-text.active {
    animation: pulseGlow 3s ease-in-out infinite;
  }

  @keyframes pulseGlow {
    0% {
      text-shadow:
        0 0 6px rgba(255, 140, 66, 0.35),
        0 0 12px rgba(255, 140, 66, 0.15);
    }
    100% {
      text-shadow:
        0 0 10px rgba(255, 140, 66, 0.55),
        0 0 18px rgba(255, 140, 66, 0.35);
    }
  }

  .glyph {
    display: inline-block;
    animation: emberGlow 2.4s ease-in-out infinite alternate;
    animation-delay: calc(var(--i) * 12ms);
  }

  @keyframes emberGlow {
    from {
      opacity: 0.92;
      transform: translateY(0);
    }
    to {
      opacity: 1;
      transform: translateY(-1px);
    }
  }
</style>


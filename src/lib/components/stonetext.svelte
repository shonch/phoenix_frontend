<script lang="ts">
  const { text } = $props();

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
    {#key safeText}
      {#each safeText.split("") as char, i}
        <span class="glyph" style={`--i:${i};`}>
          {char === " " ? "\u00A0" : char}
        </span>
      {/each}
    {/key}
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
    opacity: 0;
    animation:
      writeIn 0.4s ease-out forwards,
      emberGlow 2.4s ease-in-out infinite alternate;
    animation-delay: calc(var(--i) * 45ms), calc(var(--i) * 45ms + 0.4s);
  }

  @keyframes writeIn {
    from {
      opacity: 0;
      filter: blur(3px);
      transform: translateY(3px);
    }
    to {
      opacity: 0.92;
      filter: blur(0);
      transform: translateY(0);
    }
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

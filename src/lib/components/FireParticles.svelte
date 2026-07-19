<script lang="ts">
  // No props needed — this is a passive ambient layer
  let anim = $state("idle");

  // Entrance animation
  $effect(() => {
    anim = "entering";
    setTimeout(() => {
      anim = "active";
    }, 450);
  });
</script>

<div class={`fire-particles ${anim}`}>
  <!-- Layer 1: slow embers -->
  <div class="layer layer1"></div>

  <!-- Layer 2: medium drift -->
  <div class="layer layer2"></div>

  <!-- Layer 3: fine ember dust -->
  <div class="layer layer3"></div>
</div>

<style>
  .fire-particles {
    pointer-events: none;
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 0.45s ease-out;
    z-index: -1;
  }

  .fire-particles.entering {
    opacity: 0.35;
  }

  .fire-particles.active {
    opacity: 0.45;
    animation: pulse 3.2s ease-in-out infinite alternate;
  }

  @keyframes pulse {
    from { opacity: 0.35; }
    to   { opacity: 0.45; }
  }

  /* 🔥 Ember Layers */
  .layer {
    position: absolute;
    inset: 0;
    background-repeat: repeat;
    mix-blend-mode: screen;
  }

  /* Layer 1 — slow, large embers */
  .layer1 {
    background-image: radial-gradient(rgba(255, 140, 66, 0.25) 3px, transparent 3px);
    background-size: 8px 8px;
    animation: drift1 22s linear infinite;
    opacity: 0.25;
  }

  @keyframes drift1 {
    from { transform: translateY(0); }
    to   { transform: translateY(-160px); }
  }

  /* Layer 2 — medium embers */
  .layer2 {
    background-image: radial-gradient(rgba(255, 140, 66, 0.18) 2px, transparent 2px);
    background-size: 6px 6px;
    animation: drift2 16s linear infinite;
    opacity: 0.22;
  }

  @keyframes drift2 {
    from { transform: translateY(0); }
    to   { transform: translateY(-120px); }
  }

  /* Layer 3 — fine ember dust */
  .layer3 {
    background-image: radial-gradient(rgba(255, 140, 66, 0.12) 1px, transparent 1px);
    background-size: 4px 4px;
    animation: drift3 12s linear infinite;
    opacity: 0.18;
  }

  @keyframes drift3 {
    from { transform: translateY(0); }
    to   { transform: translateY(-80px); }
  }
</style>


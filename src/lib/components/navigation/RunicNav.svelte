<script>
  const runes = [
    { rune: "ᚠ", label: "Rituals", href: "/rituals", element: "fire" },
    { rune: "ᚱ", label: "Fragments", href: "/dashboard/fragments", element: "wind" },
    { rune: "ᚨ", label: "Analysis", href: "/dashboard/analysis", element: "lightning" },

    { rune: "ᛟ", label: "Symbolic", href: "/dashboard/symbolic", element: "ice" },
    { rune: "ᛞ", label: "System", href: "/dashboard/system", element: "sun" }
  ];
</script>

<nav class="runic-nav">
  {#each runes as r}
    <a class="rune" href={r.href} data-element={r.element}>
      <span class="glyph">{r.rune}</span>
      <span class="label">{r.label}</span>
      <span class="particles"></span>
    </a>
  {/each}
</nav>

<style>
  .runic-nav {
    position: fixed;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 1.4rem;
    z-index: 2000;
  }

  .rune {
    position: relative;
    font-size: 2.2rem;
    text-decoration: none;
    color: #7fffd4;
    opacity: 0.65;
    transition: opacity 0.25s, transform 0.25s;
  }

  .rune:hover {
    opacity: 1;
    transform: scale(1.2);
  }

  .glyph {
    display: inline-block;
    transition: text-shadow 0.25s ease;
  }

  .label {
  position: absolute;
  left: 3.2rem; /* move slightly closer to the rune */
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.55);
  padding: 0.35rem 0.7rem;
  border-radius: 6px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s, transform 0.25s;
  white-space: nowrap;
  color: #e8fdf6;
  font-size: 0.9rem;
  font-family: 'Cinzel Decorative', 'Trajan Pro', serif;
  text-shadow: 0 0 6px #7ffcff;
}

.rune:hover .label {
  opacity: 1;
  transform: translateY(-50%) scale(1.05);
}

  .rune:hover .label {
    opacity: 1;
  }

  /* PARTICLE EFFECTS */
  .particles {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .rune:hover .particles {
    opacity: 1;
  }

  /* FIRE */
  .rune[data-element="fire"]:hover .glyph {
    text-shadow: 0 0 8px #ff6a00, 0 0 16px #ff3c00, 0 0 24px #ff2200;
  }

  .rune[data-element="fire"] .particles::before {
    content: "";
    position: absolute;
    width: 4px;
    height: 4px;
    background: #ffb080;
    border-radius: 50%;
    animation: sparks 0.8s infinite ease-out;
  }

  @keyframes sparks {
    0% { transform: translate(0,0) scale(1); opacity: 1; }
    100% { transform: translate(10px,-20px) scale(0.2); opacity: 0; }
  }

  /* ICE */
  .rune[data-element="ice"]:hover .glyph {
    text-shadow: 0 0 10px #a0eaff, 0 0 20px #d0f7ff;
  }

  .rune[data-element="ice"] .particles::before {
    content: "";
    position: absolute;
    width: 3px;
    height: 3px;
    background: #d0f7ff;
    border-radius: 50%;
    animation: frost 1.2s infinite ease-in-out;
  }

  @keyframes frost {
    0% { transform: translate(0,0); opacity: 0.8; }
    100% { transform: translate(-8px,8px); opacity: 0; }
  }

  /* LIGHTNING */
  .rune[data-element="lightning"]:hover .glyph {
    text-shadow: 0 0 12px #ffffff, 0 0 24px #e0eaff;
    animation: flicker 0.15s infinite;
  }

  @keyframes flicker {
    0% { opacity: 1; }
    50% { opacity: 0.6; }
    100% { opacity: 1; }
  }

  /* WIND */
  .rune[data-element="wind"]:hover .glyph {
    text-shadow: 0 0 8px #b0dfff, 0 0 16px #80cfff;
  }

  .rune[data-element="wind"] .particles::before {
    content: "";
    position: absolute;
    width: 3px;
    height: 3px;
    background: #80cfff;
    border-radius: 50%;
    animation: drift 1.5s infinite ease-out;
  }

  @keyframes drift {
    0% { transform: translate(0,0); opacity: 0.7; }
    100% { transform: translate(15px,0); opacity: 0; }
  }

  /* EMBER */
  .rune[data-element="ember"]:hover .glyph {
    text-shadow: 0 0 8px #ff8050, 0 0 16px #ff5020;
    animation: pulse 1.2s infinite ease-in-out;
  }

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.08); }
    100% { transform: scale(1); }
  }

  /* SUN */
  .rune[data-element="sun"]:hover .glyph {
    text-shadow: 0 0 10px #fff7b0, 0 0 20px #ffe680;
  }
</style>


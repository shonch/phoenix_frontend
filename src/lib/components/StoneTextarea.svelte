<script lang="ts">
  const { value, onInput } = $props();

  let focused = $state(false);
  let anim = $state("idle");
  let textareaEl: HTMLTextAreaElement;
  $effect(() => {
    anim = "entering";
    setTimeout(() => {
      anim = "active";
    }, 450);
  });


  $effect(() => {
  if (textareaEl && textareaEl.value !== value) {
    textareaEl.value = value;
  }
});
  function handleInput(e: Event) {
    const v = (e.target as HTMLTextAreaElement).value;
    onInput(v);
  }
</script>

<div class={`stone-textarea ${anim} ${focused ? "focused" : ""}`}>
  <textarea
    class="inner"
    rows="6"
    bind:this={textareaEl}
    value={value}
    oninput={handleInput}
    onfocus={() => (focused = true)}
    onblur={() => (focused = false)}
    placeholder="Carve your fragment into the stone..."
  ></textarea>

  <div class="ember-dust"></div>
</div>

<style>
  .stone-textarea {
    position: relative;
    opacity: 1;
    transform: none;
    transition: box-shadow 0.45s ease-out;
  }

  .stone-textarea.entering {
    /* no opacity/transform changes */
  }

  .stone-textarea.active {
    animation: pulseGlow 3.2s ease-in-out infinite;
  }

  @keyframes pulseGlow {
    0% {
      box-shadow:
        inset 0 0 10px rgba(255, 140, 66, 0.25),
        0 0 10px rgba(255, 140, 66, 0.25);
    }
    100% {
      box-shadow:
        inset 0 0 16px rgba(255, 140, 66, 0.35),
        0 0 16px rgba(255, 140, 66, 0.45);
    }
  }

  .inner {
    width: 100%;
    padding: 1rem;
    font-size: 1rem;
    background: rgba(20, 10, 6, 0.55);
    border: 1px solid rgba(255, 140, 66, 0.35);
    border-radius: 14px;
    color: #fbeee2;
    resize: none;
    outline: none;
    box-shadow:
      inset 0 0 12px rgba(255, 140, 66, 0.25),
      0 0 8px rgba(255, 140, 66, 0.25);
    transition: all 0.25s ease;
    backdrop-filter: blur(4px);
  }

  .stone-textarea.focused .inner {
    background: rgba(20, 10, 6, 0.65);
    box-shadow:
      inset 0 0 18px rgba(255, 140, 66, 0.35),
      0 0 14px rgba(255, 140, 66, 0.45);
    transform: translateY(-2px);
  }

  .ember-dust {
    pointer-events: none;
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(rgba(255, 140, 66, 0.25) 2px, transparent 2px),
      radial-gradient(rgba(255, 140, 66, 0.15) 1px, transparent 1px);
    background-size: 4px 4px, 6px 6px;
    opacity: 0.15;
    animation: dust 6s ease-in-out infinite;
  }

  @keyframes dust {
    0%   { opacity: 0.12; transform: translateY(0); }
    50%  { opacity: 0.22; transform: translateY(-6px); }
    100% { opacity: 0.12; transform: translateY(0); }
  }
</style>


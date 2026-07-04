<script lang="ts">
  import PhoenixInscription from "$lib/components/PhoenixInscription.svelte";

  // Opening runes (randomized)
  const openingRunes = [
    "The quiet places are awake. What stirs in you?",
    "Come closer. Tell me what’s moving in your chest.",
    "The circle is open. What truth arrives first?",
    "The stones are warm tonight. What weight are you carrying?",
    "I’m here. What’s rising to the surface?",
    "The air shifts. Speak the first shape of your feeling.",
    "Something is knocking inside you. What does it want you to notice?",
    "Your pulse is telling a story. Begin it.",
    "The engine hums. Offer the first fragment.",
    "The stones are listening. What wants to be spoken?"
  ];

  // Pick one at random
  let opening = openingRunes[Math.floor(Math.random() * openingRunes.length)];

  // User input
  let fragment = "";
  let stage: "opening" | "tags" | "archetype" | "closing" = "opening";

  // Closing ritual seeds
  const carmina = [
    "Deep peace of the flowing air to you.",
    "Deep peace of the quiet earth to you.",
    "Deep peace of the shining stars to you.",
    "Deep peace of the gentle night to you.",
    "Deep peace of the running wave to you.",
    "Deep peace of the warm sun to you."
  ];

  const edda = [
    "Wisdom is welcome wherever it comes from.",
    "The mind alone knows what dwells near the heart.",
    "A gift always looks for a gift in return.",
    "The cautious guest leaves no trail.",
    "The unwise man thinks he will live forever."
  ];

  const mabinogion = [
    "And the world was new.",
    "There was a great stillness.",
    "Between the worlds they walked.",
    "And no one knew what would come next.",
    "The path opened before them."
  ];

  function randomClosingSeed() {
    const pools = [carmina, edda, mabinogion];
    const pool = pools[Math.floor(Math.random() * pools.length)];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  let closingSeed = "";
  let closingLine = "";

  function offerFragment() {
    // For now, skip classifier → go straight to closing ritual
    closingSeed = randomClosingSeed();
    closingLine = `${closingSeed}  The engine hums softly. The offering is complete.`;
    stage = "closing";
  }
</script>

<div class="chamber">
  <div class="mist"></div>

  {#if stage === "opening"}
    <PhoenixInscription text={opening} letterDelay={140} glowColor="#7fffd4" />

    <textarea
      bind:value={fragment}
      class="input"
      placeholder="Offer your fragment..."
    ></textarea>

    <button class="offer" onclick={offerFragment}>
      Offer
    </button>
  {/if}

  {#if stage === "closing"}
    <div class="closing">
      <PhoenixInscription
        text={closingLine}
        letterDelay={120}
        glowColor="#7fffd4"
      />
    </div>
  {/if}
</div>

<style>
  .chamber {
    position: fixed;
    inset: 0;
    background: radial-gradient(
        circle at center,
        rgba(60, 80, 70, 0.25),
        rgba(20, 20, 20, 0.95)
      ),
      url("/textures/granite-dark.jpg");
    background-size: cover;
    background-blend-mode: overlay;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    color: #e8fdf6;
    overflow: hidden;
  }

  .mist {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 40%;
    background: radial-gradient(
      ellipse at bottom,
      rgba(200, 255, 240, 0.12),
      transparent 70%
    );
    filter: blur(40px);
    animation: drift 18s ease-in-out infinite alternate;
  }

  @keyframes drift {
    0% { transform: translateY(0) translateX(-10px); opacity: 0.4; }
    100% { transform: translateY(-20px) translateX(10px); opacity: 0.7; }
  }

  .input {
    margin-top: 2rem;
    width: 60%;
    height: 6rem;
    background: rgba(0, 0, 0, 0.35);
    border: 1px solid rgba(127, 255, 212, 0.25);
    border-radius: 8px;
    padding: 1rem;
    color: #e8fdf6;
    font-size: 1.2rem;
    resize: none;
    backdrop-filter: blur(6px);
  }

  .offer {
    margin-top: 1.5rem;
    padding: 0.8rem 2rem;
    background: rgba(127, 255, 212, 0.2);
    border: 1px solid rgba(127, 255, 212, 0.4);
    border-radius: 6px;
    color: #e8fdf6;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .offer:hover {
    background: rgba(127, 255, 212, 0.35);
    transform: translateY(-2px);
  }

  .closing {
    margin-top: 2rem;
    max-width: 70%;
    text-align: center;
  }
</style>


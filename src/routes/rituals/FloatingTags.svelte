<script lang="ts">
  // Svelte 5 props
  const { suggestions, accept } = $props();
</script>

<div class="floating-container">
  {#each suggestions as tag (tag.id)}
    <div
      class="tag"
      onclick={() => accept(tag)}
      style={`left: ${Math.random() * 60 + 20}%;`}
    >
      {tag.name}
    </div>
  {/each}
</div>

<style>
  .floating-container {
    position: relative;
    width: 100%;
    height: 0;
    pointer-events: none;
  }

  .tag {
    position: absolute;
    top: 0;
    padding: 0.3rem 0.8rem;
    background: rgba(127, 255, 212, 0.15);
    border: 1px solid rgba(127, 255, 212, 0.35);
    border-radius: 12px;
    color: #e8fdf6;
    font-size: 0.9rem;
    cursor: pointer;
    pointer-events: auto;
    opacity: 0.9;
    animation: drift 3.2s ease-out forwards;
    backdrop-filter: blur(4px);
  }

  @keyframes drift {
    0% {
      transform: translateY(0) scale(1);
      opacity: 0.95;
    }
    40% {
      transform: translateY(-20px) scale(1.05);
      opacity: 1;
    }
    100% {
      transform: translateY(-50px) scale(0.95);
      opacity: 0;
    }
  }
</style>


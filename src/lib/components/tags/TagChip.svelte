<script lang="ts">
  const { tag } = $props();
</script>

<span
  class="chip"
  style={`--tag-color:${tag.color ?? "#7fffd4"}`}
>
  <span class="emoji">{tag.emoji ?? "🏷️"}</span>
  <span class="label">{tag.name}</span>
</span>

<style>
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;

    padding: 0.25rem 0.6rem;
    border-radius: 10px;

    background: rgba(127, 255, 212, 0.12);
    border: 1px solid rgba(127, 255, 212, 0.35);

    color: #e8fdf6;
    font-size: 0.85rem;

    backdrop-filter: blur(4px);
    transition: all 0.2s ease;
  }

  .chip:hover {
    background: rgba(127, 255, 212, 0.22);
    transform: translateY(-1px);
  }

  .emoji {
    font-size: 1rem;
  }

  .label {
    white-space: nowrap;
  }
</style>


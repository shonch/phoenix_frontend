<script>
    const { title = "", data = {} } = $props();

    const formattedJson = JSON.stringify(data, null, 4);
</script>

<div class="codex-title">
    <span class="dropcap">ᚠ</span>&nbsp;<span class="collection-name">{title}</span>
</div>


<div class="codex-separator">⋯ ✧ ⋯</div>

<div class="parchment-card">
    <pre class="codex-json">
{formattedJson}
    </pre>
</div>

<style>

.codex-title {
    font-family: 'EB Garamond', serif;
    font-size: 1.35rem;
    margin-bottom: 0.25rem;
    color: #f9f6e8; /* pale rune glow */
    text-shadow:
        0 0 2px rgba(255, 255, 255, 0.6),
        0 0 6px rgba(255, 255, 255, 0.4),
        0 0 12px rgba(255, 255, 255, 0.25);
    filter: contrast(1.3) brightness(1.15);
}

.dropcap {
    font-size: 1.9rem;
    padding-right: 6px;
    color: #f9f6e8;
    text-shadow:
        0 0 3px rgba(255, 255, 255, 0.7),
        0 0 8px rgba(255, 255, 255, 0.5),
        0 0 16px rgba(255, 255, 255, 0.3);
}

.collection-name {
    color: #f9f6e8;
    text-shadow:
        0 0 2px rgba(255, 255, 255, 0.6),
        0 0 6px rgba(255, 255, 255, 0.4),
        0 0 12px rgba(255, 255, 255, 0.25);
    filter: contrast(1.3) brightness(1.15);
}


.codex-separator {
    text-align: center;
    margin: 0.5rem 0 0.75rem;
    opacity: 0.5;
    font-family: 'EB Garamond', serif;
    font-size: 1.1rem;
}

/* LOCAL parchment card — no global dependency */
.parchment-card {
    background: #f7f0e5;
    border-radius: 8px;
    padding: 1rem 1.25rem;
    border: 1px solid rgba(80, 60, 40, 0.35);
    box-shadow:
        0 0 8px rgba(0, 0, 0, 0.15),
        inset 0 0 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 1.5rem;
}


.codex-json {
    font-family: 'IM Fell English', 'Crimson Text', serif;
    font-size: 1rem;
    color: #1a1a1a;
    line-height: 1.45;
    white-space: pre-wrap;
    text-shadow:
        0 0 1px rgba(255, 255, 255, 0.3),
        0 0 4px rgba(255, 255, 255, 0.15);
    filter: contrast(1.25) brightness(1.05);
}


</style>


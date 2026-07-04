<script>
    import { marked } from 'marked';
    import { formatFragment, pickText } from '$lib/formatters/phoenixFormatter';

    const props = $props();
    const frag = props.frag;

    const formatted = formatFragment(frag);
    const rawContent = formatted.content ?? '';
    const previewText = pickText(formatted);

    const isEmotionLog =
        rawContent.includes('📜 Emotion Log') ||
        rawContent.toLowerCase().includes('emotion log');

    const hasTags = formatted.tags && formatted.tags.length > 0;
    const typeLabel = formatted.type || 'unknown';
</script>

<section>
    <h2>{formatted.title || 'Untitled Fragment'}</h2>

    {#if previewText}
        <div>
            <strong>Preview:</strong> {previewText}
        </div>
    {/if}

    {#if hasTags}
        <div>
            {#each formatted.tags as tag}
                <span>{tag}</span>
            {/each}
        </div>
    {/if}

    {#if rawContent}
        <div>
            {@html marked(rawContent)}
        </div>
    {/if}

    <details>
        <summary>Raw JSON</summary>
        <pre>{JSON.stringify(frag, null, 2)}</pre>
    </details>
</section>



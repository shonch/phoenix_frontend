<script>
    import { onMount } from "svelte";

    // -----------------------------
    // Ritual State
    // -----------------------------
    let subject = "";
    let tags = [];
    let tagInput = "";
    let tagSuggestions = [];

    let weather = "";
    let content = "";

    // Optional embedded fragments
    let fragments = [];
    let showFragments = false;

    // -----------------------------
    // Fetch tag suggestions
    // -----------------------------
    async function fetchSuggestions(query) {
        if (!query.trim()) {
            tagSuggestions = [];
            return;
        }

        const res = await fetch(`/tags/suggest?query=${encodeURIComponent(query)}`);
        if (res.ok) {
            tagSuggestions = await res.json();
        }
    }

    function addTag() {
        if (!tagInput.trim()) return;
        if (!tags.includes(tagInput.trim())) {
            tags = [...tags, tagInput.trim()];
        }
        tagInput = "";
        tagSuggestions = [];
    }

    function removeTag(t) {
        tags = tags.filter(x => x !== t);
    }

    // -----------------------------
    // Fragment helpers
    // -----------------------------
    function addFragment() {
        fragments = [
            ...fragments,
            {
                tag: "",
                intensity: 5,
                timestamp: new Date().toISOString(),
                notes: ""
            }
        ];
    }

    function removeFragment(i) {
        fragments = fragments.filter((_, idx) => idx !== i);
    }

    // -----------------------------
    // Submit ritual
    // -----------------------------
    async function submitEmotion() {
        const payload = {
            subject,
            tags,
            weather,
            content,
            fragments
        };

        const res = await fetch("/emotions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert("🕊️ Emotion logged to Phoenix.");
            subject = "";
            tags = [];
            weather = "";
            content = "";
            fragments = [];
        } else {
            alert("⚠️ Error logging emotion.");
        }
    }
</script>

<h1 class="title">🕊️ Log Emotion Ritual</h1>

<div class="ritual-card">

    <!-- SUBJECT -->
    <div class="field">
        <label>Subject</label>
        <input bind:value={subject} placeholder="Name the moment..." />
    </div>

    <!-- TAGS -->
    <div class="field">
        <label>Tags</label>

        <div class="tag-input-row">
            <input
                bind:value={tagInput}
                placeholder="Add tag..."
                on:input={() => fetchSuggestions(tagInput)}
                on:keydown={(e) => e.key === 'Enter' && addTag()}
            />
            <button on:click={addTag}>Add</button>
        </div>

        {#if tagSuggestions.length > 0}
            <div class="suggestions">
                {#each tagSuggestions as s}
                    <div class="suggestion" on:click={() => { tagInput = s.tag_name; addTag(); }}>
                        {s.tag_name}
                    </div>
                {/each}
            </div>
        {/if}

        <div class="tag-list">
            {#each tags as t}
                <span class="tag">
                    {t}
                    <button class="remove" on:click={() => removeTag(t)}>×</button>
                </span>
            {/each}
        </div>
    </div>

    <!-- WEATHER -->
    <div class="field">
        <label>Emotional Weather</label>
        <input bind:value={weather} placeholder="lucid, foggy, volatile..." />
    </div>

    <!-- NOTES -->
    <div class="field">
        <label>Notes (Markdown)</label>
        <textarea bind:value={content} rows="10" placeholder="Write freely..."></textarea>
    </div>

    <!-- FRAGMENTS -->
    <div class="field">
        <label>
            <input type="checkbox" bind:checked={showFragments} />
            Add Embedded Fragments
        </label>
    </div>

    {#if showFragments}
        <div class="fragments">
            {#each fragments as frag, i}
                <div class="fragment">
                    <label>Tag</label>
                    <input bind:value={frag.tag} />

                    <label>Intensity</label>
                    <input type="range" min="1" max="10" bind:value={frag.intensity} />

                    <label>Notes</label>
                    <textarea bind:value={frag.notes}></textarea>

                    <button class="remove-frag" on:click={() => removeFragment(i)}>Remove Fragment</button>
                </div>
            {/each}

            <button class="add-frag" on:click={addFragment}>+ Add Fragment</button>
        </div>
    {/if}

    <!-- SUBMIT -->
    <button class="submit" on:click={submitEmotion}>Submit Emotion</button>

</div>

<style>
    .title {
        text-align: center;
        margin-bottom: 1.5rem;
        font-size: 2rem;
    }

    .ritual-card {
        max-width: 800px;
        margin: 0 auto;
        background: #f3e4c8;
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 0 0 1px rgba(0,0,0,0.3), 0 10px 25px rgba(0,0,0,0.5);
        color: #2b1c10;
    }

    .field {
        margin-bottom: 1.5rem;
    }

    label {
        font-weight: bold;
        display: block;
        margin-bottom: 0.4rem;
    }

    input, textarea {
        width: 100%;
        padding: 0.6rem;
        border-radius: 6px;
        border: 1px solid #aaa;
        background: #fff;
        font-size: 1rem;
    }

    .tag-input-row {
        display: flex;
        gap: 0.5rem;
    }

    .tag-list {
        margin-top: 0.5rem;
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .tag {
        background: #e0cda5;
        padding: 4px 10px;
        border-radius: 999px;
        display: flex;
        align-items: center;
        gap: 0.4rem;
    }

    .remove {
        background: none;
        border: none;
        cursor: pointer;
        font-weight: bold;
        color: #3a2715;
    }

    .suggestions {
        background: #fff;
        border: 1px solid #ccc;
        margin-top: 0.3rem;
        border-radius: 6px;
    }

    .suggestion {
        padding: 0.5rem;
        cursor: pointer;
    }

    .suggestion:hover {
        background: #eee;
    }

    .fragments {
        background: #f7ecd8;
        padding: 1rem;
        border-radius: 8px;
    }

    .fragment {
        margin-bottom: 1rem;
        padding: 1rem;
        background: #fff;
        border-radius: 8px;
        border: 1px solid #ccc;
    }

    .submit {
        width: 100%;
        padding: 1rem;
        background: #3a2715;
        color: #f3e4c8;
        border: none;
        border-radius: 8px;
        font-size: 1.2rem;
        cursor: pointer;
    }
</style>


<script lang="ts">
    import { page } from '$app/stores';

    // ——————————————————————————————————————
    // RUNES STATE
    // ——————————————————————————————————————
    let loading = $state(false);
    let message = $state<string | null>(null);
    let error = $state<string | null>(null);


    $: if (message) {
    // Trigger a soft glow on success
    const container = document.querySelector(".invocation-container");
    if (container) {
        container.style.boxShadow = "0 0 40px rgba(255,180,80,0.4)";
        setTimeout(() => container.style.boxShadow = "", 1200);
        }
    }

    $: if (error) {
    // Trigger a red flash on failure
    const container = document.querySelector(".invocation-container");
    if (container) {
        container.style.boxShadow = "0 0 40px rgba(255,60,60,0.4)";
        setTimeout(() => container.style.boxShadow = "", 800);
        }
    }

    // Ritual from URL
    let ritual = $derived(page.params.ritual);

    // Normalize frontend → backend ritual names
    const ritualMap: Record<string, string> = {
        "log-emotion": "emotion",
        "anti-grind": "anti_grind",
        "pulse": "pulse",
        "detective": "detective",
        "threshold": "threshold",
        "mirror": "mirror",
        "emerge": "emerge",
        "grind": "grind",
        "tags": "tags"
    };

    const ritualType = $derived(ritualMap[ritual] || ritual);

    // Shared fields
    const title = $state("");
    const emotion = $state("");
    const rawFragment = $state("");
    const tags = $state("");

    // Ritual-specific fields
    const grindTask = $state("");
    const grindResistance = $state("");
    const grindNotes = $state("");

    const antiRelief = $state("");
    const antiCause = $state("");
    const antiNotes = $state("");

    const detectiveClue = $state("");
    const detectiveInsight = $state("");

    const mirrorReflection = $state("");
    const mirrorDistortion = $state("");

    const emergeBreakthrough = $state("");
    const emergeContext = $state("");

    const thresholdBoundary = $state("");
    const thresholdViolation = $state("");

    // ——————————————————————————————————————
    // INVOKE RITUAL
    // ——————————————————————————————————————
    async function invokeRitual() {
        loading = true;
        message = null;
        error = null;

        let payload: Record<string, unknown> = {};
        const tagList = tags.split(",").map(t => t.trim()).filter(Boolean);

        if (ritualType === "pulse") {
            payload = { title, emotion, raw_fragment: rawFragment, tags: tagList };
        } else if (ritualType === "emotion") {
            payload = { title, emotion, body: rawFragment, tags: tagList };
        } else if (ritualType === "grind") {
            payload = { task: grindTask, resistance: grindResistance, notes: grindNotes, tags: tagList };
        } else if (ritualType === "anti_grind") {
            payload = { relief: antiRelief, cause: antiCause, notes: antiNotes, tags: tagList };
        } else if (ritualType === "detective") {
            payload = { clue: detectiveClue, insight: detectiveInsight, tags: tagList };
        } else if (ritualType === "mirror") {
            payload = { reflection: mirrorReflection, distortion: mirrorDistortion, tags: tagList };
        } else if (ritualType === "emerge") {
            payload = { breakthrough: emergeBreakthrough, context: emergeContext, tags: tagList };
        } else if (ritualType === "threshold") {
            payload = { boundary: thresholdBoundary, violation: thresholdViolation, tags: tagList };
        }

        try {
            const res = await fetch(`/rituals/ingest/?ritual_type=${ritualType}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ritual_type: ritualType, payload })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || data.error);

            message = data.message || "Ritual complete.";
        } catch (e: any) {
            error = e.message ?? "Ritual faltered.";
        } finally {
            loading = false;
        }
    }
</script>

<!-- ——————————————————————————————————————
     MYTHIC UI — INVOCATION CIRCLE
—————————————————————————————————————— -->
<div class="invocation-container">
    <div class="circle-glow"></div>
    <div class="circle-runes"></div>

    <h1 class="ritual-title">🜂 Invoke {ritualType}</h1>

    <form class="ritual-form" on:submit|preventDefault={invokeRitual}>
        
        <!-- PULSE + EMOTION -->
        {#if ritualType === "pulse" || ritualType === "emotion"}
            <label>Title <input bind:value={title} /></label>
            <label>Emotion <input bind:value={emotion} /></label>
            <label>Fragment <textarea bind:value={rawFragment} rows="5"></textarea></label>
        {/if}

        <!-- GRIND -->
        {#if ritualType === "grind"}
            <label>Task <input bind:value={grindTask} /></label>
            <label>Resistance <input bind:value={grindResistance} /></label>
            <label>Notes <textarea bind:value={grindNotes} rows="4"></textarea></label>
        {/if}

        <!-- ANTI-GRIND -->
        {#if ritualType === "anti_grind"}
            <label>Relief <input bind:value={antiRelief} /></label>
            <label>Cause <input bind:value={antiCause} /></label>
            <label>Notes <textarea bind:value={antiNotes} rows="4"></textarea></label>
        {/if}

        <!-- DETECTIVE -->
        {#if ritualType === "detective"}
            <label>Clue <input bind:value={detectiveClue} /></label>
            <label>Insight <textarea bind:value={detectiveInsight} rows="4"></textarea></label>
        {/if}

        <!-- MIRROR -->
        {#if ritualType === "mirror"}
            <label>Reflection <textarea bind:value={mirrorReflection} rows="4"></textarea></label>
            <label>Distortion <input bind:value={mirrorDistortion} /></label>
        {/if}

        <!-- EMERGE -->
        {#if ritualType === "emerge"}
            <label>Breakthrough <input bind:value={emergeBreakthrough} /></label>
            <label>Context <textarea bind:value={emergeContext} rows="4"></textarea></label>
        {/if}

        <!-- THRESHOLD -->
        {#if ritualType === "threshold"}
            <label>Boundary <input bind:value={thresholdBoundary} /></label>
            <label>Violation <textarea bind:value={thresholdViolation} rows="4"></textarea></label>
        {/if}

        <label>Tags <input bind:value={tags} placeholder="comma separated" /></label>

        <button class="invoke-btn" disabled={loading}>
            {loading ? "🔥 Invoking..." : "✨ Invoke Ritual"}
        </button>

        {#if message}<p class="message">{message}</p>{/if}
        {#if error}<p class="error">{error}</p>{/if}
    </form>
</div>

<style>
    :global(body) {
    background: #000;
    overflow: visible;
    }




    /* ——————————————————————————————————————
       BACKGROUND + CIRCLE
    —————————————————————————————————————— */
    .invocation-container {
        position: relative;
        max-width: 800px;
        margin: 3rem auto;
        padding: 3rem;
        border-radius: 20px;
        background: radial-gradient(circle at center, #0a0a0a, #000);
        color: #f0e6d2;
        overflow: hidden;
        z-index: 9999; /* lifts above layout */
    }

    .circle-glow {
        position: absolute;
        top: -20%;
        left: 50%;
        width: 600px;
        height: 600px;
        transform: translateX(-50%);
        background: radial-gradient(circle, rgba(255,120,0,0.25), transparent 70%);
        filter: blur(40px);
        z-index: 0;
        pointer-events: none;
    }

    .circle-runes {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 420px;
        height: 420px;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        border: 2px solid rgba(255, 180, 80, 0.4);
        box-shadow: 0 0 40px rgba(255, 120, 0, 0.3);
        animation: rotate 18s linear infinite;
        pointer-events: none;
        z-index: 0;
    }

    @keyframes rotate {
        from { transform: translate(-50%, -50%) rotate(0deg); }
        to { transform: translate(-50%, -50%) rotate(360deg); }
    }

    /* ——————————————————————————————————————
       FORM + INPUTS
    —————————————————————————————————————— */
    .ritual-title {
        text-align: center;
        font-size: 2.2rem;
        margin-bottom: 2rem;
        z-index: 2;
        position: relative;
    }

    .ritual-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        z-index: 2;
        position: relative;
    }

    label {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
        font-size: 1rem;
    }

    input, textarea {
        background: rgba(20, 20, 20, 0.9);
        border: 1px solid #444;
        border-radius: 8px;
        padding: 0.6rem;
        color: #f0e6d2;
        font-size: 1rem;
    }

    .invoke-btn {
        margin-top: 1rem;
        padding: 0.8rem;
        border-radius: 999px;
        border: none;
        background: linear-gradient(135deg, #ff7a18, #ff0066);
        color: #0b0b0b;
        font-weight: 700;
        cursor: pointer;
        font-size: 1.1rem;
        transition: transform 0.15s ease;
    }

    .invoke-btn:hover {
        transform: scale(1.03);
    }

    .message {
        margin-top: 1rem;
        color: #a7f3d0;
        font-size: 1.1rem;
    }

    .error {
        margin-top: 1rem;
        color: #fecaca;
        font-size: 1.1rem;
    }
    /* ——————————————————————————————————————
   MYTHIC UPGRADE PACK
—————————————————————————————————————— */

/* Breathing background */
.invocation-container {
    animation: breathe 8s ease-in-out infinite;
}
@keyframes breathe {
    0%   { background: radial-gradient(circle at center, #0a0a0a, #000); }
    50%  { background: radial-gradient(circle at center, #1a0a00, #000); }
    100% { background: radial-gradient(circle at center, #0a0a0a, #000); }
}

/* Ember particles */
.invocation-container::after {
    content: "";
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    pointer-events: none;
    background-image:
        radial-gradient(circle, rgba(255,150,50,0.4) 2px, transparent 3px),
        radial-gradient(circle, rgba(255,120,40,0.3) 2px, transparent 3px),
        radial-gradient(circle, rgba(255,80,20,0.2) 2px, transparent 3px);
    background-size: 4px 4px, 6px 6px, 8px 8px;
    animation: embers 12s linear infinite;
    opacity: 0.25;
}
@keyframes embers {
    from { transform: translateY(0); }
    to   { transform: translateY(-120px); }
}

/* Dragon silhouette rising behind the runes */
.circle-runes::after {
    content: "🐉";
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -60%) scale(0.8);
    font-size: 6rem;
    opacity: 0.05;
    animation: dragon-rise 14s ease-in-out infinite;
}
@keyframes dragon-rise {
    0%   { transform: translate(-50%, -60%) scale(0.8); opacity: 0.03; }
    50%  { transform: translate(-50%, -70%) scale(1.0); opacity: 0.08; }
    100% { transform: translate(-50%, -60%) scale(0.8); opacity: 0.03; }
}

/* Ritual hum glow on hover */
.ritual-form:hover ~ .circle-runes {
    box-shadow: 0 0 60px rgba(255, 120, 0, 0.6);
    border-color: rgba(255, 200, 120, 0.7);
}

/* Success pulse */
.message {
    animation: successPulse 1.4s ease-out;
}
@keyframes successPulse {
    0%   { transform: scale(0.9); opacity: 0.4; }
    50%  { transform: scale(1.05); opacity: 1; }
    100% { transform: scale(1.0); opacity: 1; }
}

/* Failure crack effect */
.error {
    position: relative;
}
.error::after {
    content: "";
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background-image: url("data:image/svg+xml;utf8,\
        <svg xmlns='http://www.w3.org/2000/svg' width='200' height='50'>\
            <path d='M0 25 L50 10 L100 30 L150 5 L200 25' stroke='rgba(255,80,80,0.4)' stroke-width='2' fill='none'/>\
        </svg>");
    background-repeat: no-repeat;
    background-size: cover;
    animation: crack 0.6s ease-out forwards;
}
@keyframes crack {
    from { opacity: 0; transform: scale(0.95); }
    to   { opacity: 1; transform: scale(1); }
}

</style>


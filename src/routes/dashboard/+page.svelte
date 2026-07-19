<script>
    import { phoenixState } from '$lib/stateStore';   // NEW line

    const { data } = $props();
    const { state } = data;

    phoenixState.set(state);

    const raw = state?.raw ?? {};
    const analysis = state?.analysis ?? {};

    const fragments = raw.fragments ?? [];

    // Last fragment
    const lastFragment = fragments[fragments.length - 1];

    // Tags from last fragment (PhoenixTag[])
    const fragmentTags = lastFragment?.tags ?? [];

    // Pick the most mythic tag:
    // 1. Prefer tags with an archetype
    // 2. Otherwise use the first tag
    // 3. Otherwise fallback to Traveler
    const mythicTag =
        fragmentTags.find(t => t.archetype) ??
        fragmentTags[0] ??
        null;

    const archetypeName = mythicTag?.name || "Traveler";
    const emotionLabel = mythicTag?.archetype || "unspoken feeling";
    const trendLabel = analysis?.emotional_trend || "a quiet, shifting current";
</script>

<section class="ritual-hero">
    <div class="ember-layer"></div>

    <p class="line primary">
        The circle opens, <span class="archetype">{archetypeName}</span>.
    </p>

    <p class="line">
        Your last fragment still burns in the dark —
        its ember carries <span class="emphasis">{emotionLabel}</span> into the cold air.
    </p>

    <p class="line">
        The winds of your recent path whisper of
        <span class="emphasis">{trendLabel}</span>.
    </p>

    <p class="line final">
        When you are ready, cast your gaze to the runes on the left
        and choose the next path in the fire.
    </p>
</section>

<style>
    /* Position ritual block */
    .ritual-hero {
        position: absolute;
        top: 18rem;
        left: 50%;
        transform: translateX(-50%);
        padding: 2rem 3rem;
        max-width: 48rem;
        text-align: center;
        font-family: 'Cinzel Decorative', 'Trajan Pro', serif;
        color: #ffeedd;
        text-shadow: 0 0 10px #ffb080;
        letter-spacing: 0.02em;
        line-height: 1.6;
    }

    .line {
        margin: 0.5rem 0;
    }

    .primary {
        font-size: 1.2rem;
        color: #ffcf8f;
        text-shadow: 0 0 14px #ff9f50;
    }

    .emphasis {
        font-style: italic;
        color: #ff8f70;
        text-shadow: 0 0 10px #ff7040;
    }

    .final {
        margin-top: 1rem;
        opacity: 0.85;
    }

    /* FIRE EMBER LAYER */
    .ember-layer {
        position: absolute;
        inset: 0;
        pointer-events: none;
        overflow: visible;
    }

    .ember-layer::before,
    .ember-layer::after {
        content: "";
        position: absolute;
        width: 4px;
        height: 4px;
        background: #ffb080;
        border-radius: 50%;
        opacity: 0;
        animation: ember 2s infinite ease-out;
    }

    .ember-layer::after {
        background: #ff6a00;
        animation-duration: 3s;
    }

    @keyframes ember {
        0% {
            transform: translate(0, 0) scale(1);
            opacity: 0.9;
        }
        100% {
            transform: translate(20px, -40px) scale(0.2);
            opacity: 0;
        }
    }
</style>


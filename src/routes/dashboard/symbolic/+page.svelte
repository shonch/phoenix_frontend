<script>
    import { goto } from "$app/navigation";

    const { data } = $props();

    const symbolic = $derived(data?.symbolic ?? {});

    const tagFrequency = $derived(symbolic.tag_frequency ?? []);
    const archetypes = $derived(symbolic.archetypes ?? []);
    const constellations = $derived(symbolic.co_occurrence ?? []);

    function openTag(tagName) {
        goto(`/dashboard/symbolic/${encodeURIComponent(tagName)}`);
    }
</script>

<div class="mythic-container">
    <h1 class="mythic-title">Symbolic Dashboard</h1>

    <div class="rune-divider">ᚠᛇᚻ</div>
    <section class="panel">
        <h2>Top Tags</h2>
        <table>
            <thead>
                <tr>
                    <th>Tag</th>
                    <th>Count</th>
                </tr>
            </thead>
            <tbody>
                {#each tagFrequency as t}
                    <tr class="clickable-row" onclick={() => openTag(t.tag)}>
                        <td class="floaty">{t.tag}</td>
                        <td>{t.count}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </section>

    <div class="rune-divider">ᛞᚨᚱ</div>
    <section class="panel">
        <h2>Archetypes</h2>
        <table>
            <thead>
                <tr>
                    <th>Archetype</th>
                    <th>Count</th>
                </tr>
            </thead>
            <tbody>
                {#each archetypes as a}
                    <tr>
                        <td class="floaty">{a.archetype}</td>
                        <td>{a.count}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </section>

    <div class="rune-divider">ᚦᛁᚱ</div>
    <section class="panel">
        <h2>Tag Constellations</h2>
        <table>
            <thead>
                <tr>
                    <th>Pair</th>
                    <th>Count</th>
                </tr>
            </thead>
            <tbody>
                {#each constellations as c}
                    <tr>
                        <td class="floaty">{c.pair[0]} ↔ {c.pair[1]}</td>
                        <td>{c.count}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </section>
</div>

<style>
    /* --- BASE MYTHIC CONTAINER --- */
    .mythic-container {
        padding: 2rem;
        color: #dce7f5;
        font-family: "Cinzel", serif;
        background: rgba(10, 20, 30, 0.6);
        backdrop-filter: blur(6px);
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 0 40px rgba(120, 180, 255, 0.15);
        position: relative;
        overflow: hidden;
    }

    .mythic-container::before {
        content: "";
        position: absolute;
        top: -20%;
        left: -20%;
        width: 140%;
        height: 140%;
        background: radial-gradient(
            circle at 50% 30%,
            rgba(255, 255, 255, 0.12),
            rgba(255, 255, 255, 0.03) 40%,
            rgba(0, 0, 0, 0) 70%
        );
        filter: blur(40px);
        opacity: 0.55;
        animation: mistFloat 18s ease-in-out infinite;
        pointer-events: none;
        z-index: 0;
    }

    @keyframes mistFloat {
        0% { transform: translate(0px, 0px) scale(1); }
        50% { transform: translate(20px, -10px) scale(1.05); }
        100% { transform: translate(0px, 0px) scale(1); }
    }

    .mythic-title {
        font-size: 2.4rem;
        letter-spacing: 2px;
        text-align: center;
        margin-bottom: 1rem;
        color: #e8f4ff;
        text-shadow: 0 0 12px rgba(180, 220, 255, 0.4);
        animation: titleFloat 6s ease-in-out infinite;
        position: relative;
        z-index: 1;
    }

    @keyframes titleFloat {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-4px); }
        100% { transform: translateY(0px); }
    }

    .panel {
        margin-bottom: 2rem;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 8px;
        box-shadow: 0 0 20px rgba(120, 180, 255, 0.08);
        position: relative;
        z-index: 1;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1rem;
    }

    th, td {
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 0.5rem;
        text-align: left;
    }

    th {
        background: rgba(255, 255, 255, 0.08);
        color: #eaf3ff;
    }

    .clickable-row {
        cursor: pointer;
        transition: background 0.15s ease;
    }

    .clickable-row:hover {
        background: rgba(255, 255, 255, 0.06);
    }

    .floaty {
        position: relative;
        animation: float 5s ease-in-out infinite;
    }

    @keyframes float {
        0% { transform: translateY(0px); opacity: 0.95; }
        50% { transform: translateY(-3px); opacity: 1; }
        100% { transform: translateY(0px); opacity: 0.95; }
    }

    .rune-divider {
        margin: 2.5rem 0 1.5rem 0;
        text-align: center;
        font-family: "Cinzel", serif;
        font-size: 1.4rem;
        letter-spacing: 0.4rem;
        color: rgba(220, 235, 255, 0.55);
        text-shadow: 0 0 8px rgba(150, 200, 255, 0.25);
        user-select: none;
        animation: runePulse 6s ease-in-out infinite;
        position: relative;
        z-index: 1;
    }

    @keyframes runePulse {
        0% { opacity: 0.55; transform: scale(1); }
        50% { opacity: 0.85; transform: scale(1.03); }
        100% { opacity: 0.55; transform: scale(1); }
    }

    ul {
        margin-top: 1rem;
        padding-left: 1.2rem;
    }
</style>

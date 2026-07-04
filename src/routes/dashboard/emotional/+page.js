export async function load({ parent }) {
    const { state } = await parent();

    return {
        emotional: state.raw.emotional_fragments
    };
}


export async function load({ parent }) {
    const { state } = await parent();

    const fragments = state?.raw?.fragments ?? [];

    return {
        fragments: structuredClone(fragments)
    };
}


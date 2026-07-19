export async function load({ parent }) {
    const parentData = await parent();
    const raw = parentData.state?.raw ?? {};

    return {
        ...parentData,
        collections: {
            fragments: raw.fragments ?? [],
            emotional_fragments: raw.emotional_fragments ?? [],
            clues: raw.clues ?? [],
            thresholds: raw.thresholds ?? [],
            revelations: raw.revelations ?? []
        }
    };
}

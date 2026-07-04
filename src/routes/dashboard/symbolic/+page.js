export async function load({ parent }) {
    const { state } = await parent();

    return {
        symbolic: state.analysis.tags
    };
}


export async function load({ parent }) {
    const { state } = await parent();

    return {
        raw: state.raw
    };
}


export async function load({ parent }) {
    const { state } = await parent();

    return {
        system: state.raw.module_status,
        meta: state.meta
    };
}


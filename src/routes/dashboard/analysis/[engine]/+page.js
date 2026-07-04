export async function load({ parent, params }) {
    console.log("ENGINE LOADER RUNNING", params.engine);

    const { state } = await parent();
    const name = params.engine;
    const engine = state.analysis[name];

    console.log("ENGINE LOADER RESULT:", { name, engine });

    return { name, engine };
}


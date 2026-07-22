export async function load({ parent, params }) {
    const { state } = await parent();
    const tagName = decodeURIComponent(params.tag);

    const allTags = state.raw?.symbolic_tags ?? [];
    const tag = allTags.find(t => (t.name ?? t.tag_name) === tagName);

    return { tag, tagName };
}

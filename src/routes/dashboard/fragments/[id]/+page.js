export async function load({ params, parent }) {
  const { state } = await parent();

  const fragment = state.raw.fragments.find(f =>
    f._id === params.id ||
    f.fragment_id === params.id ||
    f.id === params.id
  );

  return { fragment };
}


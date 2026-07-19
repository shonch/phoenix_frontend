export async function load({ params, parent }) {
  const { state } = await parent();
  const raw = state.raw ?? {};

  const allCollections = [
    ...(raw.fragments ?? []),
    ...(raw.emotional_fragments ?? []),
    ...(raw.clues ?? []),
    ...(raw.thresholds ?? []),
    ...(raw.revelations ?? [])
  ];

  const fragment = allCollections.find(f =>
    f._id === params.id ||
    f.fragment_id === params.id ||
    f.id === params.id
  );

  return { fragment };
}

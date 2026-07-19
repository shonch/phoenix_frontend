const STOPWORDS = new Set([
  "a", "an", "the", "of", "for", "to", "in", "on", "at", "and", "or",
  "is", "it", "i", "you", "he", "she", "we", "they", "this", "that",
  "with", "as", "be", "by", "my", "your", "his", "her", "our", "their",
  "am", "are", "was", "were", "been", "being", "have", "has", "had",
  "do", "does", "did", "but", "if", "so", "not", "no", "yes", "me",
  "him", "us", "them", "will", "would", "can", "could", "should"
]);

export function inferTagsFromStep(step, globalTags) {
  if (!Array.isArray(globalTags)) {
    console.error("TAG ERROR — globalTags is not an array:", globalTags);
    return structuredClone(step.createdTags ?? []);
  }

  const clean = {
    id: String(step.id ?? ""),
    label: String(step.label ?? ""),
    prompt: String(step.prompt ?? ""),
    response: String(step.response ?? ""),
    createdTags: Array.from(step.createdTags ?? []),
  };

  if (!clean.response.trim()) {
    return structuredClone(clean.createdTags);
  }

  const text = clean.response.toLowerCase();
  const words = text.split(/\W+/).filter(Boolean);
  const inferred = [];

  for (const tag of globalTags) {
    const name = String(tag.name ?? tag.tag_name ?? "").toLowerCase();
    if (!name) continue;

    const nameParts = name.split("_").filter((part) => !STOPWORDS.has(part));
    if (nameParts.length === 0) continue; // skip tags that are ALL stopwords

    const matchesWord = nameParts.some((part) => words.includes(part));

    if (matchesWord) {
      inferred.push(tag);
    }
  }

  const merged = [...clean.createdTags, ...inferred];
  const deduped = Array.from(
    new Map(merged.map(t => [t.tag_id, t])).values()
  );

  return structuredClone(deduped);
}

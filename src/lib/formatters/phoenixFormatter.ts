import { marked } from "marked";

/* ---------------------------------------------------------
   Helpers: safe access + type guards
   --------------------------------------------------------- */

function isPhoenixTagArray(tags: any): boolean {
  return Array.isArray(tags) && tags.some(t => typeof t === "object" && ("tag_id" in t || "name" in t));
}

function toDateString(value: any): string {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

function humanize(str: string): string {
  if (!str) return "";
  return str
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase());
}

/* ---------------------------------------------------------
   Phoenix HTML Sanitizer (Safe Mode)
   --------------------------------------------------------- */

export function sanitizePhoenixHtml(input: string): string {
  if (!input) return "";

  let safe = input;

  // Remove stray Vim commands
  safe = safe.replace(/:wq/g, "");

  // Allowed tags (whitelist)
  const allowed = [
    "p", "br", "strong", "em", "h1", "h2", "h3",
    "ul", "li", "hr", "code"
  ];

  // Escape < unless it starts a whitelisted tag
  safe = safe.replace(
    /<(?!\/?(?:p|br|strong|em|h1|h2|h3|ul|li|hr|code)\b)/g,
    "<"
  );

  // Escape > unless it ends a whitelisted tag
  safe = safe.replace(
    /(?<!<\/?(?:p|br|strong|em|h1|h2|h3|ul|li|hr|code))>/g,
    ">"
  );

  // Normalize whitespace
  safe = safe.replace(/\r/g, "");
  safe = safe.replace(/\t/g, "    ");

  // Convert newlines to <br>
  safe = safe.replace(/\n/g, "<br>");

  return safe;
}

/* ---------------------------------------------------------
   Unified Title Resolver
   --------------------------------------------------------- */

export function resolveTitle(fragment: any): string {
  const filename = fragment.filename
    ? fragment.filename.replace(/\.md$/, "")
    : null;

  const raw =
    fragment.metadata?.title ||
    fragment.header ||
    fragment.name ||
    fragment.ritual_name ||
    filename ||
    fragment.title ||
    "Untitled Fragment";

  return humanize(raw);
}

/* ---------------------------------------------------------
   Markdown Renderer
   --------------------------------------------------------- */

export function renderMarkdown(md: string | undefined | null): string {
  if (!md) return "";
  return marked(md);
}

/* ---------------------------------------------------------
   Unified Content Resolver (Markdown → HTML)
   --------------------------------------------------------- */

export function resolveRawContent(fragment: any): string {
  return (
    fragment.content ||
    fragment.notes ||
    fragment.body ||
    fragment.text ||
    fragment.raw ||
    fragment.markdown ||
    ""
  );
}

export function resolveHtmlContent(fragment: any): string {
  const raw = resolveRawContent(fragment);

  if (fragment.filename?.endsWith(".md")) {
    return renderMarkdown(raw);
  }

  if (typeof raw === "string" && /[#*_`>-]/.test(raw)) {
    return renderMarkdown(raw);
  }

  return raw;
}

/* ---------------------------------------------------------
   Unified Tags Resolver
   --------------------------------------------------------- */

export type PhoenixTag = {
  tag_id?: string | null;
  name: string;
  emoji?: string | null;
  color?: string | null;
  archetype?: string | null;
  visibility?: string | null;
  user_id?: string | null;
};

export function resolveTags(fragment: any): PhoenixTag[] {
  const rawTags =
    fragment.tags ||
    fragment.metadata?.tags ||
    fragment.inferred_tags ||
    [];

  if (isPhoenixTagArray(rawTags)) {
    return rawTags as PhoenixTag[];
  }

  if (Array.isArray(rawTags) && rawTags.every(t => typeof t === "string")) {
    return (rawTags as string[]).map(name => ({
      tag_id: null,
      name: humanize(name),
      emoji: "🏷️",
      color: "#7fffd4",
      archetype: null,
      visibility: "private",
      user_id: null
    }));
  }

  if (Array.isArray(rawTags)) {
    return rawTags.map((t: any, i: number) => {
      if (typeof t === "string") {
        return {
          tag_id: null,
          name: humanize(t),
          emoji: "🏷️",
          color: "#7fffd4",
          archetype: null,
          visibility: "private",
          user_id: null
        };
      }

      return {
        tag_id: t.tag_id ?? t.id ?? String(i),
        name: humanize(t.name ?? t.label ?? "Unnamed Tag"),
        emoji: t.emoji ?? "🏷️",
        color: t.color ?? "#7fffd4",
        archetype: t.archetype ?? null,
        visibility: t.visibility ?? "private",
        user_id: t.user_id ?? null
      };
    });
  }

  return [];
}

/* ---------------------------------------------------------
   Unified Emotional / Symbolic / Threshold Resolvers
   --------------------------------------------------------- */

export function resolveEmotionalMode(fragment: any): string | null {
  return (
    fragment.emotional_mode ||
    fragment.emotional_tone ||
    fragment.mode ||
    fragment.metadata?.emotional_mode ||
    null
  );
}

export function resolveSymbolicAnchor(fragment: any): string | null {
  return (
    fragment.symbolic_anchor ||
    fragment.symbolic_image ||
    fragment.symbol ||
    fragment.metadata?.symbolic_anchor ||
    null
  );
}

export function resolveThreshold(fragment: any): string | null {
  return (
    fragment.threshold_type ||
    fragment.threshold ||
    fragment.transition ||
    fragment.metadata?.threshold ||
    null
  );
}

/* ---------------------------------------------------------
   Unified ID / Timestamp / Type Resolvers
   --------------------------------------------------------- */

export function resolveId(fragment: any): string {
  return (
    fragment.fragment_id ||
    fragment._id ||
    fragment.id ||
    fragment.metadata?.id ||
    ""
  );
}

export function resolveCreatedAt(fragment: any): string {
  return (
    toDateString(fragment.created_at) ||
    toDateString(fragment.timestamp) ||
    toDateString(fragment.date) ||
    toDateString(fragment.metadata?.date)
  );
}

export function resolveType(fragment: any): string {
  return (
    fragment.type ||
    fragment.fragment_type ||
    fragment.metadata?.type ||
    "unknown"
  );
}

/* ---------------------------------------------------------
   Unified Fragment Normalizer
   --------------------------------------------------------- */

export function normalizeFragment(fragment: any) {
  return {
    id: resolveId(fragment),
    title: resolveTitle(fragment),
    html: resolveHtmlContent(fragment),
    preview: fragment.preview ?? "",
    tags: resolveTags(fragment),
    createdAt: resolveCreatedAt(fragment),
    type: resolveType(fragment),
    emotionalMode: resolveEmotionalMode(fragment),
    symbolicAnchor: resolveSymbolicAnchor(fragment),
    threshold: resolveThreshold(fragment),
    raw: fragment
  };
}

/* ---------------------------------------------------------
   Unified Fragment Formatter
   --------------------------------------------------------- */

export type UnifiedFragment = {
  id: string;
  title: string;
  html: string;
  preview: string;
  tags: PhoenixTag[];
  createdAt: string;
  type: string;
  emotionalMode: string | null;
  symbolicAnchor: string | null;
  threshold: string | null;
  raw: any;
};

export function formatFragment(fragment: any): UnifiedFragment {
  const normalized = normalizeFragment(fragment);
  const sanitizedHtml = sanitizePhoenixHtml(normalized.html);

  const rawContent = resolveRawContent(fragment);

  const previewSource =
    fragment.preview ||
    rawContent ||
    fragment.text ||
    fragment.body ||
    "";

  const preview =
    typeof previewSource === "string"
      ? previewSource.slice(0, 160) + (previewSource.length > 160 ? "…" : "")
      : "";

  return {
    ...normalized,
    html: sanitizedHtml,
    preview,
    raw: fragment
  };
}

export function formatFragmentList(list: any[]): UnifiedFragment[] {
  return list.map(f => formatFragment(f));
}

/* ---------------------------------------------------------
   Emotional State / System Layer
   --------------------------------------------------------- */

export function formatEmotionalState(state: any) {
  return {
    mode: state.mode,
    archetype: state.archetype,
    pulse: state.pulse,
    triggers: state.triggers || [],
    timestamp: toDateString(state.timestamp)
  };
}

export function formatSystemLayer(layer: any) {
  return {
    name: layer.name,
    status: layer.status,
    details: layer.details || {}
  };
}

/* ---------------------------------------------------------
   Grouping
   --------------------------------------------------------- */

export function groupFragmentsByType(list: any[]) {
  const groups: Record<string, UnifiedFragment[]> = {};

  for (const frag of list) {
    const formatted = formatFragment(frag);
    const type = formatted.type || "unknown";

    if (!groups[type]) {
      groups[type] = [];
    }

    groups[type].push(formatted);
  }

  return groups;
}

/* ---------------------------------------------------------
   Text helpers
   --------------------------------------------------------- */

export function pick(obj: any, keys: string[], fallback = "") {
  for (const key of keys) {
    if (obj && obj[key] !== undefined && obj[key] !== null) {
      return obj[key];
    }
  }
  return fallback;
}

export function pickText(fragment: any) {
  const f = formatFragment(fragment);
  return (
    f.preview ||
    f.html ||
    resolveRawContent(fragment) ||
    ""
  );
}


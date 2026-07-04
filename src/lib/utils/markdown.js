// src/lib/utils/markdown.js
import { marked } from 'marked';

marked.setOptions({
    breaks: true,
    gfm: true
});

export function renderMarkdown(text) {
    if (!text) return "";

    // If content already contains HTML tags, don't double-render
    const looksLikeHTML = /<\/?[a-z][\s\S]*>/i.test(text);
    if (looksLikeHTML) return text;

    return marked.parse(text);
}


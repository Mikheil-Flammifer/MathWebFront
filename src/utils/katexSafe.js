import katex from 'katex';

const MAX_TEX_LENGTH = 2000;

const KATEX_OPTIONS = {
  throwOnError: false,
  trust: false,
  strict: 'ignore',
  maxSize: 20,
  maxExpand: 1000,
  errorColor: '#f87171',
};

export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function fallbackHtml(tex) {
  return '<span class="katex-error" style="color:#f87171">' + escapeHtml(tex) + '</span>';
}

// Always returns safe HTML. Never throws, never puts raw input into HTML.
export function renderMath(tex, display) {
  const source = String(tex ?? '');
  if (source.length > MAX_TEX_LENGTH) {
    return fallbackHtml(source.slice(0, MAX_TEX_LENGTH));
  }
  try {
    return katex.renderToString(source, { ...KATEX_OPTIONS, displayMode: !!display });
  } catch (err) {
    return fallbackHtml(source);
  }
}
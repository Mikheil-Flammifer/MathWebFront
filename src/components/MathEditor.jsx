import { useRef, useState } from 'react';
import katex from 'katex';
import MathText from './MathText';

const inputClass =
  'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-violet-400 focus:outline-none';

// Template markers:
//   [[sel]] = the selected text goes here
//   [[cur]] = the cursor lands here after insertion
const k = (face, title, tpl, display = false) => ({ face, title, tpl, display });

const TABS = [
  {
    id: 'formulas',
    label: 'Formulas',
    keys: [
      k('\\frac{a}{b}', 'Fraction', '\\frac{[[sel]]}{[[cur]]}'),
      k('\\frac{1}{x}', 'One over x', '\\frac{1}{[[sel]]}'),
      k('x^{2}', 'Square', '^{2}'),
      k('x^{3}', 'Cube', '^{3}'),
      k('x^{n}', 'Power', '^{[[sel]]}'),
      k('x_{n}', 'Index (subscript)', '_{[[sel]]}'),
      k('\\sqrt{x}', 'Square root', '\\sqrt{[[sel]]}'),
      k('\\sqrt[n]{x}', 'Nth root', '\\sqrt[[[cur]]]{[[sel]]}'),
      k('|x|', 'Absolute value', '\\left|[[sel]]\\right|'),
      k('(x)', 'Round brackets', '\\left([[sel]]\\right)'),
      k('[x]', 'Square brackets', '\\left[[[sel]]\\right]'),
      k('\\{x\\}', 'Curly braces', '\\left\\{[[sel]]\\right\\}'),
      k('\\log x', 'Logarithm', '\\log\\left([[sel]]\\right)'),
      k('\\log_{a}', 'Logarithm with base', '\\log_{[[sel]]}'),
      k('\\ln x', 'Natural logarithm', '\\ln\\left([[sel]]\\right)'),
      k('e^{x}', 'e to the power', 'e^{[[sel]]}'),
      k('\\sin', 'Sine', '\\sin\\left([[sel]]\\right)'),
      k('\\cos', 'Cosine', '\\cos\\left([[sel]]\\right)'),
      k('\\tan', 'Tangent', '\\tan\\left([[sel]]\\right)'),
      k('\\cot', 'Cotangent', '\\cot\\left([[sel]]\\right)'),
      k('\\times', 'Multiply', '\\times '),
      k('\\div', 'Divide', '\\div '),
      k('\\cdot', 'Dot', '\\cdot '),
      k('\\pm', 'Plus minus', '\\pm '),
      k('\\le', 'Less or equal', '\\le '),
      k('\\ge', 'Greater or equal', '\\ge '),
      k('\\ne', 'Not equal', '\\ne '),
      k('\\approx', 'Approximately', '\\approx '),
      k('<', 'Less than', '< '),
      k('>', 'Greater than', '> '),
      k('\\%', 'Percent', '\\%'),
      k('\\ldots', 'Dots', '\\ldots '),
    ],
  },
  {
    id: 'constants',
    label: 'Constants',
    keys: [
      k('\\pi', 'Pi', '\\pi '),
      k('e', 'Euler number e', 'e'),
      k('i', 'Imaginary unit', 'i'),
      k('\\infty', 'Infinity', '\\infty '),
      k('\\varphi', 'Golden ratio / phi', '\\varphi '),
      k('\\varnothing', 'Empty set', '\\varnothing '),
      k('\\mathbb{R}', 'Real numbers', '\\mathbb{R}'),
      k('\\mathbb{N}', 'Natural numbers', '\\mathbb{N}'),
      k('\\mathbb{Z}', 'Integers', '\\mathbb{Z}'),
      k('\\mathbb{Q}', 'Rational numbers', '\\mathbb{Q}'),
      k('\\mathbb{C}', 'Complex numbers', '\\mathbb{C}'),
      k('^\\circ', 'Degree', '^\\circ'),
      k('\\alpha', 'Alpha', '\\alpha '),
      k('\\beta', 'Beta', '\\beta '),
      k('\\gamma', 'Gamma', '\\gamma '),
      k('\\delta', 'Delta', '\\delta '),
      k('\\varepsilon', 'Epsilon', '\\varepsilon '),
      k('\\theta', 'Theta', '\\theta '),
      k('\\lambda', 'Lambda', '\\lambda '),
      k('\\mu', 'Mu', '\\mu '),
      k('\\rho', 'Rho', '\\rho '),
      k('\\sigma', 'Sigma', '\\sigma '),
      k('\\tau', 'Tau', '\\tau '),
      k('\\omega', 'Omega', '\\omega '),
      k('\\Delta', 'Delta (capital)', '\\Delta '),
      k('\\Sigma', 'Sigma (capital)', '\\Sigma '),
      k('\\Pi', 'Pi (capital)', '\\Pi '),
      k('\\Omega', 'Omega (capital)', '\\Omega '),
      k('\\angle', 'Angle', '\\angle '),
      k('\\perp', 'Perpendicular', '\\perp '),
      k('\\parallel', 'Parallel', '\\parallel '),
      k('\\triangle', 'Triangle', '\\triangle '),
      k('\\cong', 'Congruent', '\\cong '),
      k('\\sim', 'Similar', '\\sim '),
      k('\\to', 'Arrow', '\\to '),
      k('\\Rightarrow', 'Implies', '\\Rightarrow '),
      k('\\Leftrightarrow', 'If and only if', '\\Leftrightarrow '),
    ],
  },
  {
    id: 'advanced',
    label: 'Advanced',
    keys: [
      k('\\int', 'Integral', '\\int [[sel]]\\,dx'),
      k('\\int_{a}^{b}', 'Definite integral', '\\int_{a}^{b} [[sel]]\\,dx'),
      k('\\iint', 'Double integral', '\\iint [[sel]]\\,dA'),
      k('\\oint', 'Closed integral', '\\oint [[sel]]\\,ds'),
      k('\\sum_{i=1}^{n}', 'Sum', '\\sum_{i=1}^{n} [[sel]]'),
      k('\\prod_{i=1}^{n}', 'Product', '\\prod_{i=1}^{n} [[sel]]'),
      k('\\lim_{x \\to a}', 'Limit', '\\lim_{x \\to a} [[sel]]'),
      k('\\lim_{x \\to \\infty}', 'Limit to infinity', '\\lim_{x \\to \\infty} [[sel]]'),
      k('\\frac{d}{dx}', 'Derivative', '\\frac{d}{dx}\\left([[sel]]\\right)'),
      k('\\frac{dy}{dx}', 'dy over dx', '\\frac{dy}{dx}'),
      k('\\frac{\\partial f}{\\partial x}', 'Partial derivative', '\\frac{\\partial [[sel]]}{\\partial x}'),
      k("f'(x)", 'f prime of x', "f'(x)"),
      k("f''(x)", 'f double prime of x', "f''(x)"),
      k('\\nabla', 'Nabla', '\\nabla '),
      k('\\binom{n}{k}', 'Binomial coefficient', '\\binom{[[sel]]}{[[cur]]}'),
      k('n!', 'Factorial', '!'),
      k('\\vec{v}', 'Vector', '\\vec{[[sel]]}'),
      k('\\overline{x}', 'Overline', '\\overline{[[sel]]}'),
      k('\\hat{x}', 'Hat', '\\hat{[[sel]]}'),
      k('\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}', 'Matrix 2x2', '\\begin{pmatrix} [[sel]] & \\\\ & \\end{pmatrix}', true),
      k('\\begin{cases}\\cdot\\\\\\cdot\\end{cases}', 'System of equations', '\\begin{cases} [[sel]] \\\\ \\end{cases}', true),
      k('\\in', 'Element of', '\\in '),
      k('\\notin', 'Not element of', '\\notin '),
      k('\\subset', 'Subset', '\\subset '),
      k('\\cup', 'Union', '\\cup '),
      k('\\cap', 'Intersection', '\\cap '),
      k('\\forall', 'For all', '\\forall '),
      k('\\exists', 'Exists', '\\exists '),
      k('\\therefore', 'Therefore', '\\therefore '),
    ],
  },
];

const MODE_KEYS = [
  { label: '$ $', title: 'Inline formula', tpl: '$[[sel]]$' },
  { label: '$$ $$', title: 'Formula on its own line', tpl: '$$[[sel]]$$' },
];

// The key faces are static strings written in this file, never user text,
// so setting them as HTML is safe.
const faceCache = {};
function faceHtml(face) {
  if (!faceCache[face]) {
    faceCache[face] = katex.renderToString(face, {
      throwOnError: false,
      trust: false,
    });
  }
  return faceCache[face];
}

// Fills a template with the selection and works out the cursor position.
function fillTemplate(tpl, sel) {
  const SEL = '[[sel]]';
  const CUR = '[[cur]]';
  let text = '';
  let selPos = null;
  let curPos = null;
  let i = 0;

  while (i < tpl.length) {
    if (tpl.startsWith(SEL, i)) {
      selPos = text.length;
      text += sel;
      i += SEL.length;
    } else if (tpl.startsWith(CUR, i)) {
      curPos = text.length;
      i += CUR.length;
    } else {
      text += tpl[i];
      i += 1;
    }
  }

  let cursor = text.length;
  if (sel) {
    if (curPos !== null) cursor = curPos;
  } else if (selPos !== null) {
    cursor = selPos;
  } else if (curPos !== null) {
    cursor = curPos;
  }
  return { text, cursor };
}

// True when the position is inside an open $...$ or $$...$$ formula.
// "\$" (escaped dollar) is ignored.
function isInsideMath(text, pos) {
  const re = /(?<!\\)\$\$|(?<!\\)\$/g;
  const before = text.slice(0, pos);
  let state = null;
  let match = re.exec(before);
  while (match !== null) {
    const token = match[0];
    if (state === null) {
      state = token;
    } else if (state === token) {
      state = null;
    }
    match = re.exec(before);
  }
  return state !== null;
}

export default function MathEditor({
  value,
  onChange,
  rows = 3,
  placeholder = '',
  compact = false,
  preview = true,
}) {
  const ref = useRef(null);
  const [focused, setFocused] = useState(false);
  const [tabId, setTabId] = useState('formulas');

  const activeTab = TABS.find((t) => t.id === tabId) || TABS[0];

  const insert = (tpl, display, raw) => {
    const el = ref.current;
    const start = el ? el.selectionStart : value.length;
    const end = el ? el.selectionEnd : value.length;
    const sel = value.slice(start, end);

    let { text, cursor } = fillTemplate(tpl, sel);
    if (!raw && !isInsideMath(value, start)) {
      const mark = display ? '$$' : '$';
      text = mark + text + mark;
      cursor += mark.length;
    }

    onChange(value.slice(0, start) + text + value.slice(end));

    const pos = start + cursor;
    requestAnimationFrame(() => {
      const node = ref.current;
      if (node) {
        node.focus();
        node.setSelectionRange(pos, pos);
      }
    });
  };

  const showPreview =
    preview && value.trim().length > 0 && (!compact || value.includes('$'));

  return (
    <div>
      {focused && (
        <div
          className="mb-2 rounded-xl border border-white/10 bg-black/30 p-2"
          onMouseDown={(e) => e.preventDefault()}
        >
          <div className="mb-2 flex flex-wrap items-center gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTabId(tab.id)}
                className={
                  tab.id === activeTab.id
                    ? 'rounded-md bg-violet-500 px-3 py-1 text-xs font-medium text-white'
                    : 'rounded-md border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 hover:text-white'
                }
              >
                {tab.label}
              </button>
            ))}
            <span className="ml-auto flex gap-1">
              {MODE_KEYS.map((mode) => (
                <button
                  key={mode.title}
                  type="button"
                  title={mode.title}
                  onClick={() => insert(mode.tpl, false, true)}
                  className="rounded-md border border-white/10 bg-white/5 px-2 py-1 font-mono text-xs text-white/70 hover:border-violet-400 hover:text-white"
                >
                  {mode.label}
                </button>
              ))}
            </span>
          </div>

          <div className="grid grid-cols-6 gap-1 sm:grid-cols-8">
            {activeTab.keys.map((key) => (
              <button
                key={key.title}
                type="button"
                title={key.title}
                onClick={() => insert(key.tpl, key.display, false)}
                className="flex h-10 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-white/5 text-sm text-white hover:border-violet-400 hover:bg-violet-500/20"
              >
                <span dangerouslySetInnerHTML={{ __html: faceHtml(key.face) }} />
              </button>
            ))}
          </div>
        </div>
      )}

      <textarea
        ref={ref}
        className={inputClass}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />

      {showPreview && (
        <div className="mt-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white">
          <div className="mb-1 text-xs uppercase tracking-wide text-white/40">Preview</div>
          <MathText text={value} />
        </div>
      )}
    </div>
  );
}
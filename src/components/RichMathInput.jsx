import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import katex from 'katex';
import { MathfieldElement } from 'mathlive';
import 'katex/dist/katex.min.css';
import { tokenize } from './MathText';

// The KaTeX fonts are already loaded by katex.min.css, so MathLive does not
// need to look for its own font and sound files.
MathfieldElement.fontsDirectory = null;
MathfieldElement.soundsDirectory = null;

const EDITOR_CSS = `
.rich-math:empty::before {
  content: attr(data-placeholder);
  color: rgba(255, 255, 255, 0.35);
  pointer-events: none;
}
.rich-math .math-chip {
  display: inline-block;
  cursor: pointer;
  margin: 0 2px;
  padding: 0 6px;
  border-radius: 8px;
  border: 1px solid rgba(167, 139, 250, 0.35);
  background: rgba(139, 92, 246, 0.14);
  vertical-align: middle;
  user-select: none;
}
.rich-math .math-chip:hover {
  background: rgba(139, 92, 246, 0.28);
  border-color: rgba(167, 139, 250, 0.8);
}
.rich-math .math-chip .katex-display {
  margin: 0.2em 0;
}
`;

let stylesInjected = false;
function injectStyles() {
  if (stylesInjected || typeof document === 'undefined') return;
  const el = document.createElement('style');
  el.textContent = EDITOR_CSS;
  document.head.appendChild(el);
  stylesInjected = true;
}

// KaTeX output is safe to set as HTML: trust is off and the input is only
// a LaTeX string, never raw HTML.
function renderLatex(latex, display) {
  return katex.renderToString(latex, {
    displayMode: display,
    throwOnError: false,
    trust: false,
  });
}

function createChip(latex, display) {
  const chip = document.createElement('span');
  chip.className = 'math-chip';
  chip.contentEditable = 'false';
  chip.dataset.latex = latex;
  chip.dataset.display = display ? '1' : '0';
  chip.innerHTML = renderLatex(latex, display);
  return chip;
}

// Builds the editable content from the stored "$...$" text.
function buildDom(root, value) {
  root.textContent = '';
  tokenize(value || '').forEach((token) => {
    if (token.type === 'text') {
      root.appendChild(document.createTextNode(token.value));
    } else {
      root.appendChild(createChip(token.value, token.type === 'display'));
    }
  });
  // An invisible character on each side keeps the caret usable next to a chip.
  if (root.firstChild && root.firstChild.nodeType === 1) {
    root.insertBefore(document.createTextNode('\u200B'), root.firstChild);
  }
  if (root.lastChild && root.lastChild.nodeType === 1) {
    root.appendChild(document.createTextNode('\u200B'));
  }
}

// Turns the editable content back into the stored "$...$" text.
function serialize(root) {
  let out = '';

  const walk = (node) => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === 3) {
        out += child.nodeValue
          .replace(/\u200B/g, '')
          .replace(/\$/g, () => '\\$');
      } else if (child.nodeType === 1) {
        if (child.dataset && child.dataset.latex !== undefined) {
          const mark = child.dataset.display === '1' ? '$$' : '$';
          out += mark + child.dataset.latex + mark;
        } else if (child.tagName === 'BR') {
          out += '\n';
        } else {
          if (out && !out.endsWith('\n')) out += '\n';
          walk(child);
        }
      }
    });
  };

  walk(root);
  return out;
}

function insertChip(root, chip, range) {
  let r = range;
  if (!r || !root.contains(r.startContainer)) {
    r = document.createRange();
    r.selectNodeContents(root);
    r.collapse(false);
  }
  r.deleteContents();
  r.insertNode(chip);

  const after = document.createTextNode('\u200B');
  chip.after(after);

  root.focus();
  const selection = window.getSelection();
  const caret = document.createRange();
  caret.setStart(after, 1);
  caret.collapse(true);
  selection.removeAllRanges();
  selection.addRange(caret);
}

function cleanLatex(raw) {
  return raw
    .replace(/\\exponentialE/g, '\\mathrm{e}')
    .replace(/\\imaginaryI/g, '\\mathrm{i}')
    .replace(/\\differentialD/g, '\\mathrm{d}')
    .replace(/\\placeholder(\[[^\]]*\])?\{[^}]*\}/g, '')
    .trim();
}

function FormulaDialog({ initialLatex, initialDisplay, editing, onConfirm, onCancel, onDelete }) {
  const fieldRef = useRef(null);
  const [display, setDisplay] = useState(initialDisplay);

  useEffect(() => {
    const el = fieldRef.current;
    if (!el) return undefined;
    el.value = initialLatex;
    document.documentElement.style.setProperty('--keyboard-zindex', '3000');
    const timer = setTimeout(() => {
      el.focus();
      if (window.mathVirtualKeyboard) {
        window.mathVirtualKeyboard.show();
      }
    }, 50);
    return () => {
      clearTimeout(timer);
      if (window.mathVirtualKeyboard) {
        window.mathVirtualKeyboard.hide();
      }
    };
  }, [initialLatex]);

  const readLatex = () => {
    const el = fieldRef.current;
    if (!el) return '';
    let latex = '';
    try {
      latex = el.getValue('latex-expanded');
    } catch (err) {
      latex = el.value;
    }
    return cleanLatex(latex || '');
  };

  const confirm = () => {
    onConfirm(readLatex(), display);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      confirm();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 flex items-start justify-center bg-black/70 px-4 pt-16"
      style={{ zIndex: 1000 }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      onKeyDown={handleKeyDown}
    >
      <div className="w-full max-w-xl space-y-4 rounded-2xl border border-white/10 bg-[#12122a] p-5 shadow-2xl">
        <div>
          <h3 className="text-lg font-semibold text-white">
            {editing ? 'Edit formula' : 'Insert formula'}
          </h3>
          <p className="mt-1 text-xs text-white/50">
            Type with your keyboard or use the keyboard at the bottom of the screen. Tip: type 1/2
            for a fraction, x^2 for a power, sqrt for a root.
          </p>
        </div>

        <math-field
          ref={fieldRef}
          math-virtual-keyboard-policy="manual"
          style={{
            display: 'block',
            width: '100%',
            fontSize: '1.75rem',
            padding: '12px 14px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.05)',
            color: 'white',
          }}
        />

        <label className="flex items-center gap-2 text-sm text-white/70">
          <input
            type="checkbox"
            checked={display}
            onChange={(e) => setDisplay(e.target.checked)}
          />
          Show on its own line (large)
        </label>

        <div className="flex items-center gap-2">
          {editing && (
            <button
              type="button"
              onClick={onDelete}
              className="rounded-lg border border-red-400/40 px-4 py-2 text-sm text-red-300 hover:bg-red-400/10"
            >
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="ml-auto rounded-lg border border-white/15 px-4 py-2 text-sm text-white/80 hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirm}
            className="rounded-lg bg-violet-500 px-5 py-2 text-sm font-medium text-white hover:bg-violet-400"
          >
            {editing ? 'Update' : 'Insert'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function RichMathInput({
  value,
  onChange,
  placeholder = '',
  minRows = 3,
  compact = false,
}) {
  const rootRef = useRef(null);
  const lastValue = useRef(null);
  const savedRange = useRef(null);
  const [dialog, setDialog] = useState(null);

  useEffect(() => {
    injectStyles();
  }, []);

  // Rebuild the content only when the value changed from outside.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (value !== lastValue.current) {
      buildDom(root, value);
      lastValue.current = value;
    }
  }, [value]);

  const emit = () => {
    const root = rootRef.current;
    if (!root) return;
    const next = serialize(root);
    lastValue.current = next;
    onChange(next);
  };

  const handleInput = () => {
    const root = rootRef.current;
    if (
      root &&
      root.textContent.replace(/\u200B/g, '') === '' &&
      !root.querySelector('.math-chip')
    ) {
      root.innerHTML = '';
    }
    emit();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!compact) {
        document.execCommand('insertLineBreak');
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, compact ? text.replace(/\n/g, ' ') : text);
  };

  const handleClick = (e) => {
    const chip = e.target.closest ? e.target.closest('.math-chip') : null;
    if (chip && rootRef.current && rootRef.current.contains(chip)) {
      setDialog({
        chip,
        latex: chip.dataset.latex || '',
        display: chip.dataset.display === '1',
      });
    }
  };

  const openInsert = () => {
    const root = rootRef.current;
    const selection = window.getSelection();
    if (
      root &&
      selection &&
      selection.rangeCount > 0 &&
      root.contains(selection.anchorNode)
    ) {
      savedRange.current = selection.getRangeAt(0).cloneRange();
    } else {
      savedRange.current = null;
    }
    setDialog({ chip: null, latex: '', display: false });
  };

  const closeDialog = () => setDialog(null);

  const confirmDialog = (latex, display) => {
    const current = dialog;
    setDialog(null);
    if (!current) return;
    const root = rootRef.current;

    if (!latex) {
      if (current.chip) {
        current.chip.remove();
        emit();
      }
      return;
    }

    if (current.chip) {
      current.chip.dataset.latex = latex;
      current.chip.dataset.display = display ? '1' : '0';
      current.chip.innerHTML = renderLatex(latex, display);
    } else {
      insertChip(root, createChip(latex, display), savedRange.current);
    }
    emit();
  };

  const deleteChip = () => {
    const current = dialog;
    setDialog(null);
    if (current && current.chip) {
      current.chip.remove();
      emit();
    }
  };

  const formulaButton = (
    <button
      type="button"
      title="Insert a formula"
      onMouseDown={(e) => e.preventDefault()}
      onClick={openInsert}
      className="inline-flex shrink-0 items-center gap-1 rounded-md border border-violet-400/40 bg-violet-500/10 px-3 py-1.5 text-sm text-violet-200 hover:bg-violet-500/20"
    >
      ∑{compact ? '' : ' Formula'}
    </button>
  );

  const editable = (
    <div
      ref={rootRef}
      className="rich-math w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-base text-white focus:border-violet-400 focus:outline-none"
      style={{
        minHeight: `${minRows * 1.6}rem`,
        whiteSpace: 'pre-wrap',
        overflowWrap: 'anywhere',
      }}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      onInput={handleInput}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
    />
  );

  return (
    <div>
      {compact ? (
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">{editable}</div>
          {formulaButton}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            {formulaButton}
            <span className="text-xs text-white/40">Click a formula in the text to edit it.</span>
          </div>
          {editable}
        </div>
      )}

      {dialog && (
        <FormulaDialog
          initialLatex={dialog.latex}
          initialDisplay={dialog.display}
          editing={dialog.chip !== null}
          onConfirm={confirmDialog}
          onCancel={closeDialog}
          onDelete={deleteChip}
        />
      )}
    </div>
  );
}
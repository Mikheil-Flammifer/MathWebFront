import { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

// Finds the closing "$" of an inline formula. Skips escaped characters
// like \$ and gives up at a line break (inline math stays on one line).
function findInlineEnd(text, from) {
  for (let j = from; j < text.length; j++) {
    const c = text[j];
    if (c === "\n") {
      return -1;
    }
    if (c === "\\") {
      j++;
      continue;
    }
    if (c === "$") {
      return j;
    }
  }
  return -1;
}

// Splits text into { type: "text" | "inline" | "display", value } tokens.
// "\$" outside a formula becomes a literal "$". An unmatched "$" stays plain text.
function tokenize(text) {
  const tokens = [];
  let buf = "";
  let i = 0;

  const flush = () => {
    if (buf) {
      tokens.push({ type: "text", value: buf });
      buf = "";
    }
  };

  while (i < text.length) {
    const ch = text[i];

    if (ch === "\\" && text[i + 1] === "$") {
      buf += "$";
      i += 2;
      continue;
    }

    if (ch === "$") {
      if (text[i + 1] === "$") {
        const end = text.indexOf("$$", i + 2);
        if (end > i + 2) {
          flush();
          tokens.push({ type: "display", value: text.slice(i + 2, end) });
          i = end + 2;
          continue;
        }
      } else {
        const end = findInlineEnd(text, i + 1);
        if (end > i + 1) {
          flush();
          tokens.push({ type: "inline", value: text.slice(i + 1, end) });
          i = end + 1;
          continue;
        }
      }
    }

    buf += ch;
    i++;
  }

  flush();
  return tokens;
}

// dangerouslySetInnerHTML is safe here only because the HTML is KaTeX output
// (trust: false), never raw user text. Keep it that way.
function Tex({ tex, display }) {
  const html = useMemo(() => {
    return katex.renderToString(tex, {
      displayMode: display,
      throwOnError: false,
      trust: false,
    });
  }, [tex, display]);

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function MathText({ text, className }) {
  const tokens = useMemo(() => tokenize(text ?? ""), [text]);

  return (
    <span className={className} style={{ whiteSpace: "pre-wrap" }}>
      {tokens.map((token, index) => {
        if (token.type === "display") {
          return <Tex key={index} tex={token.value} display={true} />;
        }
        if (token.type === "inline") {
          return <Tex key={index} tex={token.value} display={false} />;
        }
        return <span key={index}>{token.value}</span>;
      })}
    </span>
  );
}
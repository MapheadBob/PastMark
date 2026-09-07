import { markColor } from "../lib/markColors";
import { markMeta } from "../data/subjectPack";

// Filled category pill — the one visual thread tying the mark header, the
// progress rail and every results row together (Design Standard §Component
// patterns: "Category tag"). Never render a mark's name as bare colored text.
export default function MarkTag({ markKey, className = "" }) {
  const { bg, fg } = markColor(markKey);
  return (
    <span
      className={"pm-mark-tag " + className}
      style={{ background: bg, color: fg }}
    >
      {markMeta[markKey].tag}
    </span>
  );
}

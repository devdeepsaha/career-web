import React from "react";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

const Latex = ({ children }) => {
  if (!children) return null;

  const regex = /(\$\$.*?\$\$|\$.*?\$)/g;
  const parts = children.split(regex).filter(Boolean);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("$$") && part.endsWith("$$")) {
          const content = part.slice(2, -2);
          return <BlockMath key={i} math={content} />;
        } else if (part.startsWith("$") && part.endsWith("$")) {
          const content = part.slice(1, -1);
          return <InlineMath key={i} math={content} />;
        } else {
          return part;
        }
      })}
    </>
  );
};

export default Latex;

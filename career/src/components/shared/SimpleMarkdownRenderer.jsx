import React from 'react';
import Latex from 'react-latex-next';

/**
 * Splits a string into parts: text vs math ($...$ or $$...$$)
 */
const parseMath = (str) => {
  const regex = /(\$\$.*?\$\$|\$.*?\$)/g;
  const parts = str.split(regex).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith('$$') && part.endsWith('$$')) {
      return <Latex key={i}>{part}</Latex>;
    } else if (part.startsWith('$') && part.endsWith('$')) {
      return <Latex key={i}>{part}</Latex>;
    } else {
      return part;
    }
  });
};

const SimpleMarkdownRenderer = ({ text }) => {
  if (!text) return null;
  const lines = text.split('\n');

  return (
    <div className="space-y-3 max-w-full">
      {lines.map((line, idx) => {
        // Bullet points
        if (line.startsWith('* ')) {
          const content = line.slice(2).split('**');
          return (
            <div key={idx} className="flex items-start space-x-2">
              <span className="mt-1">•</span>
              <p className="flex-1">
                {content.map((part, i) =>
                  i % 2 === 1 ? <strong key={i}>{parseMath(part)}</strong> : parseMath(part)
                )}
              </p>
            </div>
          );
        }

        // Regular line with bold
        const parts = line.split('**');
        return (
          <p key={idx}>
            {parts.map((part, i) =>
              i % 2 === 1 ? <strong key={i}>{parseMath(part)}</strong> : parseMath(part)
            )}
          </p>
        );
      })}
    </div>
  );
};

export default SimpleMarkdownRenderer;

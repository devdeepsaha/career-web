import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

/**
 * Splits a string into parts: text vs math ($...$ or $$...$$)
 */
const parseMath = (str) => {
  const regex = /(\$\$.*?\$\$|\$.*?\$)/g;
  const parts = str.split(regex).filter(Boolean);

  return parts.map((part, i) => {
    if (part.startsWith('$$') && part.endsWith('$$')) {
      const content = part.slice(2, -2); // remove $$ delimiters
      return <BlockMath key={i} math={content} />;
    } else if (part.startsWith('$') && part.endsWith('$')) {
      const content = part.slice(1, -1); // remove $ delimiters
      return <InlineMath key={i} math={content} />;
    } else {
      return part;
    }
  });
};

const renderInline = (line, keyPrefix = 'inline') => {
  const parts = String(line || '').replace(/`([^`]+)`/g, '$1').split('**');
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={`${keyPrefix}-${i}`}>{parseMath(part)}</strong> : parseMath(part)
  );
};

const cleanLine = (line) => String(line || '').trim();

const SimpleMarkdownRenderer = ({ text }) => {
  if (!text) return null;
  const lines = text.split('\n');

  return (
    <div className="space-y-3 max-w-full">
      {lines.map((line, idx) => {
        const trimmed = cleanLine(line);
        if (!trimmed) return <div key={idx} className="h-1" />;
        if (/^(-{3,}|_{3,}|\*{3,})$/.test(trimmed)) return null;

        const headingMatch = trimmed.match(/^#{1,6}\s+(.+)$/);
        if (headingMatch) {
          return (
            <h4 key={idx} className="text-sm font-bold leading-6 text-slate-950 dark:text-white">
              {renderInline(headingMatch[1], `heading-${idx}`)}
            </h4>
          );
        }

        // Bullet points
        const bulletMatch = trimmed.match(/^[-*•]\s+(.+)$/);
        if (bulletMatch) {
          return (
            <div key={idx} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-60" />
              <p className="min-w-0 flex-1">
                {renderInline(bulletMatch[1], `bullet-${idx}`)}
              </p>
            </div>
          );
        }

        const numberedMatch = trimmed.match(/^(\d+)[.)]\s+(.+)$/);
        if (numberedMatch) {
          return (
            <div key={idx} className="flex items-start gap-2">
              <span className="mt-0.5 min-w-5 rounded bg-slate-100 px-1.5 py-0.5 text-center text-[11px] font-bold tabular-nums text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {numberedMatch[1]}
              </span>
              <p className="min-w-0 flex-1">
                {renderInline(numberedMatch[2], `number-${idx}`)}
              </p>
            </div>
          );
        }

        return (
          <p key={idx}>
            {renderInline(trimmed.replace(/^#+\s*/, '').replace(/\*\*/g, ''), `line-${idx}`)}
          </p>
        );
      })}
    </div>
  );
};

export default SimpleMarkdownRenderer;

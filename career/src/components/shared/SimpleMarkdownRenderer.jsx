import React from 'react';

const SimpleMarkdownRenderer = ({ text }) => {
    // Ensure text is a string before splitting
    const safeText = typeof text === 'string' ? text : '';
    const lines = safeText.split('\n');

    return (
        <div className="space-y-2">
            {lines.map((line, i) => {
                if (line.startsWith('* ')) {
                    const lineContent = line.substring(2);
                    const parts = lineContent.split('**');
                    return (
                        <div key={i} className="flex items-start">
                            <span className="mr-2 mt-1">•</span>
                            <p>{parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}</p>
                        </div>
                    );
                }
                const parts = line.split('**');
                return <p key={i}>{parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}</p>;
            })}
        </div>
    );
};

export default SimpleMarkdownRenderer;
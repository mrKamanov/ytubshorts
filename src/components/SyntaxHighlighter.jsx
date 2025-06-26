import React from 'react';

const SyntaxHighlighter = ({ code, theme = 'dark' }) => {
  const highlightSyntax = (text) => {
    if (!text || text.trim() === '') return [];
    const tokens = [];
    let currentIndex = 0;
    const getThemeColors = (theme) => {
      if (theme === 'dark') {
        return {
          htmlTags: 'text-blue-400',
          cssProps: 'text-purple-400',
          cssValues: 'text-yellow-300',
          keywords: 'text-purple-400',
          strings: 'text-green-300',
          numbers: 'text-orange-400',
          comments: 'text-gray-500',
          selectors: 'text-cyan-400',
          atRules: 'text-pink-400',
          functions: 'text-blue-300',
          default: 'text-gray-300'
        };
      } else {
        return {
          htmlTags: 'text-blue-600',
          cssProps: 'text-purple-600',
          cssValues: 'text-orange-600',
          keywords: 'text-purple-700',
          strings: 'text-green-600',
          numbers: 'text-red-600',
          comments: 'text-gray-500',
          selectors: 'text-cyan-700',
          atRules: 'text-pink-600',
          functions: 'text-blue-700',
          default: 'text-gray-800'
        };
      }
    };
    const colors = getThemeColors(theme);
    const patterns = [
      { regex: /<\/?[a-zA-Z][^>]*>/g, className: colors.htmlTags },
      { regex: /\b[a-zA-Z-]+\s*:/g, className: colors.cssProps },
      { regex: /:\s*[^;{}]+/g, className: colors.cssValues },
      { regex: /\b(function|const|let|var|class|if|else|for|while|return|import|export|async|await|true|false|null|undefined)\b/g, className: colors.keywords },
      { regex: /"[^"]*"|'[^']*'|`[^`]*`/g, className: colors.strings },
      { regex: /\b\d+(\.\d+)?\b/g, className: colors.numbers },
      { regex: /\/\/.*$/gm, className: colors.comments },
      { regex: /\/\*[\s\S]*?\*\//g, className: colors.comments },
      { regex: /\.[a-zA-Z-_][a-zA-Z0-9-_]*|#[a-zA-Z-_][a-zA-Z0-9-_]*/g, className: colors.selectors },
      { regex: /@[a-zA-Z-]+/g, className: colors.atRules },
      { regex: /\b[a-zA-Z_$][a-zA-Z0-9_$]*\s*\(/g, className: colors.functions },
    ];
    const lines = text.split('\n');
    return lines.map((line, lineIndex) => {
      if (!line.trim()) {
        return <div key={lineIndex} className="h-4"></div>;
      }
      let processedLine = line;
      const highlights = [];
      patterns.forEach(({ regex, className }) => {
        let match;
        regex.lastIndex = 0;
        while ((match = regex.exec(line)) !== null) {
          highlights.push({
            start: match.index,
            end: match.index + match[0].length,
            className,
            text: match[0]
          });
        }
      });
      highlights.sort((a, b) => a.start - b.start);
      const mergedHighlights = [];
      let lastEnd = 0;
      highlights.forEach(highlight => {
        if (highlight.start >= lastEnd) {
          mergedHighlights.push(highlight);
          lastEnd = highlight.end;
        }
      });
      const elements = [];
      let position = 0;
      mergedHighlights.forEach((highlight, index) => {
        if (position < highlight.start) {
          const plainText = line.slice(position, highlight.start);
          if (plainText) {
            elements.push(
              <span key={`plain-${lineIndex}-${index}`} className={colors.default}>
                {plainText}
              </span>
            );
          }
        }
        elements.push(
          <span key={`highlight-${lineIndex}-${index}`} className={highlight.className}>
            {highlight.text}
          </span>
        );
        position = highlight.end;
      });
      if (position < line.length) {
        const remainingText = line.slice(position);
        if (remainingText) {
          elements.push(
            <span key={`remaining-${lineIndex}`} className={colors.default}>
              {remainingText}
            </span>
          );
        }
      }
      if (elements.length === 0) {
        elements.push(
          <span key={`line-${lineIndex}`} className={colors.default}>
            {line}
          </span>
        );
      }
      return (
        <div key={lineIndex} className="leading-tight">
          {elements}
        </div>
      );
    });
  };
  return <div>{highlightSyntax(code)}</div>;
};

export default SyntaxHighlighter; 
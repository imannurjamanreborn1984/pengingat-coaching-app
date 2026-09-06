"use client";

import React from 'react';

/**
 * Komponen FormattedMarkdown
 * Mengubah raw text / markdown (bold **, italic *, bullet lists, numbered lists, blockquote, line breaks)
 * menjadi tampilan tipografi ilmiah/kitab yang rapi dengan line-height nyaman (1.5 - 1.6) dan bebas "wall of text".
 */
export default function FormattedMarkdown({ content = "", className = "", isKitab = true }) {
  if (!content) return null;

  // Split text menjadi paragraf berdasarkan double newline atau single newline yang signifikan
  const rawParagraphs = content
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean);

  // Helper untuk memproses inline markdown: **bold**, *italic*, `code`
  const renderInline = (text) => {
    // Pecah berdasarkan token markdown
    const parts = [];
    let remaining = text;
    let keyIdx = 0;

    // Regex untuk **bold**, *italic*, `code`
    const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
    let match;
    let lastIndex = 0;

    while ((match = regex.exec(text)) !== null) {
      // Teks sebelum match
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      const token = match[0];
      if (token.startsWith('**') && token.endsWith('**')) {
        parts.push(
          <strong key={`b-${keyIdx++}`} className={isKitab ? "font-bold text-[#26150a]" : "font-bold text-slate-100"}>
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith('*') && token.endsWith('*')) {
        parts.push(
          <em key={`i-${keyIdx++}`} className="italic">
            {token.slice(1, -1)}
          </em>
        );
      } else if (token.startsWith('`') && token.endsWith('`')) {
        parts.push(
          <code key={`c-${keyIdx++}`} className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-800 text-[11px] font-mono">
            {token.slice(1, -1)}
          </code>
        );
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div className={`space-y-3 leading-[1.65] text-xs sm:text-sm ${className}`}>
      {rawParagraphs.map((para, pIdx) => {
        // Cek jika seluruh baris adalah list (bullet point)
        const lines = para.split('\n').map(l => l.trim()).filter(Boolean);
        const isBulletList = lines.length > 0 && lines.every(l => /^[-*•]\s+/.test(l));
        const isNumberedList = lines.length > 0 && lines.every(l => /^\d+[\.)]\s+/.test(l));
        const isBlockquote = para.startsWith('>');

        if (isBulletList) {
          return (
            <ul key={pIdx} className="space-y-1.5 pl-4 list-disc list-outside my-2">
              {lines.map((line, lIdx) => (
                <li key={lIdx} className="pl-1">
                  {renderInline(line.replace(/^[-*•]\s+/, ''))}
                </li>
              ))}
            </ul>
          );
        }

        if (isNumberedList) {
          return (
            <ol key={pIdx} className="space-y-1.5 pl-4 list-decimal list-outside my-2 font-medium">
              {lines.map((line, lIdx) => (
                <li key={lIdx} className="pl-1">
                  {renderInline(line.replace(/^\d+[\.)]\s+/, ''))}
                </li>
              ))}
            </ol>
          );
        }

        if (isBlockquote) {
          const quoteText = para.replace(/^>\s*/gm, '');
          return (
            <blockquote
              key={pIdx}
              className={`my-3 p-3.5 rounded-xl border-l-4 italic ${
                isKitab
                  ? 'bg-[#faf2e3] border-[#b38b42] text-[#3d2514]'
                  : 'bg-slate-900 border-emerald-500 text-slate-300'
              }`}
            >
              {renderInline(quoteText)}
            </blockquote>
          );
        }

        // Paragraf biasa
        return (
          <p key={pIdx} className="leading-relaxed">
            {lines.map((line, lIdx) => (
              <React.Fragment key={lIdx}>
                {renderInline(line)}
                {lIdx < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

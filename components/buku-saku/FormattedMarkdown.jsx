"use client";

import React from 'react';

/**
 * Komponen FormattedMarkdown
 * Mengubah raw text / markdown (headings, bold, italic, lists, blockquote, teks Arab)
 * menjadi tampilan tipografi kitab klasik yang mewah dengan teks Arab besar & bersyakal jelas.
 */
export default function FormattedMarkdown({ content = "", className = "", isKitab = true, arabicScale = "base" }) {
  if (!content) return null;

  // Split text menjadi paragraf berdasarkan double newline atau single newline yang signifikan
  const rawParagraphs = content
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean);

  // Helper untuk memformat potongan teks Arab inline (1.5x lebih besar ala Traditional Arabic 18-20pt vs Latin 11-12pt)
  const formatArabicInline = (plainText, keyPrefix = "ar") => {
    if (typeof plainText !== "string") return plainText;
    if (!/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(plainText)) {
      return plainText;
    }

    // Regex mencocokkan teks Arab, baik di dalam kurung (فَرْعٌ) maupun potongan frasa Arab biasa
    const tokenRegex = /(\(\s*[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\d،؛؟ـ\.\,\:\-]+\s*\)|[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+(?:[\s،؛؟ـ]+[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+)*)/g;

    const segments = [];
    let lastIdx = 0;
    let match;
    let subKey = 0;

    while ((match = tokenRegex.exec(plainText)) !== null) {
      if (match.index > lastIdx) {
        segments.push(plainText.substring(lastIdx, match.index));
      }
      const arabicPart = match[0];
      segments.push(
        <span
          key={`${keyPrefix}-${subKey++}`}
          dir="rtl"
          className="inline-block font-serif text-[1.45em] sm:text-[1.55em] font-medium text-[#7a1818] px-1 align-baseline select-text"
          style={{
            fontFamily: "'Amiri', 'Traditional Arabic', 'Scheherazade New', 'Noto Naskh Arabic', serif",
            lineHeight: "1.4",
            verticalAlign: "-0.1em"
          }}
        >
          {arabicPart}
        </span>
      );
      lastIdx = tokenRegex.lastIndex;
    }

    if (lastIdx < plainText.length) {
      segments.push(plainText.substring(lastIdx));
    }

    return segments.length > 0 ? segments : plainText;
  };

  // Helper untuk memproses inline markdown: **bold**, *italic*, `code` & inline Arabic
  const renderInline = (text, keyPrefix = "inl") => {
    if (typeof text !== "string") return text;
    const parts = [];
    let keyIdx = 0;
    const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
    let match;
    let lastIndex = 0;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        const plainSegment = text.substring(lastIndex, match.index);
        parts.push(formatArabicInline(plainSegment, `${keyPrefix}-p-${keyIdx++}`));
      }

      const token = match[0];
      if (token.startsWith('**') && token.endsWith('**')) {
        const inner = token.slice(2, -2);
        parts.push(
          <strong key={`b-${keyIdx++}`} className={isKitab ? "font-bold text-[#26150a]" : "font-bold text-slate-100"}>
            {formatArabicInline(inner, `${keyPrefix}-b-${keyIdx}`)}
          </strong>
        );
      } else if (token.startsWith('*') && token.endsWith('*')) {
        const inner = token.slice(1, -1);
        parts.push(
          <em key={`i-${keyIdx++}`} className="italic">
            {formatArabicInline(inner, `${keyPrefix}-i-${keyIdx}`)}
          </em>
        );
      } else if (token.startsWith('`') && token.endsWith('`')) {
        parts.push(
          <code key={`c-${keyIdx++}`} className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-900 text-[11px] font-mono">
            {token.slice(1, -1)}
          </code>
        );
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      const remaining = text.substring(lastIndex);
      parts.push(formatArabicInline(remaining, `${keyPrefix}-end-${keyIdx++}`));
    }

    return parts.length > 0 ? parts : formatArabicInline(text, keyPrefix);
  };

  // Deteksi apakah teks mayoritas adalah huruf Arab murni (bukan teks Sunda/Indonesia yang memuat istilah Arab)
  const isArabicBlock = (text) => {
    const arabicMatches = text.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g) || [];
    const latinMatches = text.match(/[a-zA-Z]/g) || [];

    // Jika huruf Latin lebih banyak daripada huruf Arab, sudah pasti ini penjelasan (Sunda/Indonesia)
    if (latinMatches.length >= arabicMatches.length) return false;

    const totalLetters = arabicMatches.length + latinMatches.length;
    if (totalLetters < 6) return false;

    // Harus mayoritas mutlak (> 65%) berupa huruf Arab
    return (arabicMatches.length / totalLetters) > 0.65;
  };

  // Ukuran font Arab berdasarkan scale
  const getArabicFontSize = () => {
    switch (arabicScale) {
      case 'xl':
      case '2xl':
        return 'text-3xl sm:text-4xl md:text-5xl leading-[2.5] tracking-wide';
      case 'lg':
        return 'text-2xl sm:text-3xl md:text-4xl leading-[2.3] tracking-wide';
      case 'base':
      default:
        return 'text-xl sm:text-2xl md:text-3xl leading-[2.2] tracking-wide';
    }
  };

  return (
    <div className={`space-y-4 leading-[1.7] text-xs sm:text-sm ${className}`}>
      {rawParagraphs.map((para, pIdx) => {
        const lines = para.split('\n').map(l => l.trim()).filter(Boolean);

        // 1. HEADINGS (###, ####, ##, #)
        if (para.startsWith('##### ')) {
          return (
            <h5 key={pIdx} className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#8b1e1e] pt-3 pb-1 border-b border-[#dfcfb0]/60">
              {renderInline(para.replace(/^#####\s+/, ''))}
            </h5>
          );
        }

        if (para.startsWith('#### ')) {
          return (
            <h4 key={pIdx} className="text-sm sm:text-base font-bold text-[#3a2211] pt-3 pb-1 font-kitab-title">
              {renderInline(para.replace(/^####\s+/, ''))}
            </h4>
          );
        }

        if (para.startsWith('### ')) {
          return (
            <h3 key={pIdx} className="text-base sm:text-lg font-black text-[#8b1e1e] pt-4 pb-2 border-b-2 border-[#cbb38b] font-kitab-title flex items-center gap-2">
              {renderInline(para.replace(/^###\s+/, ''))}
            </h3>
          );
        }

        if (para.startsWith('## ')) {
          return (
            <h2 key={pIdx} className="text-lg sm:text-xl font-black text-[#26150a] pt-4 pb-2 border-b-2 border-[#8f632d] font-kitab-title">
              {renderInline(para.replace(/^##\s+/, ''))}
            </h2>
          );
        }

        if (para.startsWith('# ')) {
          return (
            <h1 key={pIdx} className="text-xl sm:text-2xl font-black text-[#26150a] pt-4 pb-2 border-b-2 border-[#8f632d] font-kitab-title">
              {renderInline(para.replace(/^#\s+/, ''))}
            </h1>
          );
        }

        if (para === '---' || para === '***') {
          return <hr key={pIdx} className="border-t border-[#d8c3a1] my-4" />;
        }

        // 2. TEKS ARAB BLOK (Otomatis Diberi Frame Khusus Mushaf & Font Besar)
        if (isArabicBlock(para)) {
          return (
            <div
              key={pIdx}
              dir="rtl"
              className={`my-4 p-5 sm:p-7 rounded-2xl bg-[#fdfaf3] border-2 border-[#cbb38b] shadow-xs text-right font-serif text-[#26150a] selection:bg-amber-200 ${getArabicFontSize()}`}
              style={{ fontFamily: "'Amiri', 'Traditional Arabic', 'Scheherazade New', 'Noto Naskh Arabic', serif" }}
            >
              {lines.map((line, lIdx) => (
                <p key={lIdx} className="my-1">
                  {line}
                </p>
              ))}
            </div>
          );
        }

        // 3. BULLET LIST
        const isBulletList = lines.length > 0 && lines.every(l => /^[-*•]\s+/.test(l));
        if (isBulletList) {
          return (
            <ul key={pIdx} className="space-y-2 pl-5 list-disc list-outside my-2 text-[#3d2514]">
              {lines.map((line, lIdx) => (
                <li key={lIdx} className="pl-1 leading-loose">
                  {renderInline(line.replace(/^[-*•]\s+/, ''), `ul-${pIdx}-${lIdx}`)}
                </li>
              ))}
            </ul>
          );
        }

        // 4. NUMBERED LIST
        const isNumberedList = lines.length > 0 && lines.every(l => /^\d+[\.)]\s+/.test(l));
        if (isNumberedList) {
          return (
            <ol key={pIdx} className="space-y-2 pl-5 list-decimal list-outside my-2 font-medium text-[#3d2514]">
              {lines.map((line, lIdx) => (
                <li key={lIdx} className="pl-1 leading-loose">
                  {renderInline(line.replace(/^\d+[\.)]\s+/, ''), `ol-${pIdx}-${lIdx}`)}
                </li>
              ))}
            </ol>
          );
        }

        // 5. BLOCKQUOTE
        if (para.startsWith('>')) {
          const quoteText = para.replace(/^>\s*/gm, '');
          const isQuoteArabic = isArabicBlock(quoteText);
          return (
            <blockquote
              key={pIdx}
              dir={isQuoteArabic ? "rtl" : "ltr"}
              className={`my-3 p-4 rounded-xl border-l-4 ${
                isQuoteArabic
                  ? `text-right bg-[#fdfaf3] border-[#8b1e1e] text-[#26150a] font-serif ${getArabicFontSize()}`
                  : `italic bg-[#faf2e3] border-[#b38b42] text-[#3d2514] leading-loose`
              }`}
              style={isQuoteArabic ? { fontFamily: "'Amiri', 'Traditional Arabic', serif" } : {}}
            >
              {renderInline(quoteText, `bq-${pIdx}`)}
            </blockquote>
          );
        }

        // 6. PARAGRAF BIASA
        return (
          <p key={pIdx} className="leading-loose sm:leading-[2.1] text-[#3d2514]">
            {lines.map((line, lIdx) => (
              <React.Fragment key={lIdx}>
                {renderInline(line, `p-${pIdx}-${lIdx}`)}
                {lIdx < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

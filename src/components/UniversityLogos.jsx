/* eslint-disable react-refresh/only-export-components */
import React from 'react';

/**
 * University Logos — SVG-based professional academic logos
 * Each logo: colored circle + university abbreviation in white bold text
 * Supports: size prop, className, subtle shadow & border
 *
 * Elite Software Company — Qatar University Advisor
 */

export const universityLogos = {
  qu:             { abbr: 'QU',    color: '#8A1538', nameAr: 'جامعة قطر',                           nameEn: 'Qatar University' },
  hbku:           { abbr: 'HBKU',  color: '#1B365D', nameAr: 'جامعة حمد بن خليفة',                  nameEn: 'Hamad Bin Khalifa University' },
  udst:           { abbr: 'UDST',  color: '#00539F', nameAr: 'جامعة الدوحة للعلوم والتكنولوجيا',    nameEn: 'University of Doha for Science & Technology' },
  cmu:            { abbr: 'CMU',   color: '#C41230', nameAr: 'كارنيجي ميلون قطر',                   nameEn: 'Carnegie Mellon University Qatar' },
  wcm:            { abbr: 'WCM',   color: '#B31B1B', nameAr: 'وايل كورنيل للطب',                    nameEn: 'Weill Cornell Medicine Qatar' },
  tamu:           { abbr: 'TAMU',  color: '#500000', nameAr: 'تكساس إي أند أم قطر',                 nameEn: 'Texas A&M University at Qatar' },
  gu:             { abbr: 'GU',    color: '#041E42', nameAr: 'جورجتاون قطر',                        nameEn: 'Georgetown University in Qatar' },
  nu:             { abbr: 'NU',    color: '#4E2A84', nameAr: 'نورثوسترن قطر',                       nameEn: 'Northwestern University in Qatar' },
  vcu:            { abbr: 'VCU',   color: '#000000', accent: '#C5A55A', nameAr: 'فرجينيا كومنولث قطر', nameEn: 'VCUarts Qatar' },
  lusail:         { abbr: 'LU',    color: '#006747', nameAr: 'جامعة لوسيل',                         nameEn: 'Lusail University' },
  abmmc:          { abbr: 'ABM',   color: '#2D5016', nameAr: 'أحمد بن محمد العسكرية',               nameEn: 'Ahmed Bin Mohammed Military College' },
  police:         { abbr: 'PA',    color: '#1a237e', nameAr: 'أكاديمية الشرطة',                     nameEn: 'Police Academy' },
  qaa:            { abbr: 'QAA',   color: '#0277BD', nameAr: 'أكاديمية قطر للطيران',                nameEn: 'Qatar Aeronautical Academy' },
  ccq:            { abbr: 'CCQ',   color: '#E65100', nameAr: 'كلية المجتمع في قطر',                 nameEn: 'Community College of Qatar' },
  hec:            { abbr: 'HEC',   color: '#003366', nameAr: 'HEC Paris قطر',                       nameEn: 'HEC Paris in Qatar' },
  airforce:       { abbr: 'QAF',   color: '#1B5E20', nameAr: 'الكلية الجوية',                       nameEn: 'Qatar Air Force Academy' },
  naval:          { abbr: 'QNA',   color: '#01579B', nameAr: 'الأكاديمية البحرية',                  nameEn: 'Qatar Naval Academy' },
  cyber:          { abbr: 'CSA',   color: '#311B92', nameAr: 'أكاديمية الأمن السيبراني',            nameEn: 'Cybersecurity Academy' },
  doha_institute: { abbr: 'DI',    color: '#4A148C', nameAr: 'معهد الدوحة للدراسات العليا',         nameEn: 'Doha Institute for Graduate Studies' },
  cuq_ulster:     { abbr: 'CUQ',   color: '#AD1457', nameAr: 'كلية CUQ - جامعة ألستر',             nameEn: 'CUQ - Ulster University' },
  barzan:         { abbr: 'BUC',   color: '#BF360C', nameAr: 'كلية برزان الجامعية',                 nameEn: 'Barzan University College' },
  qfba:           { abbr: 'QFBA',  color: '#1A237E', nameAr: 'أكاديمية قطر للمال والأعمال',         nameEn: 'Qatar Finance & Business Academy' },
  ariu:           { abbr: 'ARIU',  color: '#006064', nameAr: 'جامعة الريان الدولية',                nameEn: 'Al Rayyan International University' },
  rlesc:          { abbr: 'RLE',   color: '#D84315', nameAr: 'كلية راس لفان لعلوم الطوارئ والسلامة', nameEn: 'Ras Laffan Emergency & Safety College' },
};

/**
 * Get university logo config by ID
 * @param {string} id - University ID (e.g. 'qu', 'hbku', 'cmu')
 * @returns {{ abbr: string, color: string, nameAr: string, nameEn: string, accent?: string } | null}
 */
export function getUniversityLogo(id) {
  if (!id) return null;
  return universityLogos[id.toLowerCase()] || null;
}

/**
 * UniversityLogo — Professional SVG logo component
 *
 * @param {Object} props
 * @param {string} props.universityId - Key from universityLogos (e.g. 'qu')
 * @param {number} [props.size=48] - Width & height in pixels
 * @param {string} [props.className] - Optional CSS class
 */
export default function UniversityLogo({ universityId, size = 48, className }) {
  const config = getUniversityLogo(universityId);
  if (!config) return null;

  const { abbr, color, accent } = config;
  const r = size / 2;
  const hasAccent = !!accent;

  // Font size scales with logo size; longer abbreviations get smaller text
  const charCount = abbr.length;
  const baseFontRatio = charCount <= 2 ? 0.38 : charCount === 3 ? 0.32 : 0.26;
  const fontSize = Math.round(size * baseFontRatio);

  // Unique IDs for SVG filters (avoid collisions when multiple logos render)
  const shadowId = `shadow-${universityId}-${size}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={config.nameEn}
      style={{ flexShrink: 0 }}
    >
      <defs>
        {/* Subtle drop shadow */}
        <filter id={shadowId} x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy={size * 0.02} stdDeviation={size * 0.03} floodColor="#000" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* Background circle with shadow */}
      <circle
        cx={r}
        cy={r}
        r={r - size * 0.04}
        fill={color}
        filter={`url(#${shadowId})`}
      />

      {/* Thin lighter border ring */}
      <circle
        cx={r}
        cy={r}
        r={r - size * 0.04}
        fill="none"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={size * 0.025}
      />

      {/* Gold accent ring for VCU */}
      {hasAccent && (
        <circle
          cx={r}
          cy={r}
          r={r - size * 0.1}
          fill="none"
          stroke={accent}
          strokeWidth={size * 0.025}
          opacity={0.7}
        />
      )}

      {/* Abbreviation text */}
      <text
        x={r}
        y={r}
        textAnchor="middle"
        dominantBaseline="central"
        fill={hasAccent ? accent : '#FFFFFF'}
        fontSize={fontSize}
        fontWeight="700"
        fontFamily="'Segoe UI','Inter','Helvetica Neue',Arial,sans-serif"
        letterSpacing={charCount <= 2 ? size * 0.02 : 0}
      >
        {abbr}
      </text>
    </svg>
  );
}

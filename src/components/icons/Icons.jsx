// Professional SVG icons for Qatar University Advisor
// Each icon is a clean, modern SVG design

export const UniversityIcon = ({ size = 24, color = '#8A1538' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2L2 7v2h20V7L12 2z" fill={color}/>
    <path d="M4 11v8h3v-8H4zm5 0v8h3v-8H9zm5 0v8h3v-8h-3zm5 0v8h3v-8h-3z" fill={color} opacity="0.7"/>
    <path d="M2 21h20v2H2v-2z" fill={color}/>
  </svg>
);

export const MedicalIcon = ({ size = 24, color = '#DC2626' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z" fill={color} opacity="0.15"/>
    <path d="M12 7v10M7 12h10" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

export const EngineeringIcon = ({ size = 24, color = '#2563EB' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2a3 3 0 00-3 3v1H6a2 2 0 00-2 2v3a3 3 0 006 0V8h4v3a3 3 0 006 0V8a2 2 0 00-2-2h-3V5a3 3 0 00-3-3z" fill={color} opacity="0.2"/>
    <path d="M14.7 14.7L12 17.4l-2.7-2.7M12 17.4V22M5 19h14" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="5" r="2" fill={color}/>
  </svg>
);

export const MilitaryIcon = ({ size = 24, color = '#4B5563' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2l3 6h6l-5 4 2 6-6-4-6 4 2-6-5-4h6l3-6z" fill={color} opacity="0.2"/>
    <path d="M12 2l3 6h6l-5 4 2 6-6-4-6 4 2-6-5-4h6l3-6z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);

export const AviationIcon = ({ size = 24, color = '#0891B2' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill={color}/>
  </svg>
);

export const ScholarshipIcon = ({ size = 24, color = '#C5A55A' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3z" fill={color} opacity="0.2"/>
    <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" stroke={color} strokeWidth="1.5"/>
    <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" fill={color} opacity="0.4"/>
  </svg>
);

export const JobIcon = ({ size = 24, color = '#059669' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M20 7h-4V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2H4a2 2 0 00-2 2v11a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" fill={color} opacity="0.15"/>
    <rect x="8" y="3" width="8" height="4" rx="1" stroke={color} strokeWidth="1.5"/>
    <path d="M2 13h20" stroke={color} strokeWidth="1.5"/>
    <circle cx="12" cy="13" r="2" fill={color}/>
  </svg>
);

export const ChatIcon = ({ size = 24, color = '#8A1538' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" fill={color} opacity="0.15" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const CompareIcon = ({ size = 24, color = '#7C3AED' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0H5a2 2 0 01-2-2v-4m6 6h10a2 2 0 002-2v-4" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M3 9h18M3 15h18" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
  </svg>
);

export const StarIcon = ({ size = 24, color = '#C5A55A', filled = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);

export const SearchIcon = ({ size = 24, color = '#6B7280' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="7" stroke={color} strokeWidth="1.5"/>
    <path d="M16 16l4.5 4.5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const MenuIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M3 6h18M3 12h18M3 18h18" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const SendIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" fill={color}/>
  </svg>
);

export const FilterIcon = ({ size = 20, color = '#8A1538' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Category badge colors
// eslint-disable-next-line react-refresh/only-export-components
export const CATEGORY_COLORS = {
  '\u062d\u0643\u0648\u0645\u064a\u0629': { bg: '#FEF2F2', text: '#8A1538', border: '#FECACA' },
  '\u062f\u0648\u0644\u064a\u0629': { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
  '\u062e\u0627\u0635\u0629': { bg: '#F0FDF4', text: '#059669', border: '#BBF7D0' },
  '\u0639\u0633\u0643\u0631\u064a\u0629': { bg: '#F3F4F6', text: '#374151', border: '#D1D5DB' },
  '\u0623\u0645\u0646\u064a\u0629': { bg: '#F3F4F6', text: '#374151', border: '#D1D5DB' },
  '\u062a\u062e\u0635\u0635\u064a\u0629': { bg: '#FFF7ED', text: '#C2410C', border: '#FED7AA' },
};

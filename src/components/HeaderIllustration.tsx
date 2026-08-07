import React from 'react';

/**
 * Decorative vector illustration for the dashboard header.
 * Pure SVG (no raster asset) so it stays crisp and adds ~0 kB to the bundle.
 * Uses currentColor so it inherits the header foreground token.
 */
const HeaderIllustration = ({ className = '' }: { className?: string }) => (
  <svg
    viewBox="0 0 200 140"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Ilustrasi transaksi agen: uang tunai, kartu, dan ponsel"
    className={className}
  >
    {/* soft backdrop circle */}
    <circle cx="100" cy="70" r="62" fill="currentColor" opacity="0.08" />
    <circle cx="100" cy="70" r="44" fill="currentColor" opacity="0.06" />

    {/* banknote (back) */}
    <rect x="28" y="52" width="86" height="50" rx="9" fill="currentColor" opacity="0.22" transform="rotate(-9 28 52)" />

    {/* banknote (front) */}
    <g transform="rotate(-9 36 62)">
      <rect x="36" y="62" width="86" height="50" rx="9" fill="currentColor" opacity="0.4" />
      <circle cx="79" cy="87" r="13" fill="currentColor" opacity="0.55" />
      <path d="M75 87h8M79 82v10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" opacity="0.9" />
      <rect x="44" y="70" width="16" height="4" rx="2" fill="currentColor" opacity="0.7" />
      <rect x="98" y="100" width="16" height="4" rx="2" fill="currentColor" opacity="0.7" />
    </g>

    {/* smartphone */}
    <g>
      <rect x="118" y="28" width="52" height="86" rx="12" fill="currentColor" opacity="0.5" />
      <rect x="124" y="34" width="40" height="74" rx="8" fill="currentColor" opacity="0.28" />
      <rect x="136" y="30" width="16" height="3" rx="1.5" fill="currentColor" opacity="0.7" />
      {/* mini chart inside the phone */}
      <rect x="131" y="80" width="7" height="18" rx="3" fill="currentColor" opacity="0.85" />
      <rect x="141" y="68" width="7" height="30" rx="3" fill="currentColor" opacity="0.85" />
      <rect x="151" y="56" width="7" height="42" rx="3" fill="currentColor" opacity="0.85" />
      <path d="M131 50h26" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      <path d="M131 58h16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
    </g>

    {/* arrows: setor (down) & tarik (up) */}
    <g stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.9">
      <path d="M96 34v20" />
      <path d="M90 48l6 6 6-6" />
      <path d="M112 126v-20" />
      <path d="M106 112l6-6 6 6" />
    </g>

    {/* coins */}
    <g opacity="0.7">
      <ellipse cx="42" cy="118" rx="15" ry="5.5" fill="currentColor" />
      <ellipse cx="42" cy="112" rx="15" ry="5.5" fill="currentColor" opacity="0.85" />
      <ellipse cx="42" cy="106" rx="15" ry="5.5" fill="currentColor" opacity="0.65" />
    </g>

    {/* sparkles */}
    <g fill="currentColor" opacity="0.8">
      <path d="M172 20l2.2 5.2 5.2 2.2-5.2 2.2-2.2 5.2-2.2-5.2-5.2-2.2 5.2-2.2z" />
      <path d="M24 34l1.5 3.6 3.6 1.5-3.6 1.5L24 44l-1.5-3.4-3.6-1.5 3.6-1.5z" />
    </g>
  </svg>
);

export default HeaderIllustration;

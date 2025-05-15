import React from "react";

const Illustration: React.FC = () => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 1200 800"
    preserveAspectRatio="xMidYMid slice"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="mainGradient" x1="30%" y1="0%" x2="70%" y2="100%">
        <stop offset="0%" stopColor="#1E1B4B" />
        <stop offset="100%" stopColor="#4A1D6F" />
      </linearGradient>

      <radialGradient id="highlightGradient" cx="60%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#5B21B6" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#1E1B4B" stopOpacity="0.2" />
      </radialGradient>

      <filter id="waveShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="15" dy="15" stdDeviation="12" floodColor="#3B0764" />
      </filter>
    </defs>

    <rect width="100%" height="100%" fill="url(#mainGradient)" />

    {/* Основная композиция */}
    <g transform="skewX(-10)" filter="url(#waveShadow)">
      {/* Базовая волна */}
      <path
        d="M-200 650Q50 580 300 720t400-80q250-60 500 40l100 320H-200z"
        fill="url(#highlightGradient)"
        opacity="0.9"
      />

      {/* Контрастная волна */}
      <path
        d="M1200 550Q950 450 700 600t-450-50Q50 700-200 550V800h1400z"
        fill="#7C3AED"
        opacity="0.7"
        style={{ mixBlendMode: "screen" }}
      />
    </g>
Ï
    {/* Глубинные слои */}
    <g opacity="0.4" transform="rotate(5 600 400)">
      <path
        d="M-300 400Q0 350 300 500t600-100q300 50 600-50V800H-300z"
        fill="#3B0764"
      />
    </g>
  </svg>
);

export default Illustration;
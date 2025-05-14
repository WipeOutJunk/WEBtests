import React from "react";

/**
 * Абстрактная SVG‑волна в фиолетовой гамме.
 * Можно заменить на .png / .jpg — просто измените элемент <img>.
 */
const Illustration: React.FC = () => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 800 800"
    preserveAspectRatio="xMidYMid slice"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%"  stopColor="#6366f1" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
    </defs>

    <path
      fill="url(#grad)"
      d="
        M 0 300
        C 150 350, 300 100, 450 150
        C 600 200, 750 450, 900 400
        L 900 800 L 0 800 Z
      "
      opacity="0.85"
    />
  </svg>
);

export default Illustration;

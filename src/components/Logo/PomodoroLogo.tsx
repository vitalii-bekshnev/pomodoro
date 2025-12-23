/**
 * PomodoroLogo component - Programmatic SVG tomato logo
 * Renders a stylized tomato icon with a leaf on top
 */

import React from 'react';
import './PomodoroLogo.css';

interface PomodoroLogoProps {
  size?: number;
  className?: string;
}

export const PomodoroLogo: React.FC<PomodoroLogoProps> = ({ 
  size = 48, 
  className = '' 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Pomodoro Timer Logo"
    >
      {/* Tomato body - main red shape */}
      <ellipse
        cx="50"
        cy="58"
        rx="35"
        ry="38"
        fill="#ff6b6b"
      />
      
      {/* Left tomato lobe */}
      <ellipse
        cx="30"
        cy="50"
        rx="20"
        ry="30"
        fill="#ff5252"
      />
      
      {/* Right tomato lobe */}
      <ellipse
        cx="70"
        cy="50"
        rx="20"
        ry="30"
        fill="#ff5252"
      />
      
      {/* Highlight/shine on tomato */}
      <ellipse
        cx="38"
        cy="45"
        rx="12"
        ry="18"
        fill="#ff8787"
        opacity="0.6"
      />
      
      {/* Stem - brown/green base */}
      <rect
        x="47"
        y="15"
        width="6"
        height="12"
        rx="2"
        fill="#6b8e23"
      />
      
      {/* Leaf - main body */}
      <ellipse
        cx="60"
        cy="18"
        rx="15"
        ry="8"
        fill="#7cb342"
        transform="rotate(-20 60 18)"
      />
      
      {/* Leaf - vein detail */}
      <path
        d="M 48 18 Q 55 18 62 15"
        stroke="#5a8f2a"
        strokeWidth="1.5"
        fill="none"
        opacity="0.7"
      />
      
      {/* Shadow/depth on tomato bottom */}
      <ellipse
        cx="50"
        cy="75"
        rx="28"
        ry="15"
        fill="#e63946"
        opacity="0.4"
      />
      
      {/* Additional shine for 3D effect */}
      <circle
        cx="42"
        cy="48"
        r="6"
        fill="#ffb3b3"
        opacity="0.5"
      />
    </svg>
  );
};


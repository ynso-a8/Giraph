'use client';

import React from 'react';

interface GiraffeFaceProps {
  score: number;
  size?: number;
  className?: string;
}

export default function GiraffeFace({ score, size = 100, className = '' }: GiraffeFaceProps) {
  // Determine mood category
  let mood: 'sad' | 'tired' | 'peaceful' | 'happy' | 'best';
  if (score <= 20) mood = 'sad';
  else if (score <= 40) mood = 'tired';
  else if (score <= 60) mood = 'peaceful';
  else if (score <= 80) mood = 'happy';
  else mood = 'best';

  return (
    <div 
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="transition-all duration-500 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.18)]"
      >
        {/* BACKGROUND GLOWS OR FLOATING PARTICLES */}
        {mood === 'best' && (
          <g className="animate-pulse">
            {/* Sparkle 1 */}
            <path d="M 12 18 L 14 22 L 18 22 L 15 24 L 16 28 L 12 26 L 8 28 L 9 24 L 6 22 L 10 22 Z" fill="#fde047" opacity="0.8" />
            {/* Sparkle 2 */}
            <path d="M 86 16 L 88 20 L 92 20 L 89 22 L 90 26 L 86 24 L 82 26 L 83 22 L 80 20 L 84 20 Z" fill="#fde047" opacity="0.8" />
            {/* Sparkle 3 */}
            <path d="M 88 78 L 89 81 L 92 81 L 90 83 L 91 86 L 88 84 L 85 86 L 86 83 L 84 81 L 87 81 Z" fill="#fde047" opacity="0.8" />
          </g>
        )}

        {/* GIRAFFE NECK */}
        <rect 
          x="36" 
          y="48" 
          width="28" 
          height="45" 
          rx="8" 
          fill={mood === 'sad' ? '#eab308' : '#fbbf24'} // slightly duller yellow for sad
          className="transition-colors duration-500"
        />
        {/* Spot on neck */}
        <circle cx="50" cy="58" r="6" fill="#d97706" opacity="0.9" />
        {mood !== 'sad' && <circle cx="44" cy="74" r="5" fill="#d97706" opacity="0.9" />}
        {mood === 'best' && <circle cx="56" cy="80" r="4.5" fill="#d97706" opacity="0.9" />}

        {/* HORNS */}
        <line x1="43" y1="24" x2="43" y2="10" stroke={mood === 'sad' ? '#eab308' : '#fbbf24'} strokeWidth="4.5" strokeLinecap="round" className="transition-colors duration-500" />
        <line x1="57" y1="24" x2="57" y2="10" stroke={mood === 'sad' ? '#eab308' : '#fbbf24'} strokeWidth="4.5" strokeLinecap="round" className="transition-colors duration-500" />
        <circle cx="43" cy="9" r="4.5" fill="#d97706" />
        <circle cx="57" cy="9" r="4.5" fill="#d97706" />

        {/* EARS - reactive angles */}
        {mood === 'sad' ? (
          /* Drooping ears */
          <g>
            <path d="M 30 32 Q 18 36 24 45 Z" fill="#eab308" className="transition-all duration-500" />
            <path d="M 30 32 Q 18 36 24 45 Z" fill="#ca8a04" opacity="0.3" />
            <path d="M 70 32 Q 82 36 76 45 Z" fill="#eab308" className="transition-all duration-500" />
            <path d="M 70 32 Q 82 36 76 45 Z" fill="#ca8a04" opacity="0.3" />
          </g>
        ) : mood === 'tired' ? (
          /* Slightly droopy, flat ears */
          <g>
            <path d="M 30 30 Q 18 32 25 40 Z" fill="#fbbf24" className="transition-all duration-500" />
            <path d="M 70 30 Q 82 32 75 40 Z" fill="#fbbf24" className="transition-all duration-500" />
          </g>
        ) : (
          /* Normal perky ears */
          <g>
            <path d="M 30 28 Q 20 22 26 34 Z" fill="#fbbf24" className="transition-all duration-500" />
            <path d="M 70 28 Q 80 22 74 34 Z" fill="#fbbf24" className="transition-all duration-500" />
          </g>
        )}

        {/* MAIN HEAD BASE */}
        <rect 
          x="30" 
          y="23" 
          width="40" 
          height="32" 
          rx="13" 
          fill={mood === 'sad' ? '#eab308' : '#fbbf24'} 
          className="transition-colors duration-500"
        />

        {/* MOUTH SNOUT BASE */}
        <rect 
          x="35" 
          y="42" 
          width="30" 
          height="11" 
          rx="5.5" 
          fill={mood === 'sad' ? '#fef08a' : '#fef08a'} 
          opacity="0.95"
        />

        {/* EYES AND EXPRESSIONS */}
        {mood === 'sad' && (
          <g>
            {/* Drooping Crying Eyes */}
            <path d="M 39 34 Q 42 38 45 34" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 55 34 Q 58 38 61 34" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {/* Tears */}
            <path d="M 42 38 C 42 42 40 44 39 44 C 38 44 37 42 39 38 Z" fill="#60a5fa" className="animate-bounce" />
            <path d="M 58 38 C 58 42 60 44 61 44 C 62 44 63 42 61 38 Z" fill="#60a5fa" className="animate-bounce" style={{ animationDelay: '0.2s' }} />
            {/* Sad downturned mouth */}
            <path d="M 46 49 Q 50 46 54 49" stroke="#b45309" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            {/* Nose holes */}
            <circle cx="46" cy="45" r="1" fill="#b45309" opacity="0.6" />
            <circle cx="54" cy="45" r="1" fill="#b45309" opacity="0.6" />
          </g>
        )}

        {mood === 'tired' && (
          <g>
            {/* Straight closed eyes */}
            <line x1="39" y1="35" x2="45" y2="35" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="55" y1="35" x2="61" y2="35" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
            {/* Yawning/Sighing open mouth */}
            <circle cx="50" cy="48" r="2.8" fill="none" stroke="#b45309" strokeWidth="2.2" />
            {/* Sweat drop on the cheek */}
            <path d="M 66 32 C 67 35 66 37 64 37 C 63 37 63 35 65 32 Z" fill="#38bdf8" />
            {/* Nose holes */}
            <circle cx="46" cy="45" r="1" fill="#b45309" opacity="0.6" />
            <circle cx="54" cy="45" r="1" fill="#b45309" opacity="0.6" />
          </g>
        )}

        {mood === 'peaceful' && (
          <g>
            {/* Peaceful standard round eyes */}
            <circle cx="42" cy="35" r="2" fill="#1e293b" />
            <circle cx="58" cy="35" r="2" fill="#1e293b" />
            {/* Small calm flat smile */}
            <path d="M 46 48 Q 50 50 54 48" stroke="#b45309" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Nose holes */}
            <circle cx="45" cy="45" r="1" fill="#b45309" opacity="0.5" />
            <circle cx="55" cy="45" r="1" fill="#b45309" opacity="0.5" />
          </g>
        )}

        {mood === 'happy' && (
          <g>
            {/* Smiling happy arches for eyes */}
            <path d="M 39 36 Q 42 31 45 36" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 55 36 Q 58 31 61 36" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {/* Sweet happy smile */}
            <path d="M 45 47 Q 50 51 55 47" stroke="#b45309" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            {/* Blush cheeks */}
            <circle cx="36" cy="39" r="2.5" fill="#f43f5e" opacity="0.35" />
            <circle cx="64" cy="39" r="2.5" fill="#f43f5e" opacity="0.35" />
            {/* Nose holes */}
            <circle cx="45" cy="45" r="1" fill="#b45309" opacity="0.5" />
            <circle cx="55" cy="45" r="1" fill="#b45309" opacity="0.5" />
          </g>
        )}

        {mood === 'best' && (
          <g>
            {/* Happy laughing arches for eyes */}
            <path d="M 38 35 Q 42 29 46 35" stroke="#1e293b" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 54 35 Q 58 29 62 35" stroke="#1e293b" strokeWidth="3" fill="none" strokeLinecap="round" />
            {/* Open laughing mouth with pink tongue */}
            <path d="M 44 46 Q 50 54 56 46 Z" fill="#e11d48" />
            <path d="M 46 47 Q 50 52 54 47 Z" fill="#f43f5e" />
            {/* Cute blushing cheeks */}
            <circle cx="34" cy="38" r="4.5" fill="#f43f5e" opacity="0.5" />
            <circle cx="66" cy="38" r="4.5" fill="#f43f5e" opacity="0.5" />
            {/* Nose holes */}
            <circle cx="45" cy="44" r="0.8" fill="#ffffff" opacity="0.8" />
            <circle cx="55" cy="44" r="0.8" fill="#ffffff" opacity="0.8" />
          </g>
        )}
      </svg>
    </div>
  );
}

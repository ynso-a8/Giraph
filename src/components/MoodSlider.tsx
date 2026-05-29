'use client';

import React from 'react';
import { getMoodState } from '@/lib/moodService';
import GiraffeFace from './GiraffeFace';

interface MoodSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export default function MoodSlider({ value, onChange }: MoodSliderProps) {
  const currentMood = getMoodState(value);

  return (
    <div className="w-full flex flex-col items-center gap-6 p-6 rounded-3xl border border-white/5 bg-zinc-900/10 backdrop-blur-sm shadow-inner transition-all duration-300">
      <div className="flex flex-col items-center gap-2">
        <div className="transform transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer">
          <GiraffeFace score={value} size={90} />
        </div>
        <h3 className={`text-sm font-bold tracking-wide mt-2 ${currentMood.color} transition-colors duration-300`}>
          {currentMood.label} {value}점
        </h3>
        <p className="text-[10px] text-zinc-500 text-center max-w-xs transition-opacity duration-300 leading-relaxed font-semibold">
          {currentMood.description}
        </p>
      </div>

      <div className="w-full px-2 mt-4">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-[var(--color-bg-slider,#27272a)] focus:outline-none transition-all duration-300"
          style={{
            background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${value}%, var(--color-bg-slider, #27272a) ${value}%, var(--color-bg-slider, #27272a) 100%)`,
            accentColor: 'var(--color-primary)',
          }}
        />
        <div className="flex justify-between text-[10px] text-zinc-500 mt-2 font-medium">
          <span>최저 0</span>
          <span>보통 50</span>
          <span>최고 100</span>
        </div>
      </div>
    </div>
  );
}

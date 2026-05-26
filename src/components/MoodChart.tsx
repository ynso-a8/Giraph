'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { MoodLog, getMoodState } from '@/lib/moodService';
import { Calendar, AlertCircle } from 'lucide-react';
import GiraffeFace from './GiraffeFace';

interface MoodChartProps {
  logs: MoodLog[];
}

type FilterType = '7days' | '30days' | 'all';
type ChartType = 'line' | 'bar';

// Custom Giraffe Head Dot Component for Line Chart
const GiraffeDot = (props: any) => {
  const { cx, cy } = props;
  if (!cx || !cy) return null;

  return (
    <svg x={cx - 10} y={cy - 14} width="20" height="20" viewBox="0 0 24 24" className="filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]">
      {/* Horns */}
      <line x1="9" y1="5" x2="9" y2="1" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="15" y1="5" x2="15" y2="1" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="9" cy="1.5" r="1.5" fill="#d97706" />
      <circle cx="15" cy="1.5" r="1.5" fill="#d97706" />
      {/* Ears */}
      <path d="M 6 6 Q 3 3 5 8 Z" fill="#fbbf24" />
      <path d="M 18 6 Q 21 3 19 8 Z" fill="#fbbf24" />
      {/* Head */}
      <rect x="6" y="5" width="12" height="10" rx="4" fill="#fbbf24" />
      {/* Eyes */}
      <circle cx="9.5" cy="9.5" r="1" fill="#1e293b" />
      <circle cx="14.5" cy="9.5" r="1" fill="#1e293b" />
      {/* Snout */}
      <rect x="8" y="11.5" width="8" height="3" rx="1.5" fill="#fef08a" />
    </svg>
  );
};

// Custom Giraffe Neck Bar Component for Bar Chart
const GiraffeNeckBar = (props: any) => {
  const { x, y, width, height, payload } = props;
  if (height <= 0) return null;

  // Let's set a standard proportion based on emoji head size S
  const S = 64; // Emoji head container size
  const neckWidth = 0.28 * S; // 17.92px (Perfect giraffe neck width to match emoji)
  
  // Center-align the neck relative to the chart bar space
  const neckX = x + (width - neckWidth) / 2;
  
  // Horizontal offset for head centering: neck is at 36% of 100px canvas in GiraffeFace
  const headX = neckX - 0.36 * S;
  
  // Vertical offset: head's neck starts at 48% of S.
  // We place the head so its neck starts exactly at the top of the bar neck (y).
  const headY = y - 0.48 * S; 

  const moodScore = payload ? payload.mood_score : 50;

  return (
    <g>
      {/* Giraffe Head Render centered exactly on the neck bar */}
      <foreignObject
        x={headX}
        y={headY}
        width={S}
        height={S}
      >
        <GiraffeFace score={moodScore} size={S} />
      </foreignObject>

      {/* Main Neck Column - perfectly matching the emoji neck width! */}
      <rect
        x={neckX}
        y={y}
        width={neckWidth}
        height={height}
        fill="#fbbf24"
        rx={neckWidth / 4}
        className="filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.12)]"
      />

      {/* Spots on neck column */}
      {height > 18 && (
        <svg x={neckX} y={y} width={neckWidth} height={height}>
          <circle cx={neckWidth * 0.3} cy={height * 0.25} r={Math.min(neckWidth * 0.15, 2.5)} fill="#d97706" />
          <circle cx={neckWidth * 0.7} cy={height * 0.45} r={Math.min(neckWidth * 0.18, 3)} fill="#d97706" />
          <circle cx={neckWidth * 0.35} cy={height * 0.7} r={Math.min(neckWidth * 0.15, 2.5)} fill="#d97706" />
          {height > 45 && (
            <>
              <circle cx={neckWidth * 0.68} cy={height * 0.85} r={Math.min(neckWidth * 0.16, 2.8)} fill="#d97706" />
              <circle cx={neckWidth * 0.32} cy={height * 0.55} r={Math.min(neckWidth * 0.14, 2.2)} fill="#d97706" />
            </>
          )}
        </svg>
      )}
    </g>
  );
};

export default function MoodChart({ logs }: MoodChartProps) {
  const [filter, setFilter] = useState<FilterType>('7days');
  const [chartType, setChartType] = useState<ChartType>('line');
  const [themeToken, setThemeToken] = useState('lavender');

  // Monitor theme switching to force re-render charts beautifully
  useEffect(() => {
    const handleThemeChange = () => {
      setThemeToken(localStorage.getItem('mood_tracker_theme') || 'lavender');
    };
    window.addEventListener('theme-changed', handleThemeChange);
    handleThemeChange(); // Init
    return () => window.removeEventListener('theme-changed', handleThemeChange);
  }, []);

  // Filter logs and sort chronologically (oldest to newest)
  const filteredData = useMemo(() => {
    const sorted = [...logs].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const now = new Date();
    if (filter === '7days') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      return sorted.filter((log) => new Date(log.created_at) >= sevenDaysAgo);
    } else if (filter === '30days') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      return sorted.filter((log) => new Date(log.created_at) >= thirtyDaysAgo);
    }
    return sorted;
  }, [logs, filter]);

  // Format data for chart
  const chartData = useMemo(() => {
    return filteredData.map((log) => {
      const date = new Date(log.created_at);
      return {
        ...log,
        formattedDate: `${date.getMonth() + 1}/${date.getDate()}`,
        fullDate: date.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      };
    });
  }, [filteredData]);

  // Theme primary color retriever
  const getPrimaryColor = () => {
    switch (themeToken) {
      case 'sunset': return '#f97316';
      case 'forest': return '#10b981';
      case 'milktea': return '#d97706';
      default: return '#8b5cf6';
    }
  };

  const primaryColor = getPrimaryColor();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as MoodLog & { fullDate: string };
      const mood = getMoodState(data.mood_score);

      return (
        <div className="p-4 rounded-2xl border border-white/10 bg-zinc-950/95 backdrop-blur-md shadow-2xl text-[11px] max-w-[240px] text-zinc-300">
          <p className="font-semibold text-zinc-500 mb-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {data.fullDate}
          </p>
          <div className="flex items-center gap-2 my-2 border-b border-zinc-900 pb-2">
            <span className="text-3xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
              {mood.emoji.replace('🦒', '')}
            </span>
            <div>
              <p className="font-black text-xs text-white">{data.mood_score}점</p>
              <p className={`font-bold text-[10px] ${mood.color}`}>{mood.label}</p>
            </div>
          </div>
          {data.reason && (
            <p className="leading-relaxed">
              <span className="text-zinc-500 font-bold">오늘의 이유: </span>
              {data.reason}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full p-6 rounded-3xl border border-white/5 bg-zinc-900/10 backdrop-blur-sm shadow-xl flex flex-col gap-5">
      {/* Chart Headers and Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">기래프 마음 도식화</h3>
            <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">기록된 나날의 감정 흐름을 관찰해보세요.</p>
          </div>

          {/* Chart visual style toggle */}
          <div className="flex bg-zinc-900/60 p-1.5 rounded-2xl border border-zinc-800/80">
            <button
              onClick={() => setChartType('line')}
              className={`text-[10px] font-bold px-3 py-1 rounded-xl transition-all cursor-pointer ${
                chartType === 'line'
                  ? 'bg-[var(--color-primary)] text-white shadow-md'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              선그래프
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`text-[10px] font-bold px-3 py-1 rounded-xl transition-all cursor-pointer ${
                chartType === 'bar'
                  ? 'bg-[var(--color-primary)] text-white shadow-md'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              막대그래프
            </button>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex bg-zinc-900/40 p-1 rounded-xl border border-zinc-800/40 self-end">
          {(
            [
              { id: '7days', label: '7일' },
              { id: '30days', label: '30일' },
              { id: 'all', label: '전체' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`text-[10px] font-bold px-3.5 py-1 rounded-lg transition-all duration-300 cursor-pointer ${
                filter === item.id
                  ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20'
                  : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="h-64 w-full flex items-center justify-center mt-2">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <AreaChart
                key={`line-${themeToken}`}
                data={chartData}
                margin={{ top: 12, right: 10, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={primaryColor} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f1f2e" opacity={0.3} />
                <XAxis
                  dataKey="formattedDate"
                  stroke="#52525b"
                  fontSize={10}
                  fontWeight="bold"
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  stroke="#52525b"
                  fontSize={10}
                  fontWeight="bold"
                  tickLine={false}
                  axisLine={false}
                  dx={-5}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3f3f46', strokeWidth: 1 }} />
                <ReferenceLine y={50} stroke="#3f3f46" strokeDasharray="5 5" strokeOpacity={0.5} />
                <Area
                  type="monotone"
                  dataKey="mood_score"
                  stroke={primaryColor}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorMood)"
                  dot={<GiraffeDot />}
                  activeDot={{ r: 8, fill: '#fbbf24', stroke: '#d97706', strokeWidth: 2 }}
                />
              </AreaChart>
            ) : (
              <BarChart
                key={`bar-${themeToken}`}
                data={chartData}
                margin={{ top: 18, right: 10, left: -25, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f1f2e" opacity={0.3} />
                <XAxis
                  dataKey="formattedDate"
                  stroke="#52525b"
                  fontSize={10}
                  fontWeight="bold"
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  stroke="#52525b"
                  fontSize={10}
                  fontWeight="bold"
                  tickLine={false}
                  axisLine={false}
                  dx={-5}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <ReferenceLine y={50} stroke="#3f3f46" strokeDasharray="5 5" strokeOpacity={0.5} />
                <Bar
                  dataKey="mood_score"
                  shape={<GiraffeNeckBar />}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center text-center gap-3 text-zinc-500">
            <AlertCircle className="w-10 h-10 text-zinc-700 animate-bounce" />
            <div>
              <p className="font-bold text-xs text-zinc-400">기래프 데이터가 부족합니다</p>
              <p className="text-[10px] text-zinc-500 mt-1 max-w-[200px] leading-relaxed">
                기록된 기분이 없습니다. 기-log 탭에서 기린 심장 스티커와 오늘의 기분을 채워주세요.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

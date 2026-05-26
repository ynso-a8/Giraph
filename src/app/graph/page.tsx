'use client';

import React, { useState, useEffect } from 'react';
import MoodChart from '@/components/MoodChart';
import { moodService, MoodLog, getMoodState } from '@/lib/moodService';
import { BarChart3, ArrowUpRight, ArrowDownRight, Sparkles, AlertCircle } from 'lucide-react';

export default function GraphPage() {
  const [logs, setLogs] = useState<MoodLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const fetched = await moodService.getMoodLogs();
        setLogs(fetched);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const stats = React.useMemo(() => {
    if (logs.length === 0) return null;

    const scores = logs.map((l) => l.mood_score);
    const average = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);

    return {
      average,
      highest,
      lowest,
      count: logs.length,
    };
  }, [logs]);

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-white/5 pb-4">
        <span className="text-[10px] font-bold text-[var(--color-primary)] tracking-wider uppercase">
          기래프 마음 도식관
        </span>
        <h1 className="text-lg font-black text-white tracking-tight">나의 감정 트렌드</h1>
        <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">기록을 토대로 기래프의 목 길이와 표정이 채워집니다.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-3 text-zinc-600">
          <div className="w-6 h-6 rounded-full border-2 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] animate-spin" />
          <p className="text-[10px] font-bold text-zinc-500">마음 기록들을 엮는 중...</p>
        </div>
      ) : (
        <>
          {/* Custom Mood Chart (with Line/Bar giraffe shapes) */}
          <MoodChart logs={logs} />

          {/* Emotional Statistics Summary */}
          {stats ? (
            <div className="flex flex-col gap-3.5">
              <h3 className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-[var(--color-primary)]" />
                기래프 마음 종합 요약
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {/* Average Score */}
                <div className="p-4 rounded-3xl border border-white/5 bg-zinc-900/10 backdrop-blur-sm flex flex-col gap-1.5">
                  <span className="text-[9px] font-bold text-zinc-500">평균 감정 점수</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-black text-white">{stats.average}</span>
                    <span className="text-[10px] text-zinc-500 font-bold">/ 100점</span>
                  </div>
                  <span className={`text-[9px] font-bold ${getMoodState(stats.average).color}`}>
                    {getMoodState(stats.average).label} 상태
                  </span>
                </div>

                {/* Total Counts */}
                <div className="p-4 rounded-3xl border border-white/5 bg-zinc-900/10 backdrop-blur-sm flex flex-col gap-1.5">
                  <span className="text-[9px] font-bold text-zinc-500">총 기록 횟수</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-black text-white">{stats.count}</span>
                    <span className="text-[10px] text-zinc-500 font-bold">회</span>
                  </div>
                  <span className="text-[9px] text-zinc-500 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[var(--color-primary)] animate-pulse" />
                    꾸준하게 마음을 그렸어요!
                  </span>
                </div>

                {/* Highest Score */}
                <div className="p-4 rounded-3xl border border-white/5 bg-zinc-900/10 backdrop-blur-sm flex flex-col gap-1.5">
                  <span className="text-[9px] font-bold text-zinc-500">최고 기분</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-3xl select-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
                      {getMoodState(stats.highest).emoji.replace('🦒', '')}
                    </span>
                    <div>
                      <span className="text-base font-black text-white">{stats.highest}점</span>
                      <p className="text-[8px] text-emerald-400 font-bold flex items-center mt-0.5">
                        <ArrowUpRight className="w-3 h-3" /> Peak
                      </p>
                    </div>
                  </div>
                </div>

                {/* Lowest Score */}
                <div className="p-4 rounded-3xl border border-white/5 bg-zinc-900/10 backdrop-blur-sm flex flex-col gap-1.5">
                  <span className="text-[9px] font-bold text-zinc-500">최저 기분</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-3xl select-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
                      {getMoodState(stats.lowest).emoji.replace('🦒', '')}
                    </span>
                    <div>
                      <span className="text-base font-black text-white">{stats.lowest}점</span>
                      <p className="text-[8px] text-rose-400 font-bold flex items-center mt-0.5">
                        <ArrowDownRight className="w-3 h-3" /> Trough
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-[32px] border border-dashed border-zinc-800 bg-zinc-900/5 text-zinc-500 flex flex-col items-center gap-3">
              <AlertCircle className="w-8 h-8 text-zinc-700 animate-pulse" />
              <p className="text-[10px] leading-relaxed">
                종합 요약을 생성하기에 아직 데이터가 부족합니다.<br />
                첫 기분 로그를 달력에 그려보세요!
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

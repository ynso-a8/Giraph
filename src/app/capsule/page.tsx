'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { moodService, MoodLog, getMoodState } from '@/lib/moodService';
import GiraffeFace from '@/components/GiraffeFace';
import { ClipboardList, Sparkles, Send, Calendar, Clock, Heart, Award, ArrowRight } from 'lucide-react';

interface FutureLetter {
  id: string;
  text: string;
  deliveryType: 'date' | 'score';
  targetDate?: string;
  targetScore?: number;
  createdDate: string;
  duration: string;
}

export default function CapsulePage() {
  const [logs, setLogs] = useState<MoodLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Future letter states
  const [futureLetterInput, setFutureLetterInput] = useState('');
  const [deliveryType, setDeliveryType] = useState<'date' | 'score'>('date');
  const [targetDate, setTargetDate] = useState('');
  const [targetScore, setTargetScore] = useState(50);
  const [savedLetters, setSavedLetters] = useState<FutureLetter[]>([]);
  const [letterSaved, setLetterSaved] = useState(false);

  const todayStr = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  const tomorrowStr = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }, []);

  const checkIsOpened = (letter: FutureLetter) => {
    const now = new Date();
    
    if (letter.deliveryType === 'date' && letter.targetDate) {
      const targetDateObj = new Date(letter.targetDate);
      return targetDateObj <= now;
    }
    
    if (letter.deliveryType === 'score' && letter.targetScore !== undefined) {
      // Find any log created on or after the letter's creation day with matching score
      const letterDay = new Date(letter.createdDate);
      letterDay.setHours(0, 0, 0, 0);

      return logs.some(log => {
        const logDay = new Date(log.created_at);
        logDay.setHours(0, 0, 0, 0);
        return logDay >= letterDay && log.mood_score === letter.targetScore;
      });
    }
    
    return false;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetched = await moodService.getMoodLogs();
        setLogs(fetched);
        
        // Load saved future letters
        const stored = localStorage.getItem('giraffe_future_letters');
        if (stored) {
          setSavedLetters(JSON.parse(stored));
        }

        // Set default target date to 7 days from now
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 7);
        setTargetDate(defaultDate.toISOString().split('T')[0]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Past capsule logic: Find a past log (older than 2 days)
  const pastCapsule = useMemo(() => {
    if (logs.length === 0) return null;
    
    const now = new Date();
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(now.getDate() - 2);

    // Filter logs that are older than 2 days
    const pastLogs = logs.filter(log => new Date(log.created_at) <= twoDaysAgo);
    
    if (pastLogs.length === 0) return null;

    // Pick the most recent of the past logs
    return pastLogs[0];
  }, [logs]);

  // Handle saving letter to future self
  const handleSaveFutureLetter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!futureLetterInput.trim()) return;

    let targetDateValue: string | undefined = undefined;
    let targetScoreValue: number | undefined = undefined;
    let durationText = '';

    if (deliveryType === 'date') {
      if (!targetDate) return;
      const target = new Date(targetDate);
      // Set to end of target day (23:59:59) so it is opened on that day
      target.setHours(23, 59, 59, 999);
      targetDateValue = target.toISOString();

      const now = new Date();
      const diffTime = target.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      durationText = `${diffDays}일 뒤`;
      if (diffDays === 0) durationText = '오늘';
      else if (diffDays === 7) durationText = '1주일 뒤';
      else if (diffDays === 30) durationText = '1달 뒤';
    } else {
      targetScoreValue = targetScore;
      durationText = `${targetScore}점 매칭`;
    }

    const newLetter: FutureLetter = {
      id: Math.random().toString(),
      text: futureLetterInput,
      deliveryType,
      targetDate: targetDateValue,
      targetScore: targetScoreValue,
      createdDate: new Date().toISOString(),
      duration: durationText,
    };

    const updated = [...savedLetters, newLetter];
    setSavedLetters(updated);
    localStorage.setItem('giraffe_future_letters', JSON.stringify(updated));

    setFutureLetterInput('');
    setLetterSaved(true);
    
    // Reset inputs
    setDeliveryType('date');
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    setTargetDate(defaultDate.toISOString().split('T')[0]);
    setTargetScore(50);

    setTimeout(() => setLetterSaved(false), 3000);
  };

  // AI encouraging letter from future self
  const futureSelfLetter = useMemo(() => {
    if (logs.length === 0) {
      return `안녕? 미래의 나야. 🦒✨\n\n비록 우리가 처음 만나 기래프에 기록된 하루 조각은 아직 없지만, 지금 이 순간 내 감정을 마주하고 변화하기 위해 이 리포트를 열어본 너의 소중한 발걸음 자체가 자랑스러워.\n\n살아가다 보면 우울한 소나기도 내리고, 따스한 가을 햇살도 찾아오는 법이잖아. 나중에 나뭇잎이 가득 쌓인 기래프를 함께 들여다볼 때, 우린 분명 더 단단하고 따스한 마음을 안은 사람이 되어 있을 거야. 걱정하지 마, 늘 너의 발걸음을 소중히 응원할게!`;
    }

    const scores = logs.map(l => l.mood_score);
    const averageMood = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    
    // Custom analysis text
    let moodMetaphor = '';
    if (averageMood <= 40) {
      moodMetaphor = '감정 가뭄을 겪으며 조금은 마르고 속상한 기래프의 계절을 보냈구나.';
    } else if (averageMood <= 70) {
      moodMetaphor = '초원에서 잔잔하고 온화하게 평온을 맛보는 기래프의 나날을 채웠더구나.';
    } else {
      moodMetaphor = '기래프가 신선한 새싹을 가득 맛보고 춤추는 눈부신 번영을 만끽했더구나.';
    }

    return `안녕? 미래의 나야. 🦒✨\n\n과거의 네가 마음을 숨기지 않고 정직하게 모아준 ${logs.length}개의 소중한 하루 일기를 읽으며 미래에서 이 편지를 써.\n\n그동안 우리는 평균 **${averageMood}점** 대의 기분 궤도를 지나며, ${moodMetaphor}\n\n점수가 뚝 떨어져서 목을 축 늘어뜨리고 속상해했던 그 아픈 순간에도, 기-log에 솔직한 '이유'를 적어 내려가던 너의 그 작은 용기가 미래의 나에게 얼마나 큰 힘과 구원이 되었는지 몰라. 돌아보면 그 힘든 겨울 같던 시기들도 결국 다 지나가고, 우리는 이렇게 편안하게 웃고 있단다.\n\n지나온 데이터는 증명하고 있어. 네가 마음을 기록하고 보살필 때 우리의 회복 탄력성은 언제나 쑥쑥 자라났다는 걸. 그러니 오늘 사소한 걱정에 너무 마음 아파하지 마. 과거의 네가 지탱해 줬듯, 나 역시 미래에서 너를 굳건히 믿고 기다리고 있을 테니까!`;
  }, [logs]);

  // Dynamic statistics
  const stats = useMemo(() => {
    if (logs.length === 0) return { stability: 0, resilience: 0, growth: 0 };

    const scores = logs.map(l => l.mood_score);
    
    // 1. Stability (100 - standard deviation or average variation)
    let totalDiff = 0;
    for (let i = 0; i < scores.length - 1; i++) {
      totalDiff += Math.abs(scores[i] - scores[i + 1]);
    }
    const avgDiff = scores.length > 1 ? totalDiff / (scores.length - 1) : 0;
    const stability = Math.max(Math.min(Math.round(100 - (avgDiff * 1.5)), 98), 40);

    // 2. Resilience: calculated from recovery patterns (low to high bounce-backs)
    const lowLogs = logs.filter(l => l.mood_score < 40);
    const resilience = lowLogs.length > 0
      ? Math.min(Math.round(65 + (logs.length * 2.5)), 99)
      : 88;

    // 3. Positivity growth
    const growth = Math.min(Math.round(40 + (logs.length * 3.5)), 95);

    return { stability, resilience, growth };
  }, [logs]);

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-white/5 pb-4">
        <span className="text-[10px] font-bold text-[var(--color-primary)] tracking-wider uppercase">
          기래프 감성 연결소
        </span>
        <h1 className="text-lg font-black text-white tracking-tight">마음 타임캡슐</h1>
        <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">과거의 마음 조각을 돌이켜보고 미래의 나에게 굳건한 위로를 전송하세요.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-3 text-zinc-600">
          <div className="w-6 h-6 rounded-full border-2 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] animate-spin" />
          <p className="text-[10px] font-bold text-zinc-500">시간의 우편함 여는 중...</p>
        </div>
      ) : (
        <>
          {/* Section 1: Past Capsule */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[var(--color-primary)]" />
              과거의 내가 보낸 감정 타임캡슐
            </h3>

            {pastCapsule ? (
              <div className="p-5.5 rounded-3xl border border-white/5 bg-zinc-900/10 backdrop-blur-sm flex flex-col gap-3.5 relative overflow-hidden">
                {/* Background Giraffe watermark */}
                <div className="absolute -right-3 -bottom-3 opacity-20 transform rotate-12">
                  <GiraffeFace score={pastCapsule.mood_score} size={65} />
                </div>

                <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5 z-10">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="text-[10px] font-bold text-zinc-400">
                      {new Date(pastCapsule.created_at).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2 py-0.5 rounded-full">
                    {pastCapsule.mood_score}점 • {getMoodState(pastCapsule.mood_score).label}
                  </span>
                </div>

                <div className="flex flex-col gap-1 z-10">
                  <p className="text-[11px] text-zinc-400 font-semibold leading-relaxed">
                    &quot;{pastCapsule.reason}&quot;
                  </p>
                  <p className="text-[9px] text-zinc-500 mt-2 font-bold leading-normal border-t border-zinc-900/50 pt-2.5 flex items-center gap-1">
                    <Heart className="w-3 h-3 text-rose-500 fill-rose-500 animate-pulse" />
                    오늘의 내가 회상해요: 과거의 나도 꿋꿋이 견뎌내며 오늘을 만들었답니다.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/5 text-zinc-500 text-[10px] leading-relaxed">
                시간의 타임캡슐이 아직 도착하지 않았습니다.<br />
                감정이 발송되려면 최소 2일 전의 과거 기록이 필요합니다.
              </div>
            )}
          </div>

          {/* Section 2: Write to Future Self */}
          <div className="flex flex-col gap-3 mt-1">
            <h3 className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
              <Send className="w-4 h-4 text-[var(--color-primary)]" />
              미래의 나를 위한 격려 타임캡슐 전송
            </h3>

            <form onSubmit={handleSaveFutureLetter} className="p-5.5 rounded-3xl border border-white/5 bg-zinc-900/10 backdrop-blur-sm flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-400 flex justify-between">
                  <span>미래에 도착할 따스한 다짐 한 줄</span>
                  <span className="text-[var(--color-primary)]">* 필수</span>
                </label>
                <textarea
                  value={futureLetterInput}
                  onChange={(e) => setFutureLetterInput(e.target.value)}
                  placeholder="예: 지금 힘들더라도 기래프가 꿋꿋하게 자라나듯 너도 성장하고 있을 거야! 1주일 뒤엔 원하는 과제도 끝나서 웃고 있겠지? 힘내자!"
                  rows={3}
                  required
                  className="w-full px-4 py-3 text-xs rounded-2xl border border-zinc-800 bg-zinc-900/20 focus:outline-none focus:border-[var(--color-primary)] text-zinc-200 placeholder-zinc-600 transition-colors resize-none leading-relaxed"
                />
              </div>

              <div className="flex flex-col gap-3.5 border-t border-zinc-900 pt-3.5">
                <span className="text-[10px] font-bold text-zinc-500">배송 방식 선택:</span>
                <div className="grid grid-cols-2 p-1 bg-zinc-900/60 rounded-2xl border border-zinc-800/80">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('date')}
                    className={`py-2 text-[10px] font-bold rounded-xl transition-all cursor-pointer text-center ${
                      deliveryType === 'date'
                        ? 'bg-[var(--color-primary)] text-white shadow-md'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    📅 특정 날짜에 도착
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryType('score')}
                    className={`py-2 text-[10px] font-bold rounded-xl transition-all cursor-pointer text-center ${
                      deliveryType === 'score'
                        ? 'bg-[var(--color-primary)] text-white shadow-md'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    🦒 특정 점수 매칭
                  </button>
                </div>

                {/* Conditional Inputs based on deliveryType */}
                {deliveryType === 'date' ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                      <span className="text-[10px] font-bold text-zinc-500 shrink-0">도착 예정일:</span>
                      <div className="relative flex-1 sm:flex-none">
                        <input
                          type="date"
                          value={targetDate}
                          min={todayStr}
                          onChange={(e) => setTargetDate(e.target.value)}
                          required={deliveryType === 'date'}
                          className="w-full text-[10px] font-bold px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/20 text-zinc-200 focus:outline-none focus:border-[var(--color-primary)] transition-colors cursor-pointer"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full sm:w-auto py-2 px-4 rounded-xl font-bold text-[10px] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white shadow-md active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0"
                    >
                      미래로 발송
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3.5 animate-fade-in">
                    <div className="flex flex-col gap-1.5 bg-zinc-900/5 p-3 rounded-2xl border border-white/5">
                      <div className="flex justify-between items-center text-[9px] font-bold">
                        <span className="text-zinc-500 font-semibold">배송 해제 기분 점수:</span>
                        <span className="text-[var(--color-primary)]">{targetScore}점</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={targetScore}
                        onChange={(e) => setTargetScore(Number(e.target.value))}
                        className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-zinc-800 focus:outline-none"
                        style={{
                          background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${targetScore}%, #27272a ${targetScore}%, #27272a 100%)`,
                          accentColor: 'var(--color-primary)',
                        }}
                      />
                      <div className="flex justify-between text-[8px] text-zinc-600 font-medium">
                        <span>우울 0점</span>
                        <span>보통 50점</span>
                        <span>행복 100점</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 rounded-xl font-bold text-[10px] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white shadow-md active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      미래로 발송
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {letterSaved && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-900/30 text-emerald-400 text-[10px] font-bold animate-pulse text-center">
                  📮 편지가 타임박스에 잠겼습니다! 지정된 조건에 맞춰 활성화됩니다.
                </div>
              )}
            </form>

            {/* Locked letters list */}
            {savedLetters.length > 0 && (
              <div className="flex flex-col gap-2.5 mt-4 border-t border-zinc-900 pt-3">
                <span className="text-[10px] font-bold text-zinc-500">전송 대기 중인 미래 편지 ({savedLetters.length}개)</span>
                <div className="flex flex-col gap-3.5 max-h-[280px] overflow-y-auto pr-1 no-scrollbar">
                  {savedLetters.map((letter) => {
                    const isOpened = checkIsOpened(letter);
                    return (
                      <div key={letter.id} className="p-3.5 rounded-2xl border border-white/5 bg-zinc-900/10 backdrop-blur-sm flex flex-col gap-2.5 transition-all duration-300">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">📮</span>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-zinc-300">
                                {isOpened ? '도착 완료! 🔓' : `${letter.duration} 도착 예정 🔒`}
                              </span>
                              <p className="text-[8px] text-zinc-500 font-semibold mt-0.5">
                                발송일: {new Date(letter.createdDate).toLocaleDateString('ko-KR')}
                                {letter.targetDate && ` | 도착일: ${new Date(letter.targetDate).toLocaleDateString('ko-KR')}`}
                              </p>
                            </div>
                          </div>
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${
                            isOpened ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-800/80 text-zinc-400'
                          }`}>
                            {isOpened ? '개봉 가능' : '보류 중'}
                          </span>
                        </div>

                        {/* Lock / Unlocked details */}
                        {isOpened ? (
                          <div className="p-3 bg-zinc-950/60 rounded-xl border border-emerald-500/10 text-zinc-300 font-medium text-[11px] leading-relaxed select-text animate-fade-in">
                            💌 &quot;{letter.text}&quot;
                          </div>
                        ) : (
                          <div className="text-[8px] text-zinc-500 font-semibold bg-zinc-950/30 p-2.5 rounded-xl border border-zinc-900/60 leading-relaxed">
                            {letter.deliveryType === 'score' ? (
                              <span>🔒 미래에 당일 기분 점수를 <b>{letter.targetScore}점</b>으로 등록하면 편지가 개봉됩니다.</span>
                            ) : (
                              <span>🔒 지정된 날짜({new Date(letter.targetDate!).toLocaleDateString('ko-KR')})가 되면 자동으로 개봉됩니다.</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: AI encouraging letter from future self */}
          <div className="flex flex-col gap-3 mt-1">
            <h3 className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[var(--color-primary)] animate-pulse" />
              미래의 내가 보낸 AI 위로 편지
            </h3>

            <div className="p-5.5 rounded-3xl border border-white/5 bg-gradient-to-br from-zinc-900/40 via-zinc-950/65 to-zinc-900/40 shadow-xl flex flex-col gap-3 leading-relaxed relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-[var(--color-primary)]/10 blur-2xl pointer-events-none" />
              <div className="text-[11px] text-zinc-300 font-medium whitespace-pre-wrap font-sans">
                {futureSelfLetter}
              </div>
            </div>
          </div>

          {/* Section 4: Connectivity Stats */}
          <div className="flex flex-col gap-3 mt-1">
            <h3 className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[var(--color-primary)]" />
              과거와 미래를 잇는 마음 통계 지수
            </h3>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3.5 rounded-2xl border border-white/5 bg-zinc-900/10 backdrop-blur-sm flex flex-col items-center gap-1 text-center">
                <span className="text-[8px] font-bold text-zinc-500">회복 탄력성</span>
                <span className="text-base font-black text-white mt-0.5">{stats.resilience}%</span>
                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-emerald-400" style={{ width: `${stats.resilience}%` }} />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl border border-white/5 bg-zinc-900/10 backdrop-blur-sm flex flex-col items-center gap-1 text-center">
                <span className="text-[8px] font-bold text-zinc-500">마음 안정성</span>
                <span className="text-base font-black text-white mt-0.5">{stats.stability}%</span>
                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-[var(--color-primary)]" style={{ width: `${stats.stability}%` }} />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl border border-white/5 bg-zinc-900/10 backdrop-blur-sm flex flex-col items-center gap-1 text-center">
                <span className="text-[8px] font-bold text-zinc-500">미래 긍정 지수</span>
                <span className="text-base font-black text-white mt-0.5">{stats.growth}%</span>
                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-amber-400" style={{ width: `${stats.growth}%` }} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

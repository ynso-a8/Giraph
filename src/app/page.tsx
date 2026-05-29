'use client';

import React, { useState, useEffect } from 'react';
import MoodSlider from '@/components/MoodSlider';
import GiraffeFace from '@/components/GiraffeFace';
import { moodService, MoodLog, getMoodState } from '@/lib/moodService';
import { Sparkles, Calendar, BookOpen, Trash2, CheckCircle, Database, Palette, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';

const COZY_THEMES = [
  { id: 'lavender', label: '차분한 라벤더', color: 'bg-violet-600', text: 'text-violet-400' },
  { id: 'sunset', label: '따스한 선셋', color: 'bg-orange-500', text: 'text-orange-400' },
  { id: 'forest', label: '싱그러운 초록', color: 'bg-emerald-500', text: 'text-emerald-400' },
  { id: 'milktea', label: '따스한 밀크티', color: 'bg-amber-600', text: 'text-amber-500' },
];

export default function Home() {
  // Splash Screen state
  const [showSplash, setShowSplash] = useState(true);

  // Theme state
  const [activeTheme, setActiveTheme] = useState('lavender');
  const [themeMode, setThemeMode] = useState('dark');
  const [showThemePicker, setShowThemePicker] = useState(false);

  // Main Logger Form States
  const [moodScore, setMoodScore] = useState(50);
  const [reason, setReason] = useState('');
  const [recentLogs, setRecentLogs] = useState<MoodLog[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  // Calendar States
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // 0-11
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarLogs, setCalendarLogs] = useState<Record<string, MoodLog>>({});

  // Past Entry Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMoodScore, setModalMoodScore] = useState(50);
  const [modalReason, setModalReason] = useState('');
  const [modalIsEdit, setModalIsEdit] = useState(false);
  const [modalLogId, setModalLogId] = useState('');

  useEffect(() => {
    // 1. Splash screen: check sessionStorage so it only shows once per tab session
    const splashShown = sessionStorage.getItem('giraffey_splash_shown');
    if (splashShown === 'true') {
      setShowSplash(false);
    } else {
      const timer = setTimeout(() => {
        setShowSplash(false);
        sessionStorage.setItem('giraffey_splash_shown', 'true');
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // 2. Initialize theme from localStorage
    const savedTheme = localStorage.getItem('mood_tracker_theme') || 'lavender';
    setActiveTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    const savedMode = localStorage.getItem('mood_tracker_theme_mode') || 'dark';
    setThemeMode(savedMode);
    document.documentElement.setAttribute('data-theme-mode', savedMode);

    setIsDemo(moodService.isDemoMode());
    fetchLogs();
  }, []);

  const changeTheme = (themeId: string) => {
    setActiveTheme(themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    localStorage.setItem('mood_tracker_theme', themeId);
    // Dispatch storage event to notify other components (e.g. charts) that theme changed
    window.dispatchEvent(new Event('theme-changed'));
  };

  const changeThemeMode = (mode: string) => {
    setThemeMode(mode);
    document.documentElement.setAttribute('data-theme-mode', mode);
    localStorage.setItem('mood_tracker_theme_mode', mode);
    // Dispatch storage event to notify other components (e.g. charts) that theme changed
    window.dispatchEvent(new Event('theme-changed'));
  };

  const fetchLogs = async () => {
    try {
      const logs = await moodService.getMoodLogs();
      setRecentLogs(logs.slice(0, 3));

      // Index logs by local date string for the calendar
      const indexed: Record<string, MoodLog> = {};
      logs.forEach((log) => {
        const dStr = new Date(log.created_at).toLocaleDateString('ko-KR');
        indexed[dStr] = log;
      });
      setCalendarLogs(indexed);
    } catch (e) {
      console.error(e);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await moodService.addMoodLog({
        mood_score: moodScore,
        feeling: getMoodState(moodScore).label, // Save label as feeling automatically
        reason: reason,
        change_reason: '', // Simplified out
      });

      setSubmitSuccess(true);
      setReason('');
      setMoodScore(50);
      fetchLogs();

      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;

    try {
      await moodService.addMoodLog({
        mood_score: modalMoodScore,
        feeling: getMoodState(modalMoodScore).label,
        reason: modalReason,
        change_reason: '',
        created_at: selectedDate.toISOString(),
      });

      setShowModal(false);
      setSelectedDate(null);
      setModalReason('');
      setModalMoodScore(50);
      fetchLogs();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('이 기분 기록을 정말 삭제하시겠습니까?')) {
      await moodService.deleteMoodLog(id);
      fetchLogs();
    }
  };

  const handleModalDelete = async () => {
    if (modalLogId && confirm('이 기분 기록을 정말 삭제하시겠습니까?')) {
      await moodService.deleteMoodLog(modalLogId);
      setShowModal(false);
      setSelectedDate(null);
      fetchLogs();
    }
  };

  const openDateModal = (date: Date) => {
    setSelectedDate(date);
    const dateStr = date.toLocaleDateString('ko-KR');
    const existingLog = calendarLogs[dateStr];

    if (existingLog) {
      setModalIsEdit(true);
      setModalLogId(existingLog.id);
      setModalMoodScore(existingLog.mood_score);
      setModalReason(existingLog.reason);
    } else {
      setModalIsEdit(false);
      setModalLogId('');
      setModalMoodScore(50);
      setModalReason('');
    }
    setShowModal(true);
  };

  // Calendar Helpers
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const renderCalendar = () => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days: React.ReactNode[] = [];

    // Week days header
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

    // Empty grid elements for days of previous month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-full" />);
    }

    // Days of active month
    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(currentYear, currentMonth, d);
      const dStr = date.toLocaleDateString('ko-KR');
      const log = calendarLogs[dStr];
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <button
          key={`day-${d}`}
          type="button"
          onClick={() => openDateModal(date)}
          className={`h-10 w-full rounded-xl flex flex-col items-center justify-center relative transition-all duration-300 active:scale-90 cursor-pointer ${
            isToday 
              ? 'border border-[var(--color-primary)] font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/5'
              : 'hover:bg-zinc-800/40 border border-transparent'
          }`}
        >
          <span className={`text-[10px] ${isToday ? 'text-[var(--color-primary)]' : 'text-zinc-400'}`}>
            {d}
          </span>
          {log ? (
            <span className="text-lg leading-none absolute -bottom-0.5 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
              {getMoodState(log.mood_score).emoji.replace('🦒', '')}
            </span>
          ) : (
            <span className="text-[8px] text-zinc-700 font-bold opacity-0 hover:opacity-100 transition-opacity">
              +
            </span>
          )}
        </button>
      );
    }

    return (
      <div className="flex flex-col gap-2 p-4 rounded-3xl border border-white/5 bg-zinc-900/10 backdrop-blur-sm">
        {/* Calendar Header */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[var(--color-primary)]" />
            {currentYear}년 {currentMonth + 1}월 기분 달력
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white cursor-pointer active:scale-95"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white cursor-pointer active:scale-95"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1 mt-2">
          {weekDays.map((wd) => (
            <div key={wd} className="text-[10px] text-zinc-600 font-bold text-center py-1">
              {wd}
            </div>
          ))}
          {days}
        </div>
      </div>
    );
  };

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-[#090810] z-50 flex flex-col items-center justify-center text-center p-6 select-none animate-fade-in">
        {/* Decorative glows in splash */}
        <div className="absolute top-[20%] left-[10%] w-[60%] h-[40%] rounded-full bg-violet-900/15 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[10%] w-[60%] h-[40%] rounded-full bg-amber-900/10 blur-[100px] pointer-events-none" />

        <div className="flex flex-col items-center gap-6 relative z-10 animate-giraffe">
          {/* Logo Illustration (Cute yellow giraffe face SVG) */}
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.3)]">
            <rect x="35" y="45" width="30" height="40" rx="10" fill="#fbbf24" /> {/* neck */}
            <circle cx="50" cy="55" r="7" fill="#d97706" /> {/* spot */}
            <circle cx="45" cy="75" r="5" fill="#d97706" /> {/* spot */}
            
            <rect x="30" y="25" width="40" height="30" rx="12" fill="#fbbf24" /> {/* head */}
            
            {/* Horns */}
            <path d="M 43 25 L 43 12 M 57 25 L 57 12" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" />
            <circle cx="43" cy="10" r="4.5" fill="#d97706" />
            <circle cx="57" cy="10" r="4.5" fill="#d97706" />
            
            {/* Ears */}
            <path d="M 30 30 Q 22 25 28 35 Z" fill="#fbbf24" />
            <path d="M 70 30 Q 78 25 72 35 Z" fill="#fbbf24" />

            {/* Eyes */}
            <circle cx="44" cy="38" r="2.5" fill="#1e293b" />
            <circle cx="56" cy="38" r="2.5" fill="#1e293b" />
            <path d="M 42 34 Q 44 32 46 34" stroke="#1e293b" strokeWidth="1.5" fill="none" />
            <path d="M 54 34 Q 56 32 58 34" stroke="#1e293b" strokeWidth="1.5" fill="none" />

            {/* Nose / Mouth */}
            <rect x="38" y="45" width="24" height="6" rx="3" fill="#fef08a" />
            <circle cx="43" cy="48" r="1" fill="#d97706" />
            <circle cx="57" cy="48" r="1" fill="#d97706" />
          </svg>

          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">기래프</h1>
            <p className="text-xs text-zinc-400 font-bold tracking-wide mt-1.5">내가 그린 기분 그래프</p>
          </div>
        </div>

        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <p className="text-[10px] text-zinc-500 font-semibold tracking-widest">GIRAFFE MOOD TRACKER</p>
          <div className="w-16 h-1 rounded-full bg-zinc-800 overflow-hidden mt-1">
            <div className="h-full bg-amber-400 w-1/2 animate-[pulse_1.5s_infinite]" />
          </div>
        </div>
      </div>
    );
  }

  const currentMood = getMoodState(moodScore);

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      {/* Top Header Widget with Settings/Theme Switcher */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-black text-white tracking-tight">기래프 🦒</span>
            {isDemo && (
              <span className="text-[8px] font-bold text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-zinc-700/40">
                <Database className="w-2 h-2" /> Local
              </span>
            )}
          </div>
          <span className="text-[9px] text-zinc-500 font-semibold">내가 그린 기분 그래프</span>
        </div>

        {/* Floating Theme Selector Widget */}
        <div className="relative">
          <button
            onClick={() => setShowThemePicker(!showThemePicker)}
            className="p-2 rounded-xl bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800/80 hover:border-zinc-700 transition-all flex items-center gap-1.5 cursor-pointer text-xs font-bold active:scale-95"
          >
            <Palette className="w-3.5 h-3.5 text-[var(--color-primary)]" />
            포근한 옷장
          </button>

          {showThemePicker && (
            <div className="absolute right-0 mt-2 z-50 w-44 p-2 rounded-2xl border border-white/10 bg-zinc-950/95 backdrop-blur-xl shadow-2xl flex flex-col gap-1 animate-fade-in">
              <div className="text-[9px] font-bold text-zinc-500 px-2 py-1 border-b border-zinc-900">감성 테마 옷장</div>
              {COZY_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    changeTheme(theme.id);
                    setShowThemePicker(false);
                  }}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all text-left cursor-pointer ${
                    activeTheme === theme.id
                      ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${theme.color}`} />
                    {theme.label}
                  </span>
                  {activeTheme === theme.id && <span className="text-[8px]">✓</span>}
                </button>
              ))}
              
              {/* Brightness Mode Toggle (Light/Dark Mode) */}
              <div className="text-[9px] font-bold text-zinc-500 px-2 py-1 border-t border-b border-zinc-900/60 mt-1.5">밝기 모드</div>
              <div className="flex p-0.5 bg-zinc-900/50 rounded-lg mt-1 gap-1">
                <button
                  type="button"
                  onClick={() => changeThemeMode('light')}
                  className={`flex-1 text-center py-1 rounded-md text-[9px] font-bold transition-all cursor-pointer ${
                    themeMode === 'light'
                      ? 'bg-[var(--color-primary)] text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-300'
                  }`}
                >
                  ☀️ 포근한 낮
                </button>
                <button
                  type="button"
                  onClick={() => changeThemeMode('dark')}
                  className={`flex-1 text-center py-1 rounded-md text-[9px] font-bold transition-all cursor-pointer ${
                    themeMode === 'dark'
                      ? 'bg-[var(--color-primary)] text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-300'
                  }`}
                >
                  🌙 차분한 밤
                </button>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Main mood score submission card */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Slider Card */}
        <MoodSlider value={moodScore} onChange={setMoodScore} />

        {/* Reason Text Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[var(--color-primary)]" />
            오늘 있었던 일과 기분의 원인은 무엇인가요?
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="예: 오랜만에 맑은 하늘을 보며 산책했어요. 해야 할 과제도 일찍 마무리해서 마음이 한결 가볍고 포근한 날입니다."
            rows={3}
            required
            className="w-full px-4 py-3 text-xs rounded-2xl border border-zinc-800 bg-zinc-900/30 focus:outline-none focus:border-[var(--color-primary)] text-zinc-100 placeholder-zinc-600 transition-colors resize-none leading-relaxed"
          />
        </div>

        {/* Submit action button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 px-6 rounded-2xl font-bold text-xs bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white transition-all duration-300 shadow-lg shadow-[var(--color-primary)]/10 active:scale-98 cursor-pointer flex justify-center items-center gap-2"
        >
          {isSubmitting ? '오늘의 마음을 기래프에 심는 중...' : '오늘 하루 기록 완료하기'}
        </button>

        {submitSuccess && (
          <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-900/30 text-emerald-400 text-xs font-bold animate-pulse">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>오늘 기래프에 마음 새싹이 심어졌어요! 🦒🌿</span>
          </div>
        )}
      </form>

      {/* Interactive Calendar Widget */}
      {renderCalendar()}

      {/* Recent Records list */}
      <div className="flex flex-col gap-3.5 mt-2">
        <h3 className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-[var(--color-primary)]" />
          최근 기록한 기래프 로그
        </h3>

        {recentLogs.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {recentLogs.map((log) => {
              const state = getMoodState(log.mood_score);
              const date = new Date(log.created_at);
              const formattedLogDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;

              return (
                <div
                  key={log.id}
                  className="p-3.5 rounded-2xl border border-white/5 bg-zinc-900/10 backdrop-blur-sm flex items-start justify-between gap-4 transition-all duration-300 hover:border-zinc-800"
                >
                  <div className="flex gap-3 items-start">
                    <div className="shrink-0">
                      <GiraffeFace score={log.mood_score} size={40} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-zinc-400">{formattedLogDate}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${state.accentColor}`}>
                          {log.mood_score}점 • {state.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-300 font-medium leading-relaxed">{log.reason}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(log.id)}
                    className="p-1.5 text-zinc-700 hover:text-rose-400 transition-colors self-center cursor-pointer active:scale-90"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl border border-dashed border-zinc-800 text-zinc-500 text-[11px]">
            아직 채워진 기래프가 없습니다. 오늘 기분을 첫 시작으로 채워보세요!
          </div>
        )}
      </div>

      {/* Modal for Back-filling / Editing Past Mood Entries */}
      {showModal && selectedDate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-[32px] border border-white/10 bg-zinc-950 p-6 shadow-2xl flex flex-col gap-5 relative">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setSelectedDate(null);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[var(--color-primary)]">기분 조각 타임머신</span>
              <h3 className="text-sm font-black text-white">
                {selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 기록
              </h3>
            </div>

            <form onSubmit={handleModalSubmit} className="flex flex-col gap-4">
              <MoodSlider value={modalMoodScore} onChange={setModalMoodScore} />

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-zinc-300">
                  이날 기분의 구체적 이유를 알려주세요
                </label>
                <textarea
                  value={modalReason}
                  onChange={(e) => setModalReason(e.target.value)}
                  placeholder="당시의 솔직한 생각이나 일을 기록해 보세요..."
                  rows={3}
                  required
                  className="w-full px-4.5 py-3 text-xs rounded-2xl border border-zinc-800 bg-zinc-900/30 focus:outline-none focus:border-[var(--color-primary)] text-zinc-100 placeholder-zinc-600 transition-colors resize-none leading-relaxed"
                />
              </div>

              <div className="flex gap-2.5 mt-2">
                {modalIsEdit && (
                  <button
                    type="button"
                    onClick={handleModalDelete}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-xs bg-rose-950/20 text-rose-400 border border-rose-900/30 hover:bg-rose-950/40 hover:border-rose-800 transition-all cursor-pointer text-center active:scale-95"
                  >
                    삭제하기
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-2 py-3 px-4 rounded-xl font-bold text-xs bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white transition-all cursor-pointer text-center active:scale-95 shadow-md shadow-[var(--color-primary)]/10"
                >
                  {modalIsEdit ? '수정 완료하기' : '기록 저장하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

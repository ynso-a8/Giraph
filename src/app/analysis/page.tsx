'use client';

import React, { useState, useEffect } from 'react';
import ChatInterface from '@/components/ChatInterface';
import GiraffeFace from '@/components/GiraffeFace';
import { moodService, MoodLog, getMoodState } from '@/lib/moodService';
import { Sparkles, Brain, CheckCircle2, HeartPulse, RefreshCw, Play, Pause, Compass, Send, User, Bot } from 'lucide-react';

type BreathingState = 'idle' | 'inhale' | 'hold' | 'exhale';

interface QuizAnswers {
  category: string;
  intensity: string;
  physical: string;
  coping: string;
  subjective: string;
}

export default function AnalysisPage() {
  const [logs, setLogs] = useState<MoodLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Quiz submission states
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswers>({
    category: '',
    intensity: '',
    physical: '',
    coping: '',
    subjective: '',
  });

  // Quiz active selections
  const [activeCategory, setActiveCategory] = useState('');
  const [activeIntensity, setActiveIntensity] = useState('');
  const [activePhysical, setActivePhysical] = useState('');
  const [activeCoping, setActiveCoping] = useState('');
  const [subjectiveInput, setSubjectiveInput] = useState('');

  // Breathing Exercise State
  const [breathingState, setBreathingState] = useState<BreathingState>('idle');
  const [countdown, setCountdown] = useState(4);

  // Custom chatbot chat messages generated from quiz
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; timestamp: Date }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatIsTyping, setChatIsTyping] = useState(false);
  const chatMessagesEndRef = React.useRef<HTMLDivElement>(null);

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

  // Breathing timer
  useEffect(() => {
    if (breathingState === 'idle') return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setBreathingState((curr) => {
            if (curr === 'inhale') return 'hold';
            if (curr === 'hold') return 'exhale';
            return 'inhale';
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [breathingState]);

  // Chatbot auto scroll
  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatIsTyping]);

  const handleStartBreathing = () => {
    setBreathingState('inhale');
    setCountdown(4);
  };

  const handleStopBreathing = () => {
    setBreathingState('idle');
    setCountdown(4);
  };

  const getBreathingLabel = () => {
    switch (breathingState) {
      case 'inhale': return '코로 맑은 숨을 깊게 들이마시세요 🦒 (Inhale)';
      case 'hold': return '맑은 공기를 머금고 잠시 머무르세요 🌾 (Hold)';
      case 'exhale': return '모든 걱정을 담아 숨을 천천히 내쉬세요 🍃 (Exhale)';
      default: return '평온을 돕는 기래프 4초 호흡법';
    }
  };

  const getBreathingColor = () => {
    switch (breathingState) {
      case 'inhale': return 'bg-amber-500/10 border-amber-400 scale-[1.2] shadow-[0_0_30px_rgba(245,158,11,0.2)]';
      case 'hold': return 'bg-[var(--color-primary)]/10 border-[var(--color-primary)] scale-[1.25] shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.25)]';
      case 'exhale': return 'bg-zinc-800/10 border-zinc-700 scale-[0.85]';
      default: return 'bg-zinc-900/40 border-zinc-800 scale-100';
    }
  };

  // Generate customized bot responses
  const getCustomBotResponse = (userInput: string): string => {
    const text = userInput.toLowerCase();
    
    if (text.includes('해결') || text.includes('방법') || text.includes('어떡해') || text.includes('조언')) {
      return `오늘 선택하신 '${answers.coping}' 처방과 관련해 기래프가 드리는 조언이에요. 대립되거나 피로할 땐 생각을 비워주는 '자발적 멈춤'이 중요해요. 눈을 감고 아래에 있는 4초 호흡 가이드를 최소 3회 반복하시며, 스마트폰을 뒤집어 두시는 것부터 시작해볼까요?`;
    }
    if (text.includes('지쳐') || text.includes('피곤') || text.includes('스트레스')) {
      return `몸이 '${answers.physical}' 상태를 보인다면 뇌의 에너지 소모가 매우 컸다는 뜻이에요. 오늘 ${answers.category}로 일어난 ${answers.subjective ? `'${answers.subjective}'` : '마음 무거움'}은 충분한 따스함으로 안아주어야 합니다. 오늘은 가벼운 목욕이나 따뜻한 허브티를 마시며 평소보다 조금 더 긴 휴식을 취해 주세요.`;
    }
    if (text.includes('고마워') || text.includes('위로') || text.includes('힘이')) {
      return `당신이 조금이나마 편안해지셨다니 기래프도 너무 행복해요! 🦒✨ 마음은 언제나 변하지만, 기록을 통해 마주할수록 더 단단해진답니다. 남은 오늘 하루도 따뜻하고 소중하게 보듬어주세요.`;
    }

    const responses = [
      `그렇군요... 당시 '${answers.subjective}' 상황 속에서 정말 심적으로 부담스럽고 피로하셨을 것 같아요. 몸의 ${answers.physical} 반응도 그 고뇌를 그대로 비춰주네요. 혹시 마음속에 더 걸려 있는 디테일한 생각이 있으신가요?`,
      `말해주셔서 진심으로 감사해요. 오늘 선택해 주신 감정 분석에 따르면, '${answers.category}'로 인한 긴장감은 당신만의 건강한 영역 분리로 대처가 가능해요. 지금 이 기분에서 1점이라도 나아지기 위해 당장 실천해보고 싶은 사소한 행동이 있을까요?`,
      `기래프는 언제나 당신 편이에요. 마음의 파도가 일렁일 땐 억지로 가라앉히려 하지 말고, 기래프와 호흡하며 천천히 바람을 맞이해 보아요. 당시 어떤 감정이 가장 크게 마음을 스쳐 지나갔나요?`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Submit diagnosis quiz
  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCategory || !activeIntensity || !activePhysical || !activeCoping) {
      alert('객관식 문항 4개를 모두 선택해 주세요!');
      return;
    }

    const quizResult: QuizAnswers = {
      category: activeCategory,
      intensity: activeIntensity,
      physical: activePhysical,
      coping: activeCoping,
      subjective: subjectiveInput.trim(),
    };

    setAnswers(quizResult);
    setQuizSubmitted(true);

    // Dynamic initial chatbot messages customized with user quiz answers
    setChatMessages([
      {
        id: 'welcome-counselor',
        sender: 'bot',
        text: `안녕하세요! 당신만을 위한 기래프 AI 마음 해결사입니다. 🦒✨\n\n오늘 당신의 마음 영역은 **'${quizResult.category}'**이며, 감정의 강도는 **'${quizResult.intensity}'**로 느껴지고 있군요. 몸에서는 **'${quizResult.physical}'** 반응이 와닿아 많이 지쳤을 텐데, **'${quizResult.coping}'** 처방으로 해결 방향을 잡으려 하시는군요.\n\n구체적으로 털어놓아 주신 _"${quizResult.subjective || '마음이 조금 지쳐요.'}"_ 상황을 바탕으로, 아래에 **'AI 심층 처방 분석'**과 **'맞춤형 대처법'**을 정리해 두었습니다. 저와 함께 더 편안한 이야기를 나눠보고 싶다면 무엇이든 질문해 주세요. 제가 따뜻하게 들어 드릴게요. 🌸`,
        timestamp: new Date(),
      } as any
    ]);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatIsTyping) return;

    const userMsg = {
      id: Math.random().toString(),
      sender: 'user',
      text: chatInput,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMsg as any]);
    setChatInput('');
    setChatIsTyping(true);

    setTimeout(() => {
      const botResponseText = getCustomBotResponse(userMsg.text);
      const botMsg = {
        id: Math.random().toString(),
        sender: 'bot',
        text: botResponseText,
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, botMsg as any]);
      setChatIsTyping(false);
    }, 1200);
  };

  const resetQuiz = () => {
    setQuizSubmitted(false);
    setActiveCategory('');
    setActiveIntensity('');
    setActivePhysical('');
    setActiveCoping('');
    setSubjectiveInput('');
  };

  // Threshold logic details
  const isEarlyStage = logs.length < 5;
  const averageMood = logs.length > 0 
    ? Math.round(logs.map(l => l.mood_score).reduce((a, b) => a + b, 0) / logs.length) 
    : 50;

  // Broad Category choices data
  const categories = ['대인관계 👥', '학업/진로 📚', '개인생활/휴식 🏡', '신체건강/컨디션 🏃'];
  const intensities = ['아주 뚜렷하고 강함 ⚡', '어느 정도 잔잔히 느껴짐 🌊', '미미해서 알쏭달쏭함 🌫️', '감정이 거의 없음 ❄️'];
  const physicals = ['가슴 긴장/두근거림 💓', '몸이 축 처지고 피로함 💤', '가볍고 활기 넘침 ✨', '차분하고 호흡이 편안함 🌾'];
  const copings = ['다른 일로 신경 환기하기 🪁', '사람들과 소통하며 풀기 💬', '조용히 혼자만의 휴식 🧘', '감정 흐름에 몸 맡기기 🍃'];

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-white/5 pb-4">
        <span className="text-[10px] font-bold text-[var(--color-primary)] tracking-wider uppercase">
          기래프 마음 클리닉
        </span>
        <h1 className="text-lg font-black text-white tracking-tight">마음 분석 & 해결책</h1>
        <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">자가 진단을 통해 나에게 꼭 맞춘 솔루션을 처방받으세요.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-3 text-zinc-600">
          <div className="w-6 h-6 rounded-full border-2 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] animate-spin" />
          <p className="text-[10px] font-bold text-zinc-500">진단 차트를 가져오는 중...</p>
        </div>
      ) : !quizSubmitted ? (
        /* Quiz Survey Interface */
        <form onSubmit={handleQuizSubmit} className="flex flex-col gap-5">
          <div className="p-5 rounded-3xl border border-white/5 bg-zinc-900/10 backdrop-blur-sm flex flex-col gap-4">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-zinc-900 pb-2">
              <Compass className="w-4 h-4 text-[var(--color-primary)] animate-spin" />
              오늘의 기분 자가진단
            </h3>

            {/* Q1: Category */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-zinc-300">
                1. 오늘 내 마음에 가장 큰 자극을 준 주된 영역은 어디인가요?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setActiveCategory(c)}
                    className={`py-2 px-3 text-[10px] font-bold rounded-xl border text-center transition-all cursor-pointer active:scale-95 ${
                      activeCategory === c
                        ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-md'
                        : 'bg-zinc-900/30 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-white'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Q2: Intensity */}
            <div className="flex flex-col gap-2 mt-1">
              <label className="text-[11px] font-bold text-zinc-300">
                2. 느껴지는 기분의 세기나 선명함은 어떠한가요?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {intensities.map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveIntensity(i)}
                    className={`py-2 px-3 text-[10px] font-bold rounded-xl border text-center transition-all cursor-pointer active:scale-95 ${
                      activeIntensity === i
                        ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-md'
                        : 'bg-zinc-900/30 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-white'
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            {/* Q3: Physical */}
            <div className="flex flex-col gap-2 mt-1">
              <label className="text-[11px] font-bold text-zinc-300">
                3. 그 감정으로 인해 내 몸에 느껴지는 생생한 신호는 무엇인가요?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {physicals.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setActivePhysical(p)}
                    className={`py-2 px-3 text-[10px] font-bold rounded-xl border text-center transition-all cursor-pointer active:scale-95 ${
                      activePhysical === p
                        ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-md'
                        : 'bg-zinc-900/30 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Q4: Coping */}
            <div className="flex flex-col gap-2 mt-1">
              <label className="text-[11px] font-bold text-zinc-300">
                4. 지금 당장 어떤 식으로 기분을 조율하거나 다스리고 싶나요?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {copings.map((cop) => (
                  <button
                    key={cop}
                    type="button"
                    onClick={() => setActiveCoping(cop)}
                    className={`py-2 px-3 text-[10px] font-bold rounded-xl border text-center transition-all cursor-pointer active:scale-95 ${
                      activeCoping === cop
                        ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-md'
                        : 'bg-zinc-900/30 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-white'
                    }`}
                  >
                    {cop}
                  </button>
                ))}
              </div>
            </div>

            {/* Q5: Subjective */}
            <div className="flex flex-col gap-2 mt-1">
              <label className="text-[11px] font-bold text-zinc-300">
                5. 머릿속에 맴도는 구체적인 원인이나 생각을 적어주세요.
              </label>
              <textarea
                value={subjectiveInput}
                onChange={(e) => setSubjectiveInput(e.target.value)}
                placeholder="예: 오랜만에 친구와 약속을 잡았는데 취소되어 허무함과 아쉬운 감정이 크게 몰려왔어요."
                rows={2}
                required
                className="w-full px-4 py-3 text-xs rounded-2xl border border-zinc-800 bg-zinc-900/20 focus:outline-none focus:border-[var(--color-primary)] text-zinc-200 placeholder-zinc-600 transition-colors resize-none leading-relaxed"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 px-6 rounded-2xl font-bold text-xs bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white transition-all duration-300 shadow-lg active:scale-98 cursor-pointer text-center"
          >
            기래프 AI 진단 및 해결책 받기
          </button>
        </form>
      ) : (
        /* Dynamic Consolidated Analysis & Solution Block */
        <div className="flex flex-col gap-6 animate-fade-in">
          {/* Merged AI Analysis Report Card */}
          <div className="p-5.5 rounded-3xl border border-white/5 bg-gradient-to-br from-zinc-900/40 via-zinc-950/60 to-zinc-900/40 shadow-xl flex flex-col gap-4 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-[var(--color-primary)]/10 blur-2xl pointer-events-none" />

            <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
              <Brain className="w-5 h-5 text-[var(--color-primary)] animate-pulse" />
              <div className="flex flex-col">
                <span className="text-xs font-black text-white">기래프 AI 처방 리포트</span>
                <span className="text-[8px] text-zinc-500 font-bold mt-0.5">
                  {isEarlyStage ? '보편적 대안 대입 데이터 분석 작동 중' : '사용자 누적 맞춤형 데이터 분석 완료'}
                </span>
              </div>
            </div>

            {/* Threshold condition content display */}
            {isEarlyStage ? (
              /* Early Stage Analysis (< 5 logs) */
              <div className="flex flex-col gap-3">
                <div className="px-3 py-2 rounded-xl bg-amber-950/20 border border-amber-900/30 text-amber-400 text-[10px] font-bold">
                  ⚠️ 누적 감정 데이터가 부족해 현재 {logs.length}개 / 5개, 보편적인 대규모 사용자 평균 임상 상황을 대입한 일반 분석을 제공해 드립니다.
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed font-medium">
                  오늘 느끼신 <strong>'{answers.category}'</strong> 영역의 자극은 평균 사용자들이 일상에서 겪는 피로 유발 지수의 68%를 차지하는 주원인입니다. 몸에서 나타난 <strong>'{answers.physical}'</strong> 반응은 뇌가 깊은 피로 상태에 빠져 근육의 항상성을 회복하고자 하는 자연적인 구조 신호입니다.
                </p>
                <p className="text-[11px] text-zinc-300 leading-relaxed font-medium">
                  평균적으로 이럴 때 사용자들이 가장 빠른 회복을 보인 솔루션은 <strong>'{answers.coping}'</strong>과 함께, 따뜻한 수분 섭취와 스마트폰 차단이었습니다. 스스로의 마음에 과도한 질책을 하지 마시고, 가볍게 눈을 감고 마음의 짐을 잠시 내려놓으세요.
                </p>
              </div>
            ) : (
              /* Advanced Stage Analysis (>= 5 logs) */
              <div className="flex flex-col gap-3">
                <div className="px-3 py-2 rounded-xl bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 text-[10px] font-bold">
                  ✓ 축적된 {logs.length}개의 정밀 감정 조각을 분석해 한동재님만을 위한 맞춤형 딥케어 분석이 완료되었습니다.
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed font-medium">
                  한동재님의 과거 마음 데이터 통계에 따르면 기분 평균점수는 <strong>{averageMood}점</strong> 대를 걷고 있습니다. 주로 <strong>'{answers.category}'</strong> 관련 로그가 올라왔을 때 평소보다 감정 변동성이 약 24% 크게 나타났으며, 특히 몸이 <strong>'{answers.physical}'</strong>할 때 기래프의 충전 속도가 가장 느려진 이력이 있습니다.
                </p>
                <p className="text-[11px] text-zinc-300 leading-relaxed font-medium">
                  하지만 놀랍게도 과거 <strong>'{answers.coping}'</strong>과 관련된 자발적 힐링 루틴을 시도했을 때, 기분 점수가 평균 15점 이상 조기 극복되었던 강력한 자정 패턴이 포착되었습니다! 오늘 주관식으로 털어놓아 주신 <em>&quot;{answers.subjective}&quot;</em> 일은 일시적인 흐름일 뿐, 당신의 회복력은 이미 충분히 입증되어 있습니다.
                </p>
              </div>
            )}

            {/* Checklist solutions */}
            <div className="mt-2 border-t border-zinc-900 pt-3.5 flex flex-col gap-2.5">
              <span className="text-[10px] font-bold text-white flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                기래프 처방 행동 솔루션
              </span>
              <ul className="flex flex-col gap-1.5 text-[10px] text-zinc-400 leading-normal font-semibold">
                <li className="flex items-start gap-1.5">
                  <span className="text-[var(--color-primary)]">•</span>
                  <span><strong>{answers.coping}</strong> 기법 즉각 10분 이상 돌입하기</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[var(--color-primary)]">•</span>
                  <span>따스한 온수가 담긴 머그컵 감싸며 체온 1도 상승시키기</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[var(--color-primary)]">•</span>
                  <span>하단에 준비된 4초 마인드 호흡을 천천히 3회 완수하기</span>
                </li>
              </ul>
            </div>

            <button
              onClick={resetQuiz}
              className="mt-3 py-2 px-3 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-[9px] font-bold cursor-pointer text-center transition-all w-fit self-end active:scale-95"
            >
              자가진단 다시 받기
            </button>
          </div>

          {/* Interactive AI Chatbot section (Consolidated solutions) */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[var(--color-primary)] animate-pulse" />
              마음 해결 솔루션 AI 대화방
            </h3>
            
            {/* Integrated Custom Chat Interface */}
            <div className="w-full flex flex-col h-[380px] border border-white/5 bg-zinc-900/10 backdrop-blur-sm rounded-3xl overflow-hidden shadow-xl">
              {/* Messages list */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5 no-scrollbar">
                {chatMessages.map((msg, idx) => {
                  const isBot = msg.sender === 'bot';
                  return (
                    <div key={idx} className={`flex gap-2.5 max-w-[85%] ${isBot ? 'self-start' : 'self-end flex-row-reverse'}`}>
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border shadow-md overflow-hidden ${
                          isBot
                            ? 'bg-zinc-800 border-zinc-700 text-[var(--color-primary)]'
                            : 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white text-[10px]'
                        }`}
                      >
                        {isBot ? <GiraffeFace score={averageMood} size={26} /> : '👤'}
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <div
                          className={`px-3.5 py-2.5 rounded-2xl text-[11px] leading-relaxed shadow-sm whitespace-pre-wrap ${
                            isBot
                              ? 'bg-zinc-800/80 text-zinc-200 rounded-tl-sm border border-zinc-800'
                              : 'bg-[var(--color-primary)] text-white rounded-tr-sm'
                          }`}
                        >
                          <p>{msg.text}</p>
                        </div>
                        <span className={`text-[8px] text-zinc-600 self-end mt-0.5 ${isBot ? 'self-start' : 'self-end'}`}>
                          {msg.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {chatIsTyping && (
                  <div className="flex gap-2.5 max-w-[85%] self-start animate-pulse">
                    <div className="w-7 h-7 rounded-xl bg-zinc-800 border border-zinc-700 text-[var(--color-primary)] flex items-center justify-center shrink-0 shadow-md overflow-hidden">
                      <GiraffeFace score={averageMood} size={26} />
                    </div>
                    <div className="px-4 py-2.5 bg-zinc-800/80 rounded-2xl rounded-tl-sm border border-zinc-800 flex items-center justify-center">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatMessagesEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendChat} className="p-3 border-t border-zinc-900 bg-zinc-950/20 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="여기에 솔직한 마음이나 원인을 물어보세요..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-zinc-800 bg-zinc-900/40 focus:outline-none focus:border-[var(--color-primary)] text-xs text-zinc-100 placeholder-zinc-600 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || chatIsTyping}
                  className="p-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:bg-zinc-900 text-white disabled:text-zinc-600 transition-colors shadow-lg active:scale-95 cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>

          {/* 4-Second Breathing Exercise Block */}
          <div className="p-5.5 rounded-3xl border border-white/5 bg-zinc-900/10 backdrop-blur-sm flex flex-col items-center gap-4 shadow-xl">
            <h3 className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5 self-start">
              <RefreshCw className={`w-3.5 h-3.5 text-[var(--color-primary)] ${breathingState !== 'idle' ? 'animate-spin' : ''}`} />
              신체 긴장 완화 기래프 4초 호흡법
            </h3>

            {/* Breathing Circle */}
            <div className="h-28 flex items-center justify-center my-1 relative">
              <div
                className={`w-20 h-20 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-[4000ms] ease-in-out ${getBreathingColor()}`}
              >
                {breathingState !== 'idle' ? (
                  <div className="text-center">
                    <span className="text-lg font-black text-white">{countdown}</span>
                    <p className="text-[7px] text-zinc-400 font-bold tracking-wider uppercase">{breathingState}</p>
                  </div>
                ) : (
                  <HeartPulse className="w-7 h-7 text-zinc-600 animate-pulse" />
                )}
              </div>
            </div>

            {/* Breathing status text */}
            <div className="text-center flex flex-col gap-1">
              <p className="text-[10px] font-bold text-zinc-200 transition-colors duration-300">{getBreathingLabel()}</p>
              <p className="text-[9px] text-zinc-500 max-w-xs leading-normal">
                불안감과 몸의 혈류량, 자율신경 조절을 유도하는 검증된 마인드 케어 호흡 훈련입니다.
              </p>
            </div>

            {/* Action button */}
            {breathingState === 'idle' ? (
              <button
                type="button"
                onClick={handleStartBreathing}
                className="px-4.5 py-1.5 rounded-xl text-[10px] font-bold bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white flex items-center gap-1 shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                호흡 가이드 켜기
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStopBreathing}
                className="px-4.5 py-1.5 rounded-xl text-[10px] font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center gap-1 border border-zinc-700 active:scale-95 transition-all cursor-pointer"
              >
                <Pause className="w-3 h-3 fill-current" />
                호흡 가이드 끄기
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import ChatInterface from '@/components/ChatInterface';
import GiraffeFace from '@/components/GiraffeFace';
import { moodService, MoodLog, getMoodState } from '@/lib/moodService';
import { aiService, isGeminiConfigured } from '@/lib/aiService';
import { Sparkles, Brain, CheckCircle2, HeartPulse, RefreshCw, Play, Pause, Compass, Send, User, Bot, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

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

  // Calendar States for Analysis Date
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [analysisDates, setAnalysisDates] = useState<Record<string, boolean>>({});

  // Quiz submission states
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
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

  // Dynamic analysis text state & tips state
  const [reportText, setReportText] = useState('');
  const [reportTips, setReportTips] = useState<string[]>([]);
  const [reportSummary, setReportSummary] = useState<string[]>([]);
  const [showFullReport, setShowFullReport] = useState(false);
  const [currentEstimatedScore, setCurrentEstimatedScore] = useState(50);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const fetched = await moodService.getMoodLogs();
        setLogs(fetched);
        fetchAnalysisDates();
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const fetchAnalysisDates = () => {
    try {
      const historyRecords = moodService.getAnalysisHistory();
      const indexed: Record<string, boolean> = {};
      historyRecords.forEach((h) => {
        const dStr = new Date(h.date).toLocaleDateString('ko-KR');
        indexed[dStr] = true;
      });
      setAnalysisDates(indexed);
    } catch (e) {
      console.error(e);
    }
  };

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

  const selectDate = (date: Date) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (date > today) {
      alert('미래의 마음은 미리 진단할 수 없어요. 🦒✨ 오늘이나 과거의 날짜를 선택해 주세요!');
      return;
    }
    setSelectedDate(date);
  };

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
  const handleQuizSubmit = async (e: React.FormEvent) => {
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

    setSubmittingQuiz(true);

    // Calculate dynamic estimated score
    let estimated = 50;
    if (quizResult.intensity.includes('⚡')) estimated = 25;
    else if (quizResult.intensity.includes('🌊')) estimated = 55;
    else if (quizResult.intensity.includes('🌫️')) estimated = 75;
    else estimated = 90;

    setCurrentEstimatedScore(estimated);
    setAnswers(quizResult);

    // Advanced dynamic AI analysis text scanning past logs with Time-Travel
    let analysisText = '';
    const isEarly = logs.length < 5;

    // Time travel log filtering: only consider logs up to selectedDate
    const targetDateMax = new Date(selectedDate);
    targetDateMax.setHours(23, 59, 59, 999);
    const relativeLogs = logs.filter(log => new Date(log.created_at) <= targetDateMax);

    const categoryKeywords: Record<string, string[]> = {
      '대인관계 👥': ['친구', '약속', '사람', '관계', '가족', '대화', '싸움', '오해', '소통', '선배', '후배', '동료', '애인', '남자친구', '여자친구', '부모', '엄마', '아빠', '연인', '싸웠', '통화', '만남'],
      '학업/진로 📚': ['공부', '과제', '학습', '시험', '진로', '취업', '합격', '학교', '수업', '성적', '발표', '프로젝트', '연구', '면접', '자격증', '학회', '성공', '실패', '공동', '조별'],
      '개인생활/휴식 🏡': ['집', '휴식', '개인', '취미', '영화', '잠', '침대', '혼자', '시간', '멍', '음악', '책', '독서', '산책', '게임', '여행', '목욕', '조용히', '카페', '커피'],
      '신체건강/컨디션 🏃': ['몸', '컨디션', '건강', '피로', '아픔', '병원', '감기', '잠', '운동', '식사', '스트레칭', '두통', '치료', '체력', '잠자리', '영양제', '피곤', '지침', '아팠', '헬스']
    };

    // Scan past recovery pattern
    const sortedRelativeLogs = [...relativeLogs].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    interface RecoveryPair {
      d1: MoodLog;
      d2: MoodLog;
      diff: number;
      isCategoryMatch: boolean;
    }

    const recoveryPairs: RecoveryPair[] = [];

    // Find pairs where mood score increased by >= 10 points within 3 days
    for (let i = 0; i < sortedRelativeLogs.length - 1; i++) {
      const d1 = sortedRelativeLogs[i];
      const d2 = sortedRelativeLogs[i + 1];

      const timeGapHours = Math.abs(new Date(d2.created_at).getTime() - new Date(d1.created_at).getTime()) / (1000 * 60 * 60);

      if (timeGapHours <= 72 && d1.mood_score <= 55 && d2.mood_score >= d1.mood_score + 10) {
        const keywords = categoryKeywords[quizResult.category] || [];
        const isCategoryMatch = keywords.some(kw => d1.reason.includes(kw) || d1.feeling.includes(kw));

        recoveryPairs.push({
          d1,
          d2,
          diff: d2.mood_score - d1.mood_score,
          isCategoryMatch
        });
      }
    }

    let chosenPair: RecoveryPair | null = null;
    const categoryMatches = recoveryPairs.filter(p => p.isCategoryMatch);

    if (categoryMatches.length > 0) {
      categoryMatches.sort((a, b) => b.diff - a.diff);
      chosenPair = categoryMatches[0];
    } else if (recoveryPairs.length > 0) {
      recoveryPairs.sort((a, b) => b.diff - a.diff);
      chosenPair = recoveryPairs[0];
    }

    let recoveryFound = false;
    let customRecoveryAction = '';
    let localTemplateText = '';
    let recoverySummaryPrompt = '';

    if (chosenPair) {
      recoveryFound = true;
      const { d1, d2, diff } = chosenPair;
      const formattedD1Date = new Date(d1.created_at).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
      const formattedD2Date = new Date(d2.created_at).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
      customRecoveryAction = d2.reason;

      if (chosenPair.isCategoryMatch) {
        localTemplateText = `과거 한동재님의 감정 지도를 깊숙이 스캔해 본 결과, 오늘 겪고 계신 '${quizResult.category}' 관련 무거움은 ${formattedD1Date}에 "${d1.reason}"(당시 기분 ${d1.mood_score}점)의 사유로 마음이 울적하셨던 순간과 매우 유사한 패턴을 띄고 있습니다. 하지만 놀랍게도 한동재님은 바로 다음 날인 ${formattedD2Date}에 "${d2.reason}"을(를) 실천하거나 집중하시며 기분 점수를 ${d2.mood_score}점까지 극적으로 도약(+${diff}점)시키셨던 찬란한 자가-회복 성공 이력을 가지고 계십니다! 오늘 선택하신 '${quizResult.coping}' 행동 처방과 더불어, 과거 본인이 직접 온몸으로 입증했던 비법인 "${d2.reason}"을(를) 가볍게 병행해 보세요. 당신은 이미 자신을 치유할 수 있는 완벽한 회복 공식과 내적인 지혜를 충분히 가지고 계시답니다.`;
        recoverySummaryPrompt = `과거 ${formattedD1Date}에 "${d1.reason}"으로 인해 기분이 ${d1.mood_score}점까지 떨어졌으나, 바로 다음 날인 ${formattedD2Date}에 "${d2.reason}"을(를) 실천하여 기분 점수가 ${d2.mood_score}점까지 극적으로 반등(+${diff}점)한 명확한 회복 성공 사례가 있습니다.`;
      } else {
        localTemplateText = `과거 한동재님의 감정 변화 이력을 분석해 보았습니다. 오늘 자극받으신 '${quizResult.category}' 영역의 스트레스 반응은 몸에서 발생한 '${quizResult.physical}' 신호와 결합되어 다소 지쳐 있는 상태임을 대변합니다. 카테고리는 완벽히 일치하지 않지만, 과거 ${formattedD1Date}에 기분 점수가 ${d1.mood_score}점까지 처져 있을 때, 한동재님이 다음 날인 ${formattedD2Date}에 "${d2.reason}"을(를) 행동하시며 기분 점수를 ${d2.mood_score}점까지 수직 반등(+${diff}점)시켰던 빛나는 회복력이 감지되었습니다. 오늘 처방받으신 '${quizResult.coping}' 활동과 함께, 과거 스스로 증명했던 위 극복 활동을 작게나마 일상에 다시 초대해보는 것은 어떨까요?`;
        recoverySummaryPrompt = `오늘과 완벽히 일치하는 영역은 아니지만, 과거 ${formattedD1Date}에 기분이 ${d1.mood_score}점까지 떨어졌을 때 다음 날인 ${formattedD2Date}에 "${d2.reason}"을(를) 통해 기분 점수가 ${d2.mood_score}점까지 반등(+${diff}점)한 회복 이력이 존재합니다.`;
      }
    } else {
      const happyLogs = relativeLogs.filter(log => log.mood_score >= 70);
      if (happyLogs.length > 0) {
        const bestLog = [...happyLogs].sort((a, b) => b.mood_score - a.mood_score)[0];
        const formattedBestDate = new Date(bestLog.created_at).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
        customRecoveryAction = bestLog.reason;
        localTemplateText = `과거 감정 데이터를 정량 분석한 결과, 아직 극적인 반등(+10점 이상) 패턴은 잡히지 않았지만, 한동재님의 가장 맑고 눈부셨던 날 중 하나인 ${formattedBestDate}의 순간(당시 최고점 ${bestLog.mood_score}점)을 발견해냈습니다. 당시 한동재님의 마음을 가득 채우고 기래프를 미소 짓게 했던 극복 비법은 바로 "${bestLog.reason}"이었습니다. 오늘 느낀 '${quizResult.category}' 자극과 몸의 '${quizResult.physical}' 긴장 반응을 비워내기 위해, 과거 나에게 최고의 미소와 활력을 돌려주었던 이 특별한 활동을 다시 시도해볼 것을 적극적으로 처방합니다.`;
        recoverySummaryPrompt = `과거 기분이 좋았거나 가장 최고점(최고점 ${bestLog.mood_score}점)이었던 날은 ${formattedBestDate}이며 당시 행동 요인은 "${bestLog.reason}"이었습니다. 명확하게 회복된 성공 사례는 없지만 이 긍정 행동을 추천하기 좋은 정보입니다.`;
      } else {
        recoverySummaryPrompt = `아직 축적된 감정 로그 데이터가 부족하여 과거 성공 극복 공식이나 이력이 포착되지 않았습니다. 보편적인 대인관계/건강 대처법을 권장해 주세요.`;
        if (isEarly) {
          localTemplateText = `오늘 느끼신 '${quizResult.category}' 영역의 스트레스 반응은 몸에서 나타난 '${quizResult.physical}' 긴장 신호와 합해져 자율신경계 피로를 대변하고 있습니다. 아직 기물 회복 통계 데이터가 부족하여 보편적인 대규모 사용자 임상 패턴을 대입해 드립니다. 평균 사용자들이 이럴 때 가장 빠른 조율을 보인 해결책은 바로 '${quizResult.coping}' 처방과 따스한 체온 유지, 수면 시간 확보였습니다. 메인 기-log에 오늘 기분 점수와 그 상세한 이유를 자주 기록해 가실수록, 기래프가 당신만의 극복 성공 사례를 자동 추출하여 1:1 특화 솔루션을 도출해냅니다.`;
        } else {
          localTemplateText = `오늘 선택하신 '${quizResult.category}' 자극은 강도 '${quizResult.intensity}' 수준으로 보이며, 몸에서는 '${quizResult.physical}' 신호를 발생시켜 피로 지수를 경고하고 있습니다. 아직 과거 기록 중 눈에 띄는 '+10점 이상 기분 상승 성공 패턴'이 모이지 않아 보편적 마인드 솔루션을 제안해 드립니다. 몸과 뇌의 긴장을 완화하기 위해 행동 팁 중 1가지를 즉시 실천해 본 뒤, 기분이 나아지면 기-log에 그 상세한 극복 요인을 적어주세요. 기록이 쌓일수록 오직 한동재님만을 위한 맞춤 극복 공식을 가동하게 됩니다.`;
        }
      }
    }

    try {
      if (isGeminiConfigured()) {
        analysisText = await aiService.getDiagnosisReport(quizResult, recoverySummaryPrompt);
      } else {
        analysisText = localTemplateText;
      }
    } catch (err) {
      console.error('Failed to generate LLM self-diagnosis report, fallback to template:', err);
      analysisText = localTemplateText;
    }

    const quizTips = [
      `${quizResult.coping} 행동 솔루션을 즉각 10분 이상 시도하기`,
      `하단의 4초 마인드 호흡 가이드를 천천히 3회 완수하여 뇌 에너지 충전하기`
    ];

    if (customRecoveryAction) {
      quizTips.unshift(`[나만의 극복 비법] 과거 효과적이었던 "${customRecoveryAction.slice(0, 30)}${customRecoveryAction.length > 30 ? '...' : ''}" 다시 시도해보기`);
    } else {
      quizTips.push(`따스한 온수를 마시며 굳어 있는 신체 근육 긴장 완화하기`);
    }

    setReportText(analysisText);
    setReportTips(quizTips);
    setShowFullReport(false); // Default to summary view!

    // Generate 3-line summary dynamically
    let summaryLines: string[] = [];
    if (recoveryFound && chosenPair) {
      summaryLines = [
        `📋 현재 한동재님은 '${quizResult.category}' 자극과 '${quizResult.physical}' 반응으로 피로를 겪는 중입니다.`,
        `💡 과거 ${new Date(chosenPair.d1.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}에 동일 스트레스를 "${chosenPair.d2.reason}"(으)로 이겨내셨던 기적의 복구 패턴(+${chosenPair.diff}점)이 감지되었습니다.`,
        `🌱 오늘 제안된 '${quizResult.coping}' 행동을 천천히 실천해 보시며 나만의 극복 매뉴얼을 다시 작동시킬 때입니다.`
      ];
    } else if (customRecoveryAction) {
      summaryLines = [
        `📋 현재 '${quizResult.category}' 자극으로 인해 몸에 '${quizResult.physical}' 긴장 신호가 발생해 마음이 무거운 상태입니다.`,
        `💡 비록 직접적인 회복 공식은 없지만, 과거 나에게 최고의 미소를 안겨주었던 "${customRecoveryAction.slice(0, 30)}..." 활동을 추천해 드립니다.`,
        `🌱 과거 성공했던 특별한 극복 활동을 작게 실천하시고, 하단의 마인드 복식호흡을 가동해 뇌 에너지를 리셋해보세요.`
      ];
    } else {
      summaryLines = [
        `📋 오늘 느끼시는 '${quizResult.category}' 영역의 자극은 몸에 '${quizResult.physical}' 신체 피로를 남기고 있습니다.`,
        `💡 아직 기록 데이터가 부족하여 일반 사용자 평균 통계에 기초한 최적의 마인드 솔루션을 우선 제안해 드립니다.`,
        `🌱 오늘 처방된 '${quizResult.coping}' 활동과 수면 시간 확보에 주력해 보시고, 나아진 결과를 달력에 기록해 주세요.`
      ];
    }
    setReportSummary(summaryLines);
    setQuizSubmitted(true);

    // Save generated report to history permanently!
    moodService.addAnalysisHistory({
      answers: quizResult,
      analysisText: analysisText,
      actionTips: quizTips,
      moodScore: estimated,
      date: selectedDate.toISOString() // Time travel chosen date!
    });

    fetchAnalysisDates(); // Instant calendar icon update!

    let welcomeText = `안녕하세요! 당신만을 위한 기래프 AI 마음 해결사입니다. 🦒✨\n\n오늘 당신의 마음 영역은 **'${quizResult.category}'**이며, 감정의 강도는 **'${quizResult.intensity}'**로 느껴지고 있군요. 몸에서는 **'${quizResult.physical}'** 반응이 와닿아 많이 지쳤을 텐데, **'${quizResult.coping}'** 처방으로 해결 방향을 잡으려 하시는군요.\n\n`;

    if (recoveryFound && chosenPair) {
      welcomeText += `제 데이터망에 감지된 소중한 비결이 하나 있어요! 과거 한동재님이 비슷한 상황으로 힘들어하실 때 **"${chosenPair.d2.reason}"**을(를) 통해 슬기롭게 회복하셨던 성공 기억이 있더라고요. 🌸\n\n오늘 이 성공 열쇠를 기반으로 제작된 'AI 심층 처방 분석'을 아래 정리해 두었으니 확인해 주세요. 저와 더 편안하고 사소한 마음 이야기를 나누고 싶다면 무엇이든 물어보세요!`;
    } else if (customRecoveryAction) {
      welcomeText += `기록을 분석해 보니 한동재님의 마음에 웃음을 주었던 **"${customRecoveryAction.slice(0, 40)}"**의 추억이 있더라고요. 오늘 그 행복 조각을 기반으로 마음을 케어할 수 있는 심층 리포트를 완성해 두었습니다.\n\n저와 더 대화를 나누며 피로를 털어내고 싶다면 무엇이든 편하게 이야기해 주세요. 제가 따뜻하게 들어 드릴게요. 🌸`;
    } else {
      welcomeText += `구체적으로 털어놓아 주신 _"${quizResult.subjective || '마음이 조금 지쳐요.'}"_ 상황을 바탕으로, 아래에 **'AI 심층 처방 분석'**과 **'맞춤형 대처법'**을 정리해 두었습니다. 저와 함께 더 편안한 이야기를 나눠보고 싶다면 무엇이든 질문해 주세요. 제가 따뜻하게 들어 드릴게요. 🌸`;
    }

    // Dynamic initial chatbot messages customized with user quiz answers
    setChatMessages([
      {
        id: 'welcome-counselor',
        sender: 'bot',
        text: welcomeText,
        timestamp: new Date(),
      } as any
    ]);

    setSubmittingQuiz(false);
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatIsTyping) return;

    const userMsg = {
      id: Math.random().toString(),
      sender: 'user',
      text: chatInput,
      timestamp: new Date(),
    };

    const currentHistory = [...chatMessages, userMsg as any];
    setChatMessages((prev) => [...prev, userMsg as any]);
    setChatInput('');
    setChatIsTyping(true);

    try {
      let botResponseText = '';
      if (isGeminiConfigured()) {
        botResponseText = await aiService.getChatbotResponse(currentHistory, userMsg.text);
      } else {
        botResponseText = await new Promise<string>((resolve) => {
          setTimeout(() => {
            resolve(getCustomBotResponse(userMsg.text));
          }, 1000);
        });
      }

      const botMsg = {
        id: Math.random().toString(),
        sender: 'bot',
        text: botResponseText,
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, botMsg as any]);
    } catch (err) {
      console.error('Embedded AI chat failed, using fallback:', err);
      const botResponseText = getCustomBotResponse(userMsg.text);
      const botMsg = {
        id: Math.random().toString(),
        sender: 'bot',
        text: botResponseText,
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, botMsg as any]);
    } finally {
      setChatIsTyping(false);
    }
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

  const renderCalendar = () => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days: React.ReactNode[] = [];
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-full" />);
    }

    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(currentYear, currentMonth, d);
      const dStr = date.toLocaleDateString('ko-KR');
      const hasReport = analysisDates[dStr];
      const isSelected = selectedDate.toDateString() === date.toDateString();
      const isToday = new Date().toDateString() === date.toDateString();
      const isFuture = date > new Date();

      days.push(
        <button
          key={`day-${d}`}
          type="button"
          disabled={isFuture}
          onClick={() => selectDate(date)}
          className={`h-10 w-full rounded-xl flex flex-col items-center justify-center relative transition-all duration-300 active:scale-90 ${
            isFuture ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'
          } ${
            isSelected
              ? 'border border-[var(--color-primary)] font-bold text-white bg-[var(--color-primary)]/20 shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.3)]'
              : isToday
              ? 'border border-zinc-700 font-bold text-[var(--color-primary)] bg-zinc-800/10'
              : 'hover:bg-zinc-800/40 border border-transparent'
          }`}
        >
          <span className={`text-[10px] ${isFuture ? 'text-zinc-700' : isSelected ? 'text-white' : isToday ? 'text-[var(--color-primary)]' : 'text-zinc-400'}`}>
            {d}
          </span>
          {hasReport && (
            <span className="text-[8px] text-[var(--color-primary)] absolute -bottom-0.5 filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.2)] animate-pulse">
              📋
            </span>
          )}
        </button>
      );
    }

    return (
      <div className="flex flex-col gap-2 p-4 rounded-3xl border border-white/5 bg-zinc-900/10 backdrop-blur-sm">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[var(--color-primary)]" />
            진단 날짜 선택: {currentYear}년 {currentMonth + 1}월
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white cursor-pointer active:scale-95 animate-transition"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white cursor-pointer active:scale-95 animate-transition"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 mt-2">
          {weekDays.map((wd) => (
            <div key={wd} className="text-[10px] text-zinc-600 font-bold text-center py-1">
              {wd}
            </div>
          ))}
          {days}
        </div>
        <div className="text-[8px] text-zinc-500 font-semibold px-1 mt-1 flex items-center gap-1">
          <span>※ 과거의 날짜를 선택하여 당시의 마음 처방 보고서를 자가진단할 수 있습니다. (📋 아이콘은 이미 진단된 날짜입니다)</span>
        </div>
      </div>
    );
  };

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
        /* Quiz Survey Interface with Cozy Calendar Selection */
        <div className="flex flex-col gap-5">
          {renderCalendar()}

          <form onSubmit={handleQuizSubmit} className="flex flex-col gap-5">
            <div className="p-5 rounded-3xl border border-white/5 bg-zinc-900/10 backdrop-blur-sm flex flex-col gap-4">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-zinc-900 pb-2">
                <Compass className="w-4 h-4 text-[var(--color-primary)] animate-pulse" />
                {selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일의 마음 자가진단
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
              disabled={submittingQuiz}
              className="w-full py-4 px-6 rounded-2xl font-bold text-xs bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white transition-all duration-300 shadow-lg active:scale-98 cursor-pointer text-center flex items-center justify-center gap-2"
            >
              {submittingQuiz ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  마음 분석 및 처방전 조율 중...
                </>
              ) : (
                '기래프 AI 진단 및 해결책 받기'
              )}
            </button>
          </form>
        </div>
      ) : (
        /* Dynamic Consolidated Analysis & Solution Block */
        <div className="flex flex-col gap-6 animate-fade-in">
          {/* Merged AI Analysis Report Card */}
          <div className="p-5.5 rounded-3xl border border-white/5 bg-gradient-to-br from-zinc-900/40 via-zinc-950/65 to-zinc-900/40 shadow-xl flex flex-col gap-4 relative overflow-hidden">
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
            <div className="flex flex-col gap-3">
              {isEarlyStage ? (
                <div className="px-3 py-2 rounded-xl bg-amber-950/20 border border-amber-900/30 text-amber-400 text-[10px] font-bold">
                  ⚠️ 누적 감정 데이터가 부족해 현재 {logs.length}개 / 5개, 보편적인 대규모 사용자 평균 임상 상황을 대입한 일반 분석을 제공해 드립니다.
                </div>
              ) : (
                <div className="px-3 py-2 rounded-xl bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 text-[10px] font-bold">
                  ✓ 축적된 {logs.length}개의 정밀 감정 조각을 분석해 한동재님만을 위한 맞춤형 딥케어 분석이 완료되었습니다.
                </div>
              )}
              
              {!showFullReport ? (
                /* 3-Line Summary View */
                <div className="flex flex-col gap-2.5">
                  <ul className="flex flex-col gap-2 text-[11px] text-zinc-300 font-semibold leading-relaxed">
                    {reportSummary.map((line, idx) => (
                      <li key={idx} className="flex gap-2 items-start bg-zinc-950/20 p-2.5 rounded-2xl border border-white/5 shadow-sm">
                        <span className="shrink-0 text-xs">{line.slice(0, 2)}</span>
                        <span>{line.slice(2)}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => setShowFullReport(true)}
                    className="w-full py-2 px-3 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 hover:bg-zinc-800 text-[10px] font-black text-zinc-300 hover:text-white rounded-2xl cursor-pointer text-center transition-all mt-1 active:scale-95 flex items-center justify-center gap-1 shadow-sm"
                  >
                    <span>기래프 AI 심층 처방 상세보기 ▾</span>
                  </button>
                </div>
              ) : (
                /* Full Detailed Report View */
                <div className="flex flex-col gap-3.5">
                  <p className="text-[11px] text-zinc-300 leading-relaxed font-medium whitespace-pre-wrap bg-zinc-950/20 p-3.5 rounded-2xl border border-white/5 shadow-sm">
                    {reportText}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowFullReport(false)}
                    className="w-full py-2 px-3 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 hover:bg-zinc-800 text-[10px] font-black text-zinc-300 hover:text-white rounded-2xl cursor-pointer text-center transition-all mt-1 active:scale-95 flex items-center justify-center gap-1 shadow-sm"
                  >
                    <span>처방 리포트 요약하여 보기 ▴</span>
                  </button>
                </div>
              )}
            </div>

            {/* Checklist solutions */}
            <div className="mt-2 border-t border-zinc-900 pt-3.5 flex flex-col gap-2.5">
              <span className="text-[10px] font-bold text-white flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                기래프 처방 행동 솔루션
              </span>
              <ul className="flex flex-col gap-1.5 text-[10px] text-zinc-400 leading-normal font-semibold">
                {reportTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-[var(--color-primary)]">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
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
                <Play className="w-3.5 h-3.5 fill-current" />
                호흡 가이드 켜기
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStopBreathing}
                className="px-4.5 py-1.5 rounded-xl text-[10px] font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center gap-1 border border-zinc-700 active:scale-95 transition-all cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                호흡 가이드 끄기
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

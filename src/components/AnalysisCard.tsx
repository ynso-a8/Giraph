'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, Lightbulb, Sparkles, Smile, Flame, Moon } from 'lucide-react';

interface CardNewsItem {
  id: number;
  category: 'sad' | 'tired' | 'calm' | 'happy' | 'angry';
  title: string;
  subtitle: string;
  quote: string;
  tips: string[];
  gradient: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}

const cardNewsData: CardNewsItem[] = [
  {
    id: 1,
    category: 'sad',
    title: '슬픔과 마주할 때',
    subtitle: '억누르기보다 온전히 흘려보내기',
    quote: '"슬픔은 마음의 비와 같습니다. 비가 내린 뒤에 땅이 굳듯이, 감정을 쏟아내는 것은 치유의 시작입니다."',
    tips: [
      '슬픈 영화나 음악을 감상하며 펑펑 울어보기',
      '현재 느끼는 감정을 일기장에 가감 없이 적어내리기',
      '따뜻한 차나 우유를 마시며 나 자신을 끌어안아 주기',
      '충분한 수면과 영양 섭취로 몸의 항상성 회복하기',
    ],
    gradient: 'from-blue-600 to-indigo-900',
    icon: Moon,
    accentColor: 'bg-blue-500/20 text-blue-300',
  },
  {
    id: 2,
    category: 'tired',
    title: '몸과 마음이 번아웃되었을 때',
    subtitle: '아무것도 하지 않을 자유 허락하기',
    quote: '"지쳤다는 것은 그만큼 당신이 매 순간 최선을 다해 살아왔다는 증거입니다. 쉼표를 찍어도 괜찮습니다."',
    tips: [
      '스마트폰과 PC 등 모든 화면 기기 오프라인으로 끄기',
      '15분간 깊게 들이쉬고 내쉬는 복식 호흡 연습하기',
      '숲길, 공원 등 조용한 자연 속을 가볍게 거닐기',
      '오늘 하루 해야 할 일 목록을 과감히 내일로 미루기',
    ],
    gradient: 'from-amber-600 to-amber-900',
    icon: Lightbulb,
    accentColor: 'bg-amber-500/20 text-amber-300',
  },
  {
    id: 3,
    category: 'angry',
    title: '분노가 가슴을 메울 때',
    subtitle: '일시정지 버튼을 누르는 지혜',
    quote: '"화가 났을 때 말을 하면, 당신은 평생 후회할 최고의 연설을 하게 될 것입니다. 잠시 숨을 고르세요."',
    tips: [
      '대화나 다툼 상황에서 물리적으로 10분간 벗어나기',
      '1부터 100까지 천천히 마음속으로 소리 내어 세어보기',
      '빠르고 격렬한 음악을 듣거나, 베개를 세게 때려보기',
      '차가운 물로 세수를 하며 뇌의 열기를 식히기',
    ],
    gradient: 'from-rose-600 to-red-950',
    icon: Flame,
    accentColor: 'bg-rose-500/20 text-rose-300',
  },
  {
    id: 4,
    category: 'happy',
    title: '행복한 에너지를 만끽할 때',
    subtitle: '행복의 기억을 내 마음에 저장하기',
    quote: '"행복은 크기가 아니라 빈도입니다. 작은 기쁨을 알아채고 기억할수록 삶은 풍성해집니다."',
    tips: [
      '감사한 사람에게 짧은 안부 카톡이나 편지 남기기',
      '오늘의 좋았던 순간을 사진으로 남기거나 상세히 기록하기',
      '나를 위한 작은 선물(좋아하는 음식, 사고 싶던 책 등) 주기',
      '행복한 감정을 가족이나 친구들과 나누며 에너지 배가시키기',
    ],
    gradient: 'from-violet-600 to-fuchsia-900',
    icon: Sparkles,
    accentColor: 'bg-violet-500/20 text-violet-300',
  },
  {
    id: 5,
    category: 'calm',
    title: '평온하고 고요한 하루',
    subtitle: '현재의 평화를 깊게 음미하는 방법',
    quote: '"행복의 가장 순수한 형태는 평온입니다. 파도가 일지 않는 호수 같은 마음을 즐기세요."',
    tips: [
      '조용한 음악을 들으며 차 한 잔 음미해보기',
      '오늘 하루 안전하고 무탈했던 모든 요소에 감사하기',
      '마음에 와닿는 소설책이나 수필집 몇 페이지 읽어보기',
      '따뜻한 물에 족욕이나 반신욕을 하며 근육 긴장 풀기',
    ],
    gradient: 'from-teal-600 to-emerald-900',
    icon: Smile,
    accentColor: 'bg-teal-500/20 text-teal-300',
  },
];

export default function AnalysisCard() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? cardNewsData.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === cardNewsData.length - 1 ? 0 : prev + 1));
  };

  const currentCard = cardNewsData[activeIndex];
  const Icon = currentCard.icon;

  return (
    <div className="w-full flex flex-col items-center gap-6">
      {/* Outer Card Wrapper */}
      <div className={`relative w-full aspect-[4/5] sm:aspect-[4/4.5] max-w-sm rounded-[32px] overflow-hidden shadow-2xl transition-all duration-500 transform hover:scale-[1.01]`}>
        {/* Background Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-b ${currentCard.gradient} opacity-90 z-0`} />
        
        {/* Decorative background glow */}
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-white/10 blur-3xl z-0" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-black/30 blur-3xl z-0" />

        {/* Content Overlay */}
        <div className="absolute inset-0 z-10 p-7 flex flex-col justify-between text-white">
          {/* Header */}
          <div className="flex justify-between items-center">
            <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${currentCard.accentColor}`}>
              <Icon className="w-3.5 h-3.5" />
              {currentCard.category.toUpperCase()}
            </span>
            <span className="text-xs text-white/50 font-semibold tracking-wider">
              {activeIndex + 1} / {cardNewsData.length}
            </span>
          </div>

          {/* Main Title & Subtitle */}
          <div className="mt-4">
            <p className="text-xs text-white/70 font-medium mb-1">{currentCard.subtitle}</p>
            <h2 className="text-2xl font-black tracking-tight leading-tight">{currentCard.title}</h2>
          </div>

          {/* Quote Section */}
          <div className="my-5 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <p className="text-xs italic leading-relaxed text-white/90 text-center font-medium">
              {currentCard.quote}
            </p>
          </div>

          {/* Solutions / Actionable Tips */}
          <div className="flex-1 flex flex-col justify-center gap-3">
            <p className="text-xs font-bold text-white/80 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              마음 건강 처방전 (행동 팁)
            </p>
            <ul className="flex flex-col gap-2">
              {currentCard.tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs leading-relaxed text-white/90">
                  <span className="inline-flex items-center justify-center min-w-4 min-h-4 w-4 h-4 rounded-full bg-white/20 text-[9px] font-bold mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Navigation Indicators */}
      <div className="flex items-center justify-between w-full max-w-sm px-2">
        <button
          onClick={handlePrev}
          className="p-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all duration-300 shadow-md active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Bullet indicators */}
        <div className="flex gap-2">
          {cardNewsData.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeIndex === idx ? 'w-6 bg-violet-500' : 'w-2 bg-zinc-800'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="p-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all duration-300 shadow-md active:scale-95"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

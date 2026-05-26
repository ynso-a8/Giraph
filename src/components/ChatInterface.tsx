'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, AlertCircle } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

const getBotResponse = (userInput: string): string => {
  const text = userInput.toLowerCase();

  if (text.includes('안녕') || text.includes('하이') || text.includes('반가워')) {
    return '안녕하세요! 오늘 당신의 마음을 위로하고 경청하기 위해 기다리고 있었어요. 요즘 어떤 고민이나 감정이 당신의 마음을 채우고 있나요? 편하게 털어놓아 보세요.';
  }
  if (text.includes('힘들') || text.includes('어려워') || text.includes('버겁')) {
    return '많이 힘드셨군요... 😔 인생을 살아가다 보면 모든 것이 버겁고 멈추고 싶은 순간이 누구나 찾아와요. 지금 힘든 마음은 당신이 그만큼 잘해내고 싶어서 애쓰고 있었다는 신호이기도 해요. 잠시 마음의 짐을 내려놓고 숨을 깊게 쉬어보는 건 어떨까요? 제가 늘 곁에서 들어드릴게요.';
  }
  if (text.includes('우울') || text.includes('슬퍼') || text.includes('눈물')) {
    return '마음의 비가 내리고 있군요. 우울하고 슬픈 감정이 들 때는 억지로 밝은 척하지 않아도 괜찮아요. 감정을 꾹꾹 눌러 담다 보면 마음이 더 체하게 마련이거든요. 오늘 밤은 당신만을 위한 편안한 차를 마시며 온전히 휴식을 취했으면 좋겠어요. 슬픔의 터널은 분명 지나갈 거예요.';
  }
  if (text.includes('화나') || text.includes('짜증') || text.includes('열받')) {
    return '정말 화가 나고 속상하셨겠어요! 😤 부당하거나 뜻대로 되지 않는 상황 속에서 분노가 끓어오르는 것은 너무나 자연스러운 반응이에요. 지금은 그 뜨거워진 감정을 천천히 식히기 위해 잠시 심호흡을 하거나 찬 물 한 잔 마시는 걸 추천해요. 누구 때문에 그렇게 속상하셨는지 이야기해 주시면 같이 들어드릴게요.';
  }
  if (text.includes('피곤') || text.includes('졸려') || text.includes('번아웃') || text.includes('지쳐')) {
    return '요즘 쉴 틈 없이 달려오셨나 봐요. 에너지 배터리가 완전히 방전된 것 같을 때는 모든 일을 멈추고 자신에게 "쉼"을 선물해야 해요. 오늘은 꼭 스마트폰도 멀리하고, 따뜻한 물로 샤워를 한 뒤 평소보다 1시간만 일찍 잠자리에 들어보세요. 잠이 최고의 보약이랍니다.';
  }
  if (text.includes('불안') || text.includes('걱정') || text.includes('근심') || text.includes('시험') || text.includes('면접')) {
    return '미래에 대한 불확실성 때문에 마음이 콩닥거리고 불안하시군요. 겪어보지 않은 일에 대한 두려움은 당연한 감정이에요. 하지만 기억하세요, 당신은 생각보다 훨씬 더 단단하고 지혜로운 사람이라는 것을요. 걱정의 90%는 실제로 일어나지 않는다고 해요. 지금 이 순간에만 온전히 집중해 보세요. 당신은 충분히 잘해낼 것입니다!';
  }
  if (text.includes('고마워') || text.includes('감사') || text.includes('위로')) {
    return '도움이 되었다니 제가 더 감사해요! 😊 당신의 따뜻한 감사의 한 마디가 저에게도 큰 힘이 되네요. 언제든 마음을 털어놓고 싶을 때 이곳으로 와주세요. 늘 열려있을게요. 오늘도 따뜻하고 평온한 밤 보내세요.';
  }

  // Default therapeutic responses
  const fallbacks = [
    '당신의 이야기를 들으니 마음이 찡하네요. 더 자세히 이야기해 주실 수 있나요? 듣고 있어요.',
    '그런 일이 있으셨군요. 그 상황에서 마음이 정말 어지러우셨을 것 같아요. 요즘 이런 상태가 오래 지속되었나요?',
    '말해주셔서 고마워요. 속에만 담아두면 곪기 마련인데 이렇게 용기 내어 털어놓는 것만으로도 마음 치유의 첫걸음이랍니다.',
    '그때 당시의 당신의 감정은 전적으로 옳아요. 어떤 마음이었을지 짐작이 가네요. 힘내라는 말보단 그냥 곁에 묵묵히 있어 드리고 싶어요.',
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: '안녕하세요! 당신만을 위한 AI 마음 치유 챗봇입니다. 오늘 당신의 마음을 어지럽히는 생각이나 속상한 감정이 있다면 무엇이든 털어놓아 주세요. 따뜻하게 들어드릴게요. 🌸',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate thinking delay
    setTimeout(() => {
      const responseText = getBotResponse(userMsg.text);
      const botMsg: Message = {
        id: Math.random().toString(),
        sender: 'bot',
        text: responseText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="w-full flex flex-col h-[500px] border border-zinc-800 bg-zinc-900/40 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-5 py-4 border-b border-zinc-800 bg-zinc-950/60 flex items-center gap-3">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide">마음 힐링 AI 상담사</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-zinc-400 font-medium">따뜻하게 경청하는 중</span>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
        {messages.map((msg) => {
          const isBot = msg.sender === 'bot';
          return (
            <div key={msg.id} className={`flex gap-3 max-w-[85%] ${isBot ? 'self-start' : 'self-end flex-row-reverse'}`}>
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border shadow-md ${
                  isBot
                    ? 'bg-zinc-800 border-zinc-700 text-violet-400'
                    : 'bg-violet-600 border-violet-500 text-white'
                }`}
              >
                {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Bubble */}
              <div className="flex flex-col gap-1">
                <div
                  className={`px-4 py-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                    isBot
                      ? 'bg-zinc-800/80 text-zinc-200 rounded-tl-sm border border-zinc-800'
                      : 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-tr-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
                <span className={`text-[9px] text-zinc-500 self-end ${isBot ? 'self-start' : 'self-end'}`}>
                  {msg.timestamp.toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-3 max-w-[85%] self-start">
            <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 text-violet-400 flex items-center justify-center shrink-0 shadow-md">
              <Bot className="w-4 h-4" />
            </div>
            <div className="px-4 py-3 bg-zinc-800/80 rounded-2xl rounded-tl-sm border border-zinc-800 flex items-center justify-center">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <form onSubmit={handleSend} className="p-4 border-t border-zinc-800 bg-zinc-950/40 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="여기에 솔직한 마음을 적어보세요..."
          className="flex-1 px-4 py-2.5 rounded-2xl border border-zinc-800 bg-zinc-900/60 focus:outline-none focus:border-violet-500 text-xs text-zinc-100 placeholder-zinc-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="p-2.5 rounded-2xl bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 text-white disabled:text-zinc-500 transition-colors shadow-lg active:scale-95 cursor-pointer shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

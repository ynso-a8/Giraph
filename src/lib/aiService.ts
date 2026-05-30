import { supabase } from './supabase';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

export const isGeminiConfigured = (): boolean => {
  return (
    !!GEMINI_API_KEY &&
    GEMINI_API_KEY !== 'your_gemini_api_key' &&
    GEMINI_API_KEY !== ''
  );
};

export const callGeminiAPI = async (
  prompt: string,
  systemInstruction?: string,
  history: { role: 'user' | 'model'; parts: { text: string }[] }[] = []
): Promise<string> => {
  if (!isGeminiConfigured()) {
    throw new Error('Gemini API key is not configured.');
  }

  // Use gemini-2.5-flash for fast and cost-effective text generation
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  // Assemble contents including chat history if present
  const contents = [...history];
  contents.push({
    role: 'user',
    parts: [{ text: prompt }],
  });

  const body: any = {
    contents,
  };

  if (systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API request failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Invalid response structure from Gemini API.');
  }

  return text.trim();
};

export const aiService = {
  // 1. AI Chatbot
  async getChatbotResponse(
    chatHistory: { sender: 'user' | 'bot'; text: string }[],
    newMessage: string
  ): Promise<string> {
    const systemInstruction = `당신은 기분 다이어리 서비스 '기래프'의 친절하고 따뜻한 AI 상담사입니다. 우울, 불안, 번아웃, 피로 등 스트레스를 겪는 사용자에게 공감하고, 내면의 지혜를 발휘해 따뜻하게 위로해 주세요. 너무 차가운 기계 같지 않고 감성적인 어투(친근한 '~해요', '~했군요' 체)로 한국어로 말해 주세요. 3줄 내외로 답변해 주세요.`;

    // Map UI history to Gemini format (role must be 'user' or 'model')
    // We take the last 8 messages to keep the context window compact and fast
    const geminiHistory = chatHistory.slice(-8).map((msg) => ({
      role: msg.sender === 'user' ? ('user' as const) : ('model' as const),
      parts: [{ text: msg.text }],
    }));

    return callGeminiAPI(newMessage, systemInstruction, geminiHistory);
  },

  // 2. AI Self-Diagnosis Report
  async getDiagnosisReport(
    answers: {
      category: string;
      intensity: string;
      physical: string;
      coping: string;
      subjective: string;
    },
    pastRecoverySummary: string
  ): Promise<string> {
    const systemInstruction = `당신은 기분 다이어리 서비스 '기래프'의 마인드 케어 분석 전문가입니다. 사용자가 보낸 마음 자가진단 항목과 과거 데이터 분석 결과를 바탕으로, 부드럽고 전문적인 감성 치료 보고서를 작성해 주는 역할입니다.`;

    const prompt = `사용자의 자가진단 응답과 과거 감정 회복 공식을 분석하여 깊은 공감과 극복 처방전을 도출해 주세요.

[사용자 자가진단 답변]
- 감정 스트레스 자극 요인: ${answers.category}
- 감정의 세기 강도: ${answers.intensity}
- 몸에 나타나는 신체적 피로/반응: ${answers.physical}
- 희망하는 마음 조율 행동: ${answers.coping}
- 구체적이고 솔직한 고민 사유: "${answers.subjective || '없음'}"

[과거 내역 데이터 기반 회복 성공 패턴 분석]
${pastRecoverySummary}

위의 정보들을 종합 분석하여 사용자의 아픈 감정을 따뜻하게 수용해주고, 과거 본인의 성공 공식(데이터 분석에 기록된 성공 극복 사례가 있다면 반드시 활용해 격려)과 이번에 처방받은 '${answers.coping}' 행동 솔루션을 조화롭게 엮어, 앞으로 일상의 마음 리듬을 되찾을 수 있는 정성스러운 처방 보고서를 작성해 주세요.
* 작성 조건:
1. 문단 나누기 없이 줄글로 자연스럽게 연결된 한 문단 형태로 작성해 주세요.
2. 따뜻하고 전문적인 경어체('~합니다', '~해요' 체)를 사용해 주세요.
3. 분량은 한글 공백 포함 300~450자 내외로 정교하게 지어주세요.
4. 사용자의 이름은 '한동재님'으로 지칭해 주세요.`;

    return callGeminiAPI(prompt, systemInstruction);
  },

  // 3. AI Future Self Letter
  async getFutureSelfLetter(logCount: number, averageMood: number, moodMetaphor: string): Promise<string> {
    const systemInstruction = `당신은 기분 다이어리 서비스 '기래프'의 시공간 감성 연결사입니다. 몇 년 뒤 온전히 기분을 회복하고 행복하고 든든하게 살아가고 있는 '미래의 나'의 입장이 되어, 현재 일상의 고충을 기록하며 애쓰고 있는 '과거의 나'에게 사랑과 감사의 편지를 작성해 주세요.`;

    const prompt = `사용자의 감정 통계 데이터를 바탕으로 미래의 내가 과거의 나에게 보내는 위로와 응원의 편지를 한 편 지어주세요.

[사용자 감정 통계]
- 현재 기래프에 기록된 일기 수: ${logCount}개
- 그동안 기록된 평균 기분 점수: ${averageMood}점 (0점 우울 ~ 100점 최고행복)
- 감정 메타포(비유): ${moodMetaphor}

위 데이터를 바탕으로, 평균 ${averageMood}점대의 감정 노선을 지나며 마음을 기록하기 위해 꾸준히 용기를 냈던 과거의 나를 기특해하고 칭찬해 주세요. 감정 메타포에 어울리는 문학적 표현(예: 가뭄에 마른 초원, 싱그러운 숲 등)을 풍부하게 가미하여, 편안하게 미소 지을 수 있는 3-4문단 정도의 완성도 높은 편지를 작성해 주세요.
* 작성 조건:
1. 친근하고 감성적인 독백 형태('~야', '~단다', '~있을게' 등의 어투)로 작성해 주세요.
2. 편지의 첫 시작은 "안녕? 미래의 나야. 🦒✨"로 시작해 주세요.
3. 분량은 한글 공백 포함 400~500자 내외로 마음을 울리는 따뜻한 어조로 작성해 주세요.
4. 사용자의 이름은 '한동재님' 또는 '너'라고 지칭해 주세요.`;

    return callGeminiAPI(prompt, systemInstruction);
  },
};

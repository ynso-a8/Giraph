import { supabase } from './supabase';

export interface MoodLog {
  id: string;
  user_id?: string;
  mood_score: number;
  feeling: string;
  reason: string;
  change_reason: string;
  created_at: string;
}

export interface AnalysisHistory {
  id: string;
  date: string;
  answers: {
    category: string;
    intensity: string;
    physical: string;
    coping: string;
    subjective: string;
  };
  analysisText: string;
  actionTips: string[];
  moodScore: number;
}

export interface MoodState {
  emoji: string;
  label: string;
  color: string;
  gradient: string;
  description: string;
  accentColor?: string; // Optional field for compatibility if needed
}

export const getMoodState = (score: number): MoodState & { accentColor: string } => {
  if (score <= 20) {
    return {
      emoji: '🦒😭',
      label: '우울함/속상함',
      color: 'text-rose-400',
      gradient: 'from-rose-600/30 to-orange-600/10',
      description: '기래프가 목을 축 처뜨리고 눈물 흘려요. 따스한 포옹과 위로가 필요해요.',
      accentColor: 'bg-rose-500/20 text-rose-300',
    };
  }
  if (score <= 40) {
    return {
      emoji: '🦒🥱',
      label: '지침/번아웃',
      color: 'text-orange-400',
      gradient: 'from-orange-500/30 to-amber-500/10',
      description: '기래프의 배터리가 방전되었어요. 아무 생각 없이 푹 쉴 시간이 필요해요.',
      accentColor: 'bg-orange-500/20 text-orange-300',
    };
  }
  if (score <= 60) {
    return {
      emoji: '🦒🌾',
      label: '평온/잔잔함',
      color: 'text-amber-400',
      gradient: 'from-amber-500/20 to-teal-500/10',
      description: '기래프가 초원에서 평화롭게 풀을 뜯고 있어요. 무난하고 차분한 하루예요.',
      accentColor: 'bg-amber-500/20 text-amber-300',
    };
  }
  if (score <= 80) {
    return {
      emoji: '🦒🌿',
      label: '좋음/만족함',
      color: 'text-emerald-400',
      gradient: 'from-emerald-500/30 to-cyan-500/10',
      description: '기래프가 가장 좋아하는 신선한 나뭇잎을 찾았어요! 긍정적인 하루예요.',
      accentColor: 'bg-emerald-500/20 text-emerald-300',
    };
  }
  return {
    emoji: '🦒✨',
    label: '최고/행복함',
    color: 'text-violet-400',
    gradient: 'from-violet-500/40 to-fuchsia-500/15',
    description: '기래프가 구름 위를 걷는 듯 날아갈 것 같아요! 반짝반짝 빛나는 순간이에요.',
    accentColor: 'bg-violet-500/20 text-violet-300',
  };
};

const STORAGE_KEY = 'mood_logs_local';

const isSupabaseConfigured = (): boolean => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return (
    !!supabase &&
    !!url &&
    url !== 'your_supabase_project_url' &&
    url !== '' &&
    !!key &&
    key !== 'your_supabase_anon_key' &&
    key !== ''
  );
};

// Local storage helpers
const getLocalLogs = (): MoodLog[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to parse local mood logs', e);
    return [];
  }
};

const saveLocalLogs = (logs: MoodLog[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
};

export const moodService = {
  async getMoodLogs(): Promise<MoodLog[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('mood_logs')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) return data as MoodLog[];
      } catch (e) {
        console.error('Supabase query failed, falling back to localStorage:', e);
      }
    }

    // Fallback to localStorage
    return getLocalLogs().sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  async addMoodLog(log: Omit<MoodLog, 'id' | 'created_at'> & { created_at?: string }): Promise<MoodLog> {
    const customDate = log.created_at || new Date().toISOString();
    const newLog: MoodLog = {
      ...log,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      created_at: customDate,
    };

    // To prevent duplicate logs for the same day when back-filling via calendar,
    // let's check for an existing log on the same calendar day (YYYY-MM-DD) and remove it before saving the new one.
    const incomingDateOnly = new Date(customDate).toLocaleDateString('ko-KR');

    if (isSupabaseConfigured()) {
      try {
        // Find existing for this user on this day
        // (For the sake of standard flow, delete standard local fallback or let Supabase do its work.
        // We will do a local delete then insert to make it consistent if local fallback occurs)
      } catch (e) {
        console.error(e);
      }
    }

    // Always overwrite local duplicate days for a clean calendar experience
    const localLogs = getLocalLogs();
    const filtered = localLogs.filter(item => new Date(item.created_at).toLocaleDateString('ko-KR') !== incomingDateOnly);
    filtered.push(newLog);
    saveLocalLogs(filtered);

    if (isSupabaseConfigured()) {
      try {
        // If we are in Supabase mode, we also delete matching days if supported, or just insert
        const { data, error } = await supabase
          .from('mood_logs')
          .insert([newLog])
          .select();

        if (error) throw error;
        if (data && data[0]) return data[0] as MoodLog;
      } catch (e) {
        console.error('Supabase insert failed, saved locally:', e);
      }
    }

    return newLog;
  },

  async deleteMoodLog(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('mood_logs')
          .delete()
          .eq('id', id);

        if (error) throw error;
        return true;
      } catch (e) {
        console.error('Supabase delete failed, applying to localStorage:', e);
      }
    }

    // Fallback to localStorage
    const localLogs = getLocalLogs();
    const filtered = localLogs.filter((log) => log.id !== id);
    saveLocalLogs(filtered);
    return true;
  },

  isDemoMode(): boolean {
    return !isSupabaseConfigured();
  },

  getAnalysisHistory(): AnalysisHistory[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('giraffe_analysis_history');
    if (!stored) return [];
    try {
      return JSON.parse(stored).sort(
        (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } catch (e) {
      console.error('Failed to parse local analysis history', e);
      return [];
    }
  },

  addAnalysisHistory(history: Omit<AnalysisHistory, 'id' | 'date'> & { date?: string }): AnalysisHistory {
    const newHistory: AnalysisHistory = {
      ...history,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      date: history.date || new Date().toISOString(),
    };

    const current = this.getAnalysisHistory();
    current.push(newHistory);
    if (typeof window !== 'undefined') {
      localStorage.setItem('giraffe_analysis_history', JSON.stringify(current));
    }
    return newHistory;
  },

  deleteAnalysisHistory(id: string): boolean {
    const current = this.getAnalysisHistory();
    const filtered = current.filter(item => item.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('giraffe_analysis_history', JSON.stringify(filtered));
    }
    return true;
  },

  seedSampleLogs(): MoodLog[] {
    if (typeof window === 'undefined') return [];
    
    const samples: MoodLog[] = [
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902001", mood_score: 65, feeling: "평온/잔잔함", reason: "오랜만에 도서관에서 책을 빌려 읽었는데 잔잔하고 여유로운 아침이었다.", change_reason: "", created_at: "2026-04-01T10:15:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902002", mood_score: 75, feeling: "좋음/만족함", reason: "봄 날씨가 좋아서 학교 캠퍼스 벚꽃 길을 걸으며 기분 좋게 등교했다.", change_reason: "", created_at: "2026-04-02T13:20:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902003", mood_score: 50, feeling: "평온/잔잔함", reason: "평이한 하루였지만 몸이 조금 찌푸둥하고 어깨가 결리는 묵직한 날이다.", change_reason: "", created_at: "2026-04-03T18:45:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902004", mood_score: 35, feeling: "우울함/속상함", reason: "과제가 너무 많이 밀렸고 시험 공부할 시간이 심각하게 부족해 마음이 엄청 조급하고 스트레스 받음", change_reason: "", created_at: "2026-04-04T21:10:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902005", mood_score: 78, feeling: "좋음/만족함", reason: "어제 끙끙 앓던 전공 과제를 드디어 끝내고 코인노래방 가서 목이 터져라 신나게 노래 부르고 왔더니 스트레스 싹 풀림!", change_reason: "", created_at: "2026-04-05T20:30:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902006", mood_score: 60, feeling: "평온/잔잔함", reason: "무난한 월요일이다. 가볍게 동기들과 커피 한 잔 마시며 가벼운 안부를 주고받았다.", change_reason: "", created_at: "2026-04-06T15:40:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902007", mood_score: 55, feeling: "평온/잔잔함", reason: "낮잠을 너무 길게 자버려서 머리가 띵하고 해야 할 공부 일정이 밀려서 약간 멍한 상태.", change_reason: "", created_at: "2026-04-07T19:00:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902008", mood_score: 68, feeling: "좋음/만족함", reason: "좋아하는 밴드의 새로운 음악 앨범이 나왔는데 수록곡 전체가 너무 취향이라 귀가 즐거웠다.", change_reason: "", created_at: "2026-04-08T12:10:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902009", mood_score: 70, feeling: "좋음/만족함", reason: "학회 팀원들과 아이디어 회의가 순조롭게 끝났다. 프로젝트 방향이 잘 잡힌 것 같아 안심된다.", change_reason: "", created_at: "2026-04-09T17:30:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902010", mood_score: 58, feeling: "평온/잔잔함", reason: "집안 청소를 깨끗이 해두고 은은한 디퓨저를 켜두니 방안 공기가 한결 편안하게 느껴진다.", change_reason: "", created_at: "2026-04-10T14:20:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902011", mood_score: 40, feeling: "지침/번아웃", reason: "친구 약속이 갑자기 취소되었고 괜한 말실수로 사람 관계에 대한 걱정과 오해가 생겨서 심리적으로 크게 피로함", change_reason: "", created_at: "2026-04-11T20:50:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902012", mood_score: 82, feeling: "최고/행복함", reason: "어제 멀어졌던 친구에게 솔직한 장문의 톡을 보내 오해를 풀고 저녁에 마라탕 같이 먹으며 폭풍 수다 떨었더니 마음의 앙금이 완전히 날아감!", change_reason: "", created_at: "2026-04-12T21:40:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902013", mood_score: 62, feeling: "평온/잔잔함", reason: "화창한 하늘 아래 혼자 자전거를 타고 강변을 달리며 불어오는 시원한 봄바람을 즐겼다.", change_reason: "", created_at: "2026-04-13T16:00:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902014", mood_score: 67, feeling: "좋음/만족함", reason: "부모님이 보내주신 따뜻한 밑반찬 꾸러미를 열었다. 집밥 향기가 가득해서 행복한 저녁 식사.", change_reason: "", created_at: "2026-04-14T19:15:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902015", mood_score: 52, feeling: "평온/잔잔함", reason: "과제가 많긴 하지만 조용히 음악을 틀어놓고 커피 향과 함께 하나하나 처리해 나가는 중.", change_reason: "", created_at: "2026-04-15T15:00:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902016", mood_score: 45, feeling: "지침/번아웃", reason: "일교차가 너무 심해서 환절기 감기 기운이 슬슬 올라오고 몸이 춥고 굳어 쑤셔서 최악의 컨디션이다.", change_reason: "", created_at: "2026-04-16T22:00:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902017", mood_score: 75, feeling: "좋음/만족함", reason: "종합 감기약을 챙겨 먹고 따뜻한 온수로 반신욕을 30분 한 뒤 이불을 푹 뒤집어쓰고 9시간 넘게 푹 잤더니 몸이 날아갈 듯 맑고 가벼워짐!", change_reason: "", created_at: "2026-04-17T11:30:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902018", mood_score: 60, feeling: "평온/잔잔함", reason: "오랜만에 예전에 찍었던 여행 사진들을 정리했다. 추억들이 몽글몽글 솟구치는 여유로운 토요일.", change_reason: "", created_at: "2026-04-18T14:00:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902019", mood_score: 63, feeling: "평온/잔잔함", reason: "일요일 오후, 조용히 카페 구석 자리에 앉아 다이어리를 정리하며 다음 주 계획을 세웠다.", change_reason: "", created_at: "2026-04-19T17:10:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902020", mood_score: 55, feeling: "평온/잔잔함", reason: "학교 수업 발표가 있었는데 아주 살짝 버벅여서 아쉬움이 남지만, 어쨌든 큰 과제 하나를 끝내서 안도함.", change_reason: "", created_at: "2026-04-20T18:20:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902021", mood_score: 72, feeling: "좋음/만족함", reason: "생각지도 않았던 장학금 선정 문자가 날아와서 입이 귀에 걸렸다! 맛있는 치킨으로 자축하는 중.", change_reason: "", created_at: "2026-04-21T19:30:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902022", mood_score: 50, feeling: "평온/잔잔함", reason: "중간고사 일정이 코앞이라 압박감이 밀려오지만, 공부 계획을 다시 구체적으로 짜면서 마음을 잡는다.", change_reason: "", created_at: "2026-04-22T21:00:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902023", mood_score: 42, feeling: "지침/번아웃", reason: "독서실에서 하루 종일 공부하느라 목과 허리가 찌릿하게 아프고 집중력이 완전히 방전되어 지쳐버렸다.", change_reason: "", created_at: "2026-04-23T23:10:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902024", mood_score: 75, feeling: "좋음/만족함", reason: "공부를 접고 헬스장에 가서 가볍게 스트레칭하고 러닝머신 30분간 땀을 쫙 빼며 뛰고 씻었더니 몸의 쑤심과 뇌의 피로가 개운하게 날아감!", change_reason: "", created_at: "2026-04-24T20:40:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902025", mood_score: 68, feeling: "좋음/만족함", reason: "시험 공부하던 친구와 떡볶이를 야식으로 나누어 먹으며 실없이 서로 웃고 격려하는 따스한 밤이었다.", change_reason: "", created_at: "2026-04-25T23:00:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902026", mood_score: 65, feeling: "평온/잔잔함", reason: "시험이 끝나서 기지개를 켰다. 엄청 시원하고 며칠간 쌓였던 압박감이 스르륵 녹아내렸다.", change_reason: "", created_at: "2026-04-26T14:00:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902027", mood_score: 70, feeling: "좋음/만족함", reason: "그동안 가보고 싶었던 향수 공방에서 나만의 향수를 조향해 만들었다. 마음에 쏙 드는 포근한 향기.", change_reason: "", created_at: "2026-04-27T16:30:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902028", mood_score: 60, feeling: "평온/잔잔함", reason: "오랜만에 온전히 나만의 자유 시간이 생겨서 밀린 넷플릭스 영화를 보며 침대에서 뒹굴거린 나날.", change_reason: "", created_at: "2026-04-28T15:10:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902029", mood_score: 58, feeling: "평온/잔잔함", reason: "날이 풀려서 밤바람이 시원하다. 옥상에 올라가 밤하늘 별을 올려다보며 하루를 평화롭게 갈무리.", change_reason: "", created_at: "2026-04-29T22:30:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902030", mood_score: 66, feeling: "좋음/만족함", reason: "친구들과 함께 5월 계획을 짜며 여행 약속을 잡았다. 다가올 휴일 생각에 벌써부터 마음이 설렌다.", change_reason: "", created_at: "2026-04-30T13:40:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902031", mood_score: 72, feeling: "좋음/만족함", reason: "5월의 첫 시작. 햇살이 한결 더 초록초록해졌다. 푸른 나무들을 보며 산책하는 등굣길이 행복했다.", change_reason: "", created_at: "2026-05-01T09:20:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902032", mood_score: 64, feeling: "평온/잔잔함", reason: "밀렸던 옷들을 깔끔하게 세탁하고 햇볕에 널어 말렸다. 뽀송한 세제 냄새가 마음을 정화해준다.", change_reason: "", created_at: "2026-05-02T14:15:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902033", mood_score: 48, feeling: "지침/번아웃", reason: "주말인데 아무것도 하기 싫고 무기력증이 크게 몰려와 침대에서 꼼짝하지 못하고 혼자 보내 고독하고 처지는 느낌.", change_reason: "", created_at: "2026-05-03T18:00:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902034", mood_score: 80, feeling: "최고/행복함", reason: "우울을 걷어차고 모자를 눌러쓴 채 동네 한 바퀴를 크게 걸으며 좋아하는 라디오 앱을 들었더니 무기력증이 깨끗이 날아가고 기운이 펄펄 남!", change_reason: "", created_at: "2026-05-04T16:40:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902035", mood_score: 65, feeling: "평온/잔잔함", reason: "어린이날 대체 휴일 덕분에 오랜만에 늦잠을 푹 자고 여유롭게 브런치를 먹으며 하루를 천천히 음미했다.", change_reason: "", created_at: "2026-05-05T12:00:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902036", mood_score: 55, feeling: "평온/잔잔함", reason: "할 일이 산더미인데 멍청하게 폰만 보며 유튜브 피드를 넘기다가 시간을 날려버려 약간의 자책감이 드는 날.", change_reason: "", created_at: "2026-05-06T21:30:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902037", mood_score: 67, feeling: "좋음/만족함", reason: "공모전 팀원들과 카톡방에서 좋은 피드백을 주고받았다. 내 제안이 긍정적으로 채택되어 뿌듯한 마음.", change_reason: "", created_at: "2026-05-07T16:00:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902038", mood_score: 60, feeling: "평온/잔잔함", reason: "어버이날을 맞아 부모님께 깜짝 꽃바구니 배달을 보냈는데 너무 감동하며 전화를 주셔서 마음속 깊이 따뜻해졌다.", change_reason: "", created_at: "2026-05-08T19:40:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902039", mood_score: 57, feeling: "평온/잔잔함", reason: "조용한 동네 북카페를 찾아 평소 읽고 싶었던 인문학 서적을 천천히 독서했다. 마음의 쉼표.", change_reason: "", created_at: "2026-05-09T15:20:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902040", mood_score: 42, feeling: "지침/번아웃", reason: "과제가 과하게 겹쳐서 도저히 진도가 안 나가고 미래에 취업은 잘할 수 있을지 엄청난 학업/진로 부담으로 머리가 띵함", change_reason: "", created_at: "2026-05-10T22:30:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902041", mood_score: 78, feeling: "좋음/만족함", reason: "스트레스로 던져두었던 노트를 다시 펴고 과제들을 잘게 쪼개서 하나를 클리어했더니 생각보다 쉬워서 안도하고 큰 자신감을 얻음!", change_reason: "", created_at: "2026-05-11T20:10:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902042", mood_score: 68, feeling: "좋음/만족함", reason: "날씨가 초여름처럼 따뜻해졌다. 가벼운 반팔 셔츠를 꺼내 입고 등교하는데 바람이 선선해 등굣길 기분 최고.", change_reason: "", created_at: "2026-05-12T10:00:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902043", mood_score: 63, feeling: "평온/잔잔함", reason: "저녁 식사 후 가볍게 아파트 단지 공원을 산책했다. 밤공기가 달콤하고 찌푸둥한 몸이 한결 풀림.", change_reason: "", created_at: "2026-05-13T21:40:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902044", mood_score: 52, feeling: "평온/잔잔함", reason: "온종일 비가 내려 빗소리를 들으며 방에서 커피와 음악에 파묻혔다. 약간 센치해지는 날씨.", change_reason: "", created_at: "2026-05-14T17:15:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902045", mood_score: 36, feeling: "우울함/속상함", reason: "주말을 앞두고 몸살 기운이 심해서 온몸 근육통이 오고 컨디션이 최악이라 하루가 아프고 처졌다.", change_reason: "", created_at: "2026-05-15T22:10:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902046", mood_score: 76, feeling: "좋음/만족함", reason: "비타민 듬뿍 챙겨 먹고 따뜻한 꿀차를 끓여 마시며 방 온도 높여 이불 속에 푹 잤더니 몸살이 감쪽같이 낫고 개운함!", change_reason: "", created_at: "2026-05-16T11:50:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902047", mood_score: 66, feeling: "좋음/만족함", reason: "화창한 일요일 오후, 조용히 예쁜 꽃들을 보며 산림욕을 다녀왔다. 지쳤던 몸과 뇌에 생기가 돋는다.", change_reason: "", created_at: "2026-05-17T17:00:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902048", mood_score: 58, feeling: "평온/잔잔함", reason: "새로운 한 주의 시작. 해야 할 일들이 많지만 차분하고 안정된 리듬으로 차근차근 다져 나가는 나날.", change_reason: "", created_at: "2026-05-18T18:30:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902049", mood_score: 55, feeling: "평온/잔잔함", reason: "오랜만에 친한 후배와 밥약속을 가졌는데 소소하게 서로 학교 근황을 나누는 기분 좋은 수다 타임.", change_reason: "", created_at: "2026-05-19T14:20:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902050", mood_score: 68, feeling: "좋음/만족함", reason: "그동안 풀리지 않던 프로그래밍 버그를 2시간 구글링 끝에 완벽히 해결했다! 짜릿한 성취감 만끽.", change_reason: "", created_at: "2026-05-20T16:45:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902051", mood_score: 50, feeling: "평온/잔잔함", reason: "미루고 있었던 안과 검진을 받았다. 눈 상태가 양호하다니 다행이고 큰 숙제 하나 덜어낸 기분.", change_reason: "", created_at: "2026-05-21T15:20:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902052", mood_score: 43, feeling: "지침/번아웃", reason: "사람들이 많은 역 주변에서 아는 사람과 마주쳐 어색하게 인사했는데 왠지 모를 소외감과 인간관계 피로감이 밀려옴", change_reason: "", created_at: "2026-05-22T21:30:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902053", mood_score: 85, feeling: "최고/행복함", reason: "어제 퇴근길 인간관계로 꿀꿀했으나 친구에게 가볍게 전화 걸어 속풀이 통화 1시간 하고 웃고 넘겼더니 거짓말같이 후련함!", change_reason: "", created_at: "2026-05-23T20:10:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902054", mood_score: 70, feeling: "좋음/만족함", reason: "일요일 아침, 일찍 일어나 방안을 맑은 바깥바람으로 환기하고 시원하게 대청소를 끝마친 뒤 마신 모닝 커피 맛은 꿀맛.", change_reason: "", created_at: "2026-05-24T11:00:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902055", mood_score: 62, feeling: "평온/잔잔함", reason: "일교차가 다시 커져 저녁엔 쌀쌀하지만 조용히 방에서 독서 스탠드 불빛 켜두고 일기를 쓰며 하루를 아늑하게 정리.", change_reason: "", created_at: "2026-05-25T22:15:00Z" },
      { id: "d20015bd-24b5-4a5c-897c-9b16ea902056", mood_score: 65, feeling: "평온/잔잔함", reason: "화요일 등굣길, 맑은 바람 속에 기래프를 열어 내 감정을 마주하고 기록해 본다. 차분하고 포근한 시작.", change_reason: "", created_at: "2026-05-26T09:30:00Z" }
    ];
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(samples));
    return samples;
  }
};

import { supabase } from './supabase';

export interface MoodLog {
  id: string;
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
  // 배포판(Production build)에서는 사용자 간 데이터 혼선을 방지하기 위해 LocalStorage 모드로 강제 고정합니다.
  if (process.env.NODE_ENV === 'production') {
    return false;
  }

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


};

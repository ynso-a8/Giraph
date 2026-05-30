'use client';

import React, { useState, useEffect } from 'react';
import { moodService, AnalysisHistory, getMoodState } from '@/lib/moodService';
import GiraffeFace from '@/components/GiraffeFace';
import { ClipboardList, Calendar, Trash2, ChevronDown, ChevronUp, CheckSquare, Sparkles, BookOpen } from 'lucide-react';

export default function ReportPage() {
  const [history, setHistory] = useState<AnalysisHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFullReportMap, setShowFullReportMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchHistory();
    window.addEventListener('storage', fetchHistory);
    return () => window.removeEventListener('storage', fetchHistory);
  }, []);

  const fetchHistory = () => {
    try {
      const records = moodService.getAnalysisHistory();
      setHistory(records);
      if (records.length > 0 && !expandedId) {
        setExpandedId(records[0].id); // Auto-expand the most recent one
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent toggling accordion when clicking delete
    if (confirm('이 마음 처방 기록을 정말 일지에서 삭제하시겠습니까?')) {
      moodService.deleteAnalysisHistory(id);
      fetchHistory();
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const toggleFullReport = (id: string, value: boolean) => {
    setShowFullReportMap(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const generateSummaryFromRecord = (record: AnalysisHistory): string[] => {
    const { answers, analysisText } = record;
    
    const recoveryMatch = analysisText.match(/과거 한동재님이[^]*?시점은[^]*?기분이 (\d+)점까지 떨어지고 "([^"]+)"의 일로[^]*?다음 날인? (\S+)에 "([^"]+)"을\(를\)[^]*?기분 점수를 (\d+)점까지[^]*?극적으로 (\d+|도약|상승|반등)/) || 
                          analysisText.match(/과거 한동재님의[^]*?시점은[^]*?기분이 (\d+)점까지 떨어지고 "([^"]+)"의 일로[^]*?다음 일지에서 "([^"]+)"을\(를\)[^]*?기분 점수를 (\d+)점까지[^]*?극적으로 (\d+|도약|상승|반등)/) ||
                          analysisText.match(/과거 (\S+)에 "([^"]+)"\(당시 기분 (\d+)점\)[^]*?다음 날인? (\S+)에 "([^"]+)"을\(를\)[^]*?기분 점수를 (\d+)점까지[^]*?극적으로 도약\(\+(\d+)점\)/) ||
                          analysisText.match(/과거 (\S+)에 "([^"]+)"\(당시 기분 (\d+)점\)[^]*?다음 날인? (\S+)에 "([^"]+)"을\(를\)[^]*?기분 점수를 (\d+)점까지[^]*?수직 반등\(\+(\d+)점\)/);

    const physicalText = answers.physical;
    const categoryText = answers.category;
    const copingText = answers.coping;

    if (recoveryMatch) {
      const pastReason = recoveryMatch[2] || '이전 스트레스';
      const recoveryReason = recoveryMatch[5] || '웰니스 활동';
      return [
        `📋 당시 한동재님은 '${categoryText}' 자극과 '${physicalText}' 반응으로 피로를 겪으셨던 상태입니다.`,
        `💡 과거 한동재님이 동일한 스트레스를 **"${pastReason.slice(0, 25)}${pastReason.length > 25 ? '...' : ''}"** 상황 속에서 **"${recoveryReason.slice(0, 25)}${recoveryReason.length > 25 ? '...' : ''}"**(으)로 극복하셨던 성공 공식이 감지되었습니다.`,
        `🌱 처방된 '${copingText}' 행동 솔루션과 마인드 복식호흡을 가동하여 일상의 리듬을 복구해 드렸습니다.`
      ];
    }

    const bestLogMatch = analysisText.match(/과거 감정 데이터를[^]*?행복하셨던 순간 중 하나인 (\S+)의 순간\(당시 최고점 (\d+)점\)[^]*?극복 비법은 바로 "([^"]+)"이었습니다/);
    if (bestLogMatch) {
      const happyReason = bestLogMatch[3] || '웰니스 활동';
      return [
        `📋 당시 '${categoryText}' 자극으로 인해 몸에 '${physicalText}' 반응이 발생하여 마음 관리가 요청되던 시점이었습니다.`,
        `💡 직접적인 회복 패턴은 없었지만, 과거 나에게 큰 미소를 안겨준 **"${happyReason.slice(0, 25)}${happyReason.length > 25 ? '...' : ''}"**의 행복 조각을 추천해 드렸습니다.`,
        `🌱 과거의 웰니스 극복 행동을 다시 시도하며 나에게 휴식과 포근함을 선물하도록 처방했습니다.`
      ];
    }

    return [
      `📋 당시 '${categoryText}' 영역의 스트레스 반응이 몸의 '${physicalText}' 신호와 함께 신체 피로로 감지되던 날입니다.`,
      `💡 아직 축적된 데이터가 초기 단계여서 일반적인 대규모 사용자 평균 임상 통계 해결책을 매칭해 드렸습니다.`,
      `🌱 처방된 '${copingText}' 행동 솔루션을 실천하고 나아진 결과를 메인 달력에 기-log하도록 독려했습니다.`
    ];
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-white/5 pb-4">
        <span className="text-[10px] font-bold text-[var(--color-primary)] tracking-wider uppercase">
          기래프 마음 진단소
        </span>
        <h1 className="text-lg font-black text-white tracking-tight">마음 처방 일지</h1>
        <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">자가진단을 통해 처방받았던 AI 마음 보고서들이 날짜별로 보관됩니다.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-3 text-zinc-600">
          <div className="w-6 h-6 rounded-full border-2 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] animate-spin" />
          <p className="text-[10px] font-bold text-zinc-500">일지를 가져오는 중...</p>
        </div>
      ) : (
        <>
          {/* Diagnostic Stats Overview */}
          {history.length > 0 && (
            <div className="p-4 rounded-3xl border border-white/5 bg-zinc-900/10 backdrop-blur-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--color-primary)] animate-pulse" />
                <span className="text-[10px] font-bold text-zinc-300">누적 진단 횟수</span>
              </div>
              <span className="text-sm font-black text-white">{history.length}회</span>
            </div>
          )}

          {/* Timeline Feed */}
          {history.length > 0 ? (
            <div className="flex flex-col gap-3.5 relative pl-4 border-l border-zinc-900 ml-2">
              {history.map((record) => {
                const isExpanded = expandedId === record.id;
                const dateObj = new Date(record.date);
                const formattedDate = `${dateObj.getFullYear()}년 ${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일`;
                const state = getMoodState(record.moodScore || 50);

                return (
                  <div key={record.id} className="relative flex flex-col gap-2">
                    {/* Timeline Node dot */}
                    <div className="absolute -left-[21px] top-4 w-2.5 h-2.5 rounded-full border-2 border-zinc-950 bg-[var(--color-primary)] shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.5)]" />

                    {/* Accordion Card */}
                    <div
                      onClick={() => toggleExpand(record.id)}
                      className={`p-4 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col gap-3 bg-zinc-900/10 backdrop-blur-sm select-none ${
                        isExpanded ? 'border-[var(--color-primary)]/30 shadow-lg' : 'border-white/5 hover:border-zinc-800'
                      }`}
                    >
                      {/* Accordion Summary Row */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="shrink-0 overflow-hidden rounded-xl border border-zinc-800">
                            <GiraffeFace score={record.moodScore || 50} size={38} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-white">{formattedDate}</span>
                            <span className="text-[9px] font-bold text-zinc-500 mt-0.5">
                              {record.answers.category} • {state.label}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => handleDelete(record.id, e)}
                            className="p-1.5 rounded-lg text-zinc-700 hover:text-rose-400 hover:bg-rose-950/10 transition-colors cursor-pointer active:scale-90"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-zinc-600" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-zinc-600" />
                          )}
                        </div>
                      </div>

                      {/* Accordion Details */}
                      {isExpanded && (
                        <div className="border-t border-zinc-900/60 pt-3.5 flex flex-col gap-4 animate-fade-in text-[11px] leading-relaxed">
                          {/* Quiz Answers summary table */}
                          <div className="p-3 rounded-2xl bg-zinc-950/40 border border-zinc-900 flex flex-col gap-2">
                            <span className="text-[9px] font-bold text-[var(--color-primary)] tracking-wide">그날의 마음 조각 답변</span>
                            <div className="grid grid-cols-2 gap-2 text-[9px] text-zinc-400 font-semibold leading-normal">
                              <div>• 감정 영역: <span className="text-zinc-200">{record.answers.category}</span></div>
                              <div>• 감정 세기: <span className="text-zinc-200">{record.answers.intensity}</span></div>
                              <div>• 신체 신호: <span className="text-zinc-200">{record.answers.physical}</span></div>
                              <div>• 대처 방향: <span className="text-zinc-200">{record.answers.coping}</span></div>
                            </div>
                            {record.answers.subjective && (
                              <div className="text-[9px] text-zinc-500 border-t border-zinc-900 pt-2 font-bold italic leading-relaxed">
                                &quot;{record.answers.subjective}&quot;
                              </div>
                            )}
                          </div>

                          {/* AI Analysis Report Text */}
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[9px] font-bold text-white flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                              AI 마음 심층 처방
                            </span>
                            
                            {!showFullReportMap[record.id] ? (
                              /* 3-Line Summary View */
                              <div className="flex flex-col gap-2.5 mt-1">
                                <ul className="flex flex-col gap-2 text-[10.5px] text-zinc-300 font-semibold leading-relaxed">
                                  {generateSummaryFromRecord(record).map((line, idx) => (
                                    <li key={idx} className="flex gap-2 items-start bg-zinc-950/40 p-2.5 rounded-2xl border border-white/5 shadow-sm">
                                      <span className="shrink-0 text-xs">{line.slice(0, 2)}</span>
                                      <span>{line.slice(2)}</span>
                                    </li>
                                  ))}
                                </ul>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFullReport(record.id, true);
                                  }}
                                  className="w-full py-2 px-3 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 hover:bg-zinc-800 text-[9px] font-black text-zinc-300 hover:text-white rounded-2xl cursor-pointer text-center transition-all mt-1 active:scale-95 flex items-center justify-center gap-1 shadow-sm"
                                >
                                  <span>기래프 AI 심층 처방 상세보기 ▾</span>
                                </button>
                              </div>
                            ) : (
                              /* Full Detailed Report View */
                              <div className="flex flex-col gap-3.5 mt-1">
                                <p className="text-zinc-300 leading-relaxed font-semibold bg-zinc-950/40 p-3.5 rounded-2xl border border-white/5 shadow-sm whitespace-pre-wrap">
                                  {record.analysisText}
                                </p>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFullReport(record.id, false);
                                  }}
                                  className="w-full py-2 px-3 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 hover:bg-zinc-800 text-[9px] font-black text-zinc-300 hover:text-white rounded-2xl cursor-pointer text-center transition-all mt-1 active:scale-95 flex items-center justify-center gap-1 shadow-sm"
                                >
                                  <span>처방 리포트 요약하여 보기 ▴</span>
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Action Checklist */}
                          <div className="flex flex-col gap-2">
                            <span className="text-[9px] font-bold text-white flex items-center gap-1.5">
                              <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                              실천 해결책 행동 팁
                            </span>
                            <ul className="flex flex-col gap-1.5 text-[9px] text-zinc-400 leading-normal font-bold">
                              {record.actionTips.map((tip, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <span className="text-[var(--color-primary)]">•</span>
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center rounded-[32px] border border-dashed border-zinc-800 bg-zinc-900/5 text-zinc-500 flex flex-col items-center gap-3">
              <ClipboardList className="w-8 h-8 text-zinc-700 animate-pulse" />
              <div>
                <p className="font-bold text-xs text-zinc-400">저장된 처방 일지가 없습니다</p>
                <p className="text-[10px] text-zinc-500 mt-1 max-w-[220px] leading-relaxed">
                  분석 탭에서 오늘의 마음 자가진단을 진행해 보세요. 발송된 해결책 리포트들이 날짜별로 보관됩니다.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

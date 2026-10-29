import React, { useState } from 'react';
import {
  Sunrise,
  Utensils,
  Brain,
  Footprints,
  Coffee,
  Dumbbell,
  MoonStar,
  ShieldAlert,
  BedDouble,
  CheckCircle2,
  Clock,
  RotateCcw,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import { CircadianPhase, UserProfile } from '../types';
import { CircadianClockDial } from './CircadianClockDial';
import { minutesToTime, formatMinutesLabel, findCurrentPhase } from '../utils/circadian';

interface CircadianMapProps {
  phases: CircadianPhase[];
  profile: UserProfile;
  realMinutes: number;
  onOpenSettings: () => void;
  onOpenAI: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Sunrise,
  Utensils,
  Brain,
  Footprints,
  Coffee,
  Dumbbell,
  MoonStar,
  ShieldAlert,
  BedDouble,
};

export const CircadianMap: React.FC<CircadianMapProps> = ({
  phases,
  profile,
  realMinutes,
  onOpenSettings,
  onOpenAI,
}) => {
  const [viewMode, setViewMode] = useState<'dial' | 'timeline'>('dial');
  const [simulatedMinutes, setSimulatedMinutes] = useState<number | null>(null);

  const activeMinutes = simulatedMinutes !== null ? simulatedMinutes : realMinutes;
  const isSimulating = simulatedMinutes !== null;

  const currentStatus = findCurrentPhase(phases, activeMinutes);
  const [selectedPhase, setSelectedPhase] = useState<CircadianPhase>(currentStatus.phase);

  // Sync selected phase when activeMinutes change unless user manually clicked another phase
  const displayPhase = selectedPhase || currentStatus.phase;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setSimulatedMinutes(val);
    const found = findCurrentPhase(phases, val);
    setSelectedPhase(found.phase);
  };

  const handleResetToLive = () => {
    setSimulatedMinutes(null);
    const found = findCurrentPhase(phases, realMinutes);
    setSelectedPhase(found.phase);
  };

  const PhaseIcon = ICON_MAP[displayPhase.iconName] || Clock;

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-800 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block"></span>
              <span>
                {isSimulating ? '시뮬레이션 가이드 모드' : '실시간 생체 시계 동기화 중'}
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-300 font-mono">{minutesToTime(activeMinutes)}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
              {displayPhase.title}
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
              {displayPhase.summary}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {/* View switcher buttons */}
            <div className="flex items-center p-1 bg-slate-800 rounded-xl border border-slate-700">
              <button
                onClick={() => setViewMode('dial')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  viewMode === 'dial' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                24H 원형 다이얼
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  viewMode === 'timeline' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                타임라인 목록
              </button>
            </div>
          </div>
        </div>

        {/* 24-Hour Time Scrubber */}
        <div className="mt-5 pt-4 border-t border-slate-750">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span>하루 24시간 타임라인 탐색 슬라이더</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-emerald-400 font-semibold">
                {formatMinutesLabel(activeMinutes)} ({minutesToTime(activeMinutes)})
              </span>
              {isSimulating && (
                <button
                  onClick={handleResetToLive}
                  className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>현재 시각으로</span>
                </button>
              )}
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="1439"
            step="10"
            value={activeMinutes}
            onChange={handleSliderChange}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-hidden"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-300 mt-1">
            <span>00:00 (취침)</span>
            <span>06:00 (기상)</span>
            <span>12:00 (점심)</span>
            <span>18:00 (운동/저녁)</span>
            <span>24:00 (자정)</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'dial' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: 24h Circular Dial Widget */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900">24시간 생체 시계 다이얼</h3>
              <span className="text-xs text-slate-500">영역 클릭 시 해당 구간 탐색</span>
            </div>
            <CircadianClockDial
              phases={phases}
              currentMinutes={activeMinutes}
              selectedPhase={displayPhase}
              onSelectPhase={(phase) => {
                setSelectedPhase(phase);
                setSimulatedMinutes(phase.startMinutes);
              }}
              isSimulating={isSimulating}
              onResetToLive={handleResetToLive}
            />

            {/* Quick chronotype hint */}
            <div className="w-full mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>기상: {profile.wakeTime} · 취침: {profile.sleepTime}</span>
              <button
                onClick={onOpenSettings}
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                시간 변경
              </button>
            </div>
          </div>

          {/* Right: Detailed Phase Guidance Card */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${displayPhase.badgeBg}`}>
                    <PhaseIcon className={`w-6 h-6 ${displayPhase.accentColor}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                        {displayPhase.tag}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {displayPhase.timeRange}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                      {displayPhase.title}
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-medium">호르몬 & 신경계</span>
                  <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded-md mt-0.5 inline-block">
                    {displayPhase.hormoneFocus}
                  </span>
                </div>
              </div>

              {/* Biological Mechanism Box */}
              <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>체내 생체 메커니즘 (Chronobiology)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {displayPhase.biomarker}
                </p>
              </div>

              {/* Immediate 1-Action Banner */}
              <div className="mt-4 p-4 bg-emerald-50/80 rounded-xl border border-emerald-200/80 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-900 block">
                    지금 실천할 1가지 핵심 액션
                  </span>
                  <p className="text-xs text-emerald-800 font-medium mt-0.5 leading-relaxed">
                    {displayPhase.recommendedAction}
                  </p>
                </div>
              </div>

              {/* Action items checklist */}
              <div className="mt-4">
                <h4 className="text-xs font-bold text-slate-900 mb-2.5">
                  권장 행동 가이드 & 체크리스트
                </h4>
                <div className="space-y-2">
                  {displayPhase.actionItems.map((action, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200/60 transition-colors text-xs text-slate-700"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Caution warning if present */}
              {displayPhase.caution && (
                <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">주의 사항</span>
                    <span className="text-amber-800">{displayPhase.caution}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Timeline View */
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">24시간 단계별 생체 리듬 타임라인</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                당신의 크로노타입과 기상·취침 시간에 맞춰 정밀 재계산된 9단계 하루 여정입니다.
              </p>
            </div>
            <button
              onClick={onOpenAI}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>AI에게 일정 질문하기</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {phases.map((p, idx) => {
              const isCurrent = currentStatus.phase.id === p.id && !isSimulating;
              const isSelected = displayPhase.id === p.id;
              const Icon = ICON_MAP[p.iconName] || Clock;

              return (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedPhase(p);
                    setSimulatedMinutes(p.startMinutes);
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500/30'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${p.badgeBg}`}>
                        <Icon className={`w-5 h-5 ${p.accentColor}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-800">{p.timeRange}</span>
                          <span className="text-[11px] px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600 font-medium">
                            {p.tag}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold animate-pulse">
                              지금 현재 구간
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-0.5">{p.title}</h4>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 sm:text-right max-w-xs">
                      <p className="line-clamp-1">{p.recommendedAction}</p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-slate-200/60 space-y-2 text-xs">
                      <div className="text-slate-600 leading-relaxed font-normal">
                        {p.summary}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                        {p.actionItems.map((act, aIdx) => (
                          <div key={aIdx} className="flex items-center gap-2 text-slate-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>{act}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import confetti from 'canvas-confetti';
import {
  Lightbulb,
  Clock,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Droplet,
  Sun,
  Coffee,
  Footprints,
  Activity,
  Moon,
} from 'lucide-react';
import { CircadianPhase, UserProfile } from '../types';
import { minutesToTime } from '../utils/circadian';

interface LiveActionCardProps {
  currentPhase: CircadianPhase;
  remainingMinutes: number;
  progressPercent: number;
  realMinutes: number;
  profile: UserProfile;
  onOpenTool: (tool: 'breathing' | 'caffeine' | 'walk' | 'science') => void;
  onQuickComplete?: () => void;
}

export const LiveActionCard: React.FC<LiveActionCardProps> = ({
  currentPhase,
  remainingMinutes,
  progressPercent,
  realMinutes,
  profile,
  onOpenTool,
  onQuickComplete,
}) => {
  const handleQuickAction = () => {
    try {
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
    if (onQuickComplete) {
      onQuickComplete();
    }
  };

  // Remaining time formatted
  const remH = Math.floor(remainingMinutes / 60);
  const remM = remainingMinutes % 60;
  const remText = remH > 0 ? `${remH}시간 ${remM}분 남음` : `${remM}분 남음`;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -z-10 pointer-events-none opacity-60" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left: Current Phase & Real-Time Action */}
        <div className="space-y-3 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/80">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>현재 실시간 구간</span>
            </span>
            <span className="text-xs font-mono font-semibold text-slate-500">
              {currentPhase.timeRange}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-medium text-slate-600">
              구간 종료까지 {remText}
            </span>
          </div>

          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{currentPhase.title}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-xl">
              {currentPhase.biomarker}
            </p>
          </div>

          {/* Golden Recommended 1-Action */}
          <div className="flex items-start sm:items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 shadow-xs">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">
                지금 실천할 1가지 액션
              </span>
              <span className="text-xs font-semibold text-slate-800 mt-0.5 block">
                {currentPhase.recommendedAction}
              </span>
            </div>
            <button
              onClick={handleQuickAction}
              className="px-3 py-1.5 bg-white hover:bg-emerald-50 active:scale-95 text-emerald-700 hover:text-emerald-800 border border-emerald-300 text-xs font-bold rounded-lg transition-all shadow-2xs whitespace-nowrap"
            >
              실천 완료!
            </button>
          </div>
        </div>

        {/* Right: Quick Bio-tool launch & Progress */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 justify-center border-t lg:border-t-0 lg:border-l border-slate-150 pt-4 lg:pt-0 lg:pl-6 min-w-[200px]">
          {/* Phase completion progress */}
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>현재 구간 진행도</span>
              <span className="font-mono font-semibold text-slate-700">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Quick tool suggestions based on phase */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] text-slate-400 font-medium block">추천 실시간 도구</span>
            {currentPhase.id === 'caffeine_cutoff' ? (
              <button
                onClick={() => onOpenTool('caffeine')}
                className="w-full flex items-center justify-between px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-medium border border-amber-200 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <Coffee className="w-3.5 h-3.5 text-amber-600" />
                  <span>카페인 반감기 계산</span>
                </div>
                <ChevronRight className="w-3 h-3 text-amber-500" />
              </button>
            ) : currentPhase.id === 'lunch_glycemic_walk' ? (
              <button
                onClick={() => onOpenTool('walk')}
                className="w-full flex items-center justify-between px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-900 rounded-lg text-xs font-medium border border-teal-200 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <Footprints className="w-3.5 h-3.5 text-teal-600" />
                  <span>식후 15분 산책 타이머</span>
                </div>
                <ChevronRight className="w-3 h-3 text-teal-500" />
              </button>
            ) : (
              <button
                onClick={() => onOpenTool('breathing')}
                className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-medium border border-slate-200 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>4-7-8 이완 호흡기</span>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

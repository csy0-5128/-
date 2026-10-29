import React from 'react';
import confetti from 'canvas-confetti';
import {
  Sun,
  Droplet,
  Footprints,
  Coffee,
  Activity,
  Moon,
  CheckCircle2,
  Plus,
  Minus,
  Sparkles,
  Flame,
  Award,
} from 'lucide-react';
import { DailyLogState, HabitItem, UserProfile } from '../types';
import { CORE_HABITS } from '../utils/circadian';

interface DailyTrackerProps {
  dailyLog: DailyLogState;
  setDailyLog: React.Dispatch<React.SetStateAction<DailyLogState>>;
  profile: UserProfile;
  rhythmScore: number;
  onOpenBreathingTool: () => void;
  onOpenCaffeineTool: () => void;
}

const HABIT_ICONS: Record<string, React.ElementType> = {
  Sun,
  Droplet,
  Footprints,
  Coffee,
  Activity,
  Moon,
};

export const DailyTracker: React.FC<DailyTrackerProps> = ({
  dailyLog,
  setDailyLog,
  profile,
  rhythmScore,
  onOpenBreathingTool,
  onOpenCaffeineTool,
}) => {
  const toggleHabit = (habitId: string) => {
    const isCompleted = !!dailyLog.completedHabits[habitId];
    const newHabits = {
      ...dailyLog.completedHabits,
      [habitId]: !isCompleted,
    };

    setDailyLog((prev) => ({
      ...prev,
      completedHabits: newHabits,
    }));

    // Trigger confetti on completion
    if (!isCompleted) {
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {
        // ignore
      }
    }
  };

  const handleAddWater = (amount: number) => {
    setDailyLog((prev) => {
      const nextAmount = Math.max(0, Math.min(4000, prev.waterDrunkMl + amount));
      return { ...prev, waterDrunkMl: nextAmount };
    });
  };

  const waterTarget = profile.waterTargetMl || 2000;
  const waterPercent = Math.min(100, Math.round((dailyLog.waterDrunkMl / waterTarget) * 100));

  const completedCount = Object.values(dailyLog.completedHabits).filter(Boolean).length;
  const totalHabits = CORE_HABITS.length;

  // Feedback message based on score
  let scoreGrade = '시작 단계';
  let scoreColor = 'text-amber-500';
  let scoreMsg = '오늘의 건강 루틴을 하나씩 실천해보세요!';

  if (rhythmScore >= 85) {
    scoreGrade = '최상위 서카디언 동기화';
    scoreColor = 'text-emerald-500';
    scoreMsg = '신체 시계와 생활 패턴이 완벽하게 조화를 이루고 있습니다!';
  } else if (rhythmScore >= 60) {
    scoreGrade = '양호한 생체 리듬';
    scoreColor = 'text-teal-500';
    scoreMsg = '좋은 흐름을 유지하고 있습니다. 수분과 저녁 루틴을 챙겨보세요.';
  } else if (rhythmScore >= 35) {
    scoreGrade = '진행 중';
    scoreColor = 'text-blue-500';
    scoreMsg = '차근차근 실천 중입니다. 식후 산책과 카페인 컷오프를 신경써보세요.';
  }

  return (
    <div className="space-y-6">
      {/* Top Score & Summary Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Circular Gauge */}
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500 transition-all duration-700 ease-out"
                  strokeDasharray={`${rhythmScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-bold font-mono text-slate-900">{rhythmScore}</span>
                <span className="text-[10px] text-slate-400 font-medium">/100점</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold ${scoreColor}`}>{scoreGrade}</span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500">
                  {completedCount}/{totalHabits}개 습관 완료
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                오늘의 생체 리듬 달성도
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-md leading-relaxed">
                {scoreMsg}
              </p>
            </div>
          </div>

          {/* Streak & Motivation Card */}
          <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/60 self-start md:self-auto">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-slate-800 block">
                {profile.streakDays}일 연속 건강 패턴 실천 중!
              </span>
              <span className="text-slate-500">
                일관된 생체 시계가 뇌와 면역력을 강화합니다.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Habits & Hydration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 6 Core Habits Checklist */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">핵심 생체 습관 6종 체크</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                생체 시계 동기화에 가장 영향력이 큰 과학적 행동들입니다.
              </p>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              완료: {completedCount} / {totalHabits}
            </span>
          </div>

          <div className="space-y-2.5">
            {CORE_HABITS.map((habit) => {
              const isChecked = !!dailyLog.completedHabits[habit.id];
              const Icon = HABIT_ICONS[habit.iconName] || Award;

              return (
                <div
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isChecked
                      ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-400/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                        isChecked
                          ? 'bg-emerald-600 text-white'
                          : 'border-2 border-slate-300 text-transparent hover:border-slate-400'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-bold transition-all ${
                            isChecked ? 'text-emerald-900 line-through opacity-80' : 'text-slate-800'
                          }`}
                        >
                          {habit.title}
                        </span>
                        <span className="text-[10px] text-slate-600 font-medium bg-slate-100 px-1.5 py-0.2 rounded">
                          +{habit.points}점
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{habit.description}</p>
                    </div>
                  </div>

                  <div className="shrink-0 text-slate-500">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Hydration & Fast Tools */}
        <div className="lg:col-span-5 space-y-6">
          {/* Hydration Tracker Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center">
                  <Droplet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">하루 수분 충전 트래커</h3>
                  <span className="text-xs text-slate-500">목표 {waterTarget}ml</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-bold font-mono text-cyan-600">
                  {dailyLog.waterDrunkMl}
                </span>
                <span className="text-xs text-slate-400"> / {waterTarget}ml</span>
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>진척도</span>
                <span className="font-semibold text-slate-700">{waterPercent}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-300"
                  style={{ width: `${waterPercent}%` }}
                />
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => handleAddWater(250)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-xs font-semibold rounded-lg transition-colors border border-cyan-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+250ml (1컵)</span>
              </button>
              <button
                onClick={() => handleAddWater(500)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+500ml (텀블러)</span>
              </button>
              <button
                onClick={() => handleAddWater(-250)}
                title="250ml 취소"
                className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              * 기상 직후 350ml를 마시면 밤사이 끈끈해진 혈액 순환을 돕고 두통과 뇌 피로를 즉시 완화합니다.
            </p>
          </div>

          {/* Quick Shortcuts Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>실시간 생활 리듬 보조 도구</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              지금 불안하거나 피로하신가요? 생체 신경계를 안정시키는 인터랙티브 도구를 실행해보세요.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={onOpenBreathingTool}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition-colors"
              >
                <span className="text-base block mb-1">🌬️</span>
                <span className="text-xs font-bold text-white block">4-7-8 이완 호흡</span>
                <span className="text-[10px] text-slate-400">부교감신경 이완</span>
              </button>
              <button
                onClick={onOpenCaffeineTool}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition-colors"
              >
                <span className="text-base block mb-1">☕</span>
                <span className="text-xs font-bold text-white block">카페인 반감기 계산</span>
                <span className="text-[10px] text-slate-400">안전 취침 시간 확인</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { CircadianMap } from './components/CircadianMap';
import { DailyTracker } from './components/DailyTracker';
import { AICoachSection } from './components/AICoachSection';
import { BioToolsModal } from './components/BioToolsModal';
import { ChronotypeModal } from './components/ChronotypeModal';
import { LiveActionCard } from './components/LiveActionCard';
import { UserProfile, DailyLogState } from './types';
import {
  calculateCircadianPhases,
  getCurrentTimeMinutes,
  findCurrentPhase,
  CORE_HABITS,
} from './utils/circadian';
import { Wind, Coffee, Footprints, BookOpen, Sparkles, Heart } from 'lucide-react';

const DEFAULT_PROFILE: UserProfile = {
  name: '사용자',
  chronotype: 'bear',
  wakeTime: '07:00',
  sleepTime: '23:30',
  workStart: '09:00',
  workEnd: '18:00',
  primaryGoal: 'energy',
  waterTargetMl: 2000,
  streakDays: 4,
};

export default function App() {
  // Load user profile from localStorage
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('rhythmcare_profile');
      return saved ? { ...DEFAULT_PROFILE, ...JSON.parse(saved) } : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  // Current real-world minutes (0 - 1439)
  const [realMinutes, setRealMinutes] = useState<number>(getCurrentTimeMinutes());

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'map' | 'tracker' | 'tools' | 'ai'>('map');

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<'breathing' | 'caffeine' | 'walk' | 'science'>('breathing');

  // Today's date string
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  // Daily habit & water log
  const [dailyLog, setDailyLog] = useState<DailyLogState>(() => {
    try {
      const saved = localStorage.getItem(`rhythmcare_log_${todayStr}`);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      date: todayStr,
      completedHabits: {},
      waterDrunkMl: 500, // sample morning water
      caffeineLogs: [],
    };
  });

  // Save profile to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('rhythmcare_profile', JSON.stringify(profile));
    } catch {
      // ignore
    }
  }, [profile]);

  // Save daily log to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(`rhythmcare_log_${dailyLog.date}`, JSON.stringify(dailyLog));
    } catch {
      // ignore
    }
  }, [dailyLog]);

  // Live clock ticker (every 10 seconds)
  useEffect(() => {
    const updateTime = () => setRealMinutes(getCurrentTimeMinutes());
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Calculate dynamic circadian phases
  const phases = useMemo(() => calculateCircadianPhases(profile), [profile]);

  // Find active live phase
  const currentPhaseStatus = useMemo(
    () => findCurrentPhase(phases, realMinutes),
    [phases, realMinutes]
  );

  // Calculate overall circadian rhythm score (0 - 100)
  const rhythmScore = useMemo(() => {
    let score = 0;
    CORE_HABITS.forEach((h) => {
      if (dailyLog.completedHabits[h.id]) {
        score += h.points;
      }
    });

    // Hydration bonus (up to 10 points)
    const waterRatio = Math.min(1, dailyLog.waterDrunkMl / (profile.waterTargetMl || 2000));
    const waterBonus = Math.round(waterRatio * 10);

    return Math.min(100, score + waterBonus);
  }, [dailyLog, profile]);

  const handleOpenTool = (tool: 'breathing' | 'caffeine' | 'walk' | 'science') => {
    setSelectedTool(tool);
    setIsToolsOpen(true);
  };

  const handleQuickCompleteAction = () => {
    // Check an uncompleted habit
    const uncompleted = CORE_HABITS.find((h) => !dailyLog.completedHabits[h.id]);
    if (uncompleted) {
      setDailyLog((prev) => ({
        ...prev,
        completedHabits: {
          ...prev.completedHabits,
          [uncompleted.id]: true,
        },
        waterDrunkMl: Math.min(prev.waterDrunkMl + 250, 3000),
      }));
    } else {
      // add water if all completed
      setDailyLog((prev) => ({
        ...prev,
        waterDrunkMl: Math.min(prev.waterDrunkMl + 250, 3000),
      }));
    }
  };

  const completedCount = Object.values(dailyLog.completedHabits).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Top Header */}
      <Header
        profile={profile}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAI={() => setActiveTab('ai')}
        rhythmScore={rhythmScore}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Real-time Action Card (shown on Map and Tracker tabs) */}
        {(activeTab === 'map' || activeTab === 'tracker') && (
          <LiveActionCard
            currentPhase={currentPhaseStatus.phase}
            remainingMinutes={currentPhaseStatus.remainingMinutes}
            progressPercent={currentPhaseStatus.progressPercent}
            realMinutes={realMinutes}
            profile={profile}
            onOpenTool={handleOpenTool}
            onQuickComplete={handleQuickCompleteAction}
          />
        )}

        {/* Tab 1: 24-Hour Circadian Map */}
        {activeTab === 'map' && (
          <CircadianMap
            phases={phases}
            profile={profile}
            realMinutes={realMinutes}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenAI={() => setActiveTab('ai')}
          />
        )}

        {/* Tab 2: Daily Pattern Tracker */}
        {activeTab === 'tracker' && (
          <DailyTracker
            dailyLog={dailyLog}
            setDailyLog={setDailyLog}
            profile={profile}
            rhythmScore={rhythmScore}
            onOpenBreathingTool={() => handleOpenTool('breathing')}
            onOpenCaffeineTool={() => handleOpenTool('caffeine')}
          />
        )}

        {/* Tab 3: Bio Care Tools Dedicated View */}
        {activeTab === 'tools' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
              <h2 className="text-xl font-bold text-slate-900">생체 케어 인터랙티브 도구함</h2>
              <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
                생체 시계를 조절하고 자율신경계 균형을 맞추기 위한 과학 기반 인터랙티브 도구들을 바로 사용해보세요.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <button
                  onClick={() => handleOpenTool('breathing')}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30 text-left transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Wind className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">4-7-8 & 박스 브리딩 가이드</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    폐포 산소 교환을 극대화하고 부교감신경(미주신경)을 자극해 스트레스와 불면을 완화합니다.
                  </p>
                  <span className="text-xs font-semibold text-emerald-600 mt-3 inline-block">
                    도구 실행하기 →
                  </span>
                </button>

                <button
                  onClick={() => handleOpenTool('caffeine')}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/30 text-left transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Coffee className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">카페인 반감기 & 수면 영향 계산기</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    섭취한 커피 양과 시간을 기준으로 취침 시점의 체내 잔류 카페인 및 안전 마감 시간을 계산합니다.
                  </p>
                  <span className="text-xs font-semibold text-amber-600 mt-3 inline-block">
                    도구 실행하기 →
                  </span>
                </button>

                <button
                  onClick={() => handleOpenTool('walk')}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/30 text-left transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Footprints className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">식후 15분 혈당 안정 산책 타이머</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    식후 근육의 인슐린 비의존성 포도당 수송(GLUT4)을 활성화하여 식곤증과 혈당 스파이크를 없앱니다.
                  </p>
                  <span className="text-xs font-semibold text-teal-600 mt-3 inline-block">
                    도구 실행하기 →
                  </span>
                </button>

                <button
                  onClick={() => handleOpenTool('science')}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 text-left transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">생체 시계(Circadian) 과학 백과</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    망막의 햇빛 감지, 시교차상핵(SCN), 멜라토닌 분비, 글림프 뇌세척 시스템의 인체 메커니즘을 배웁니다.
                  </p>
                  <span className="text-xs font-semibold text-blue-600 mt-3 inline-block">
                    가이드 열기 →
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: AI Pattern Coach */}
        {activeTab === 'ai' && (
          <AICoachSection
            profile={profile}
            rhythmScore={rhythmScore}
            completedHabitsCount={completedCount}
            totalHabitsCount={CORE_HABITS.length}
          />
        )}
      </main>

      {/* Modals */}
      <ChronotypeModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        onSaveProfile={setProfile}
      />

      <BioToolsModal
        isOpen={isToolsOpen}
        onClose={() => setIsToolsOpen(false)}
        initialTool={selectedTool}
        profile={profile}
      />

      {/* Clean Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white/70 py-6 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">리듬케어 (RhythmCare)</span>
            <span>·</span>
            <span>24시간 생체리듬 기반 건강 생활 패턴 지도</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>서카디언 바이올로지(Circadian Biology) 기반</span>
            <span>·</span>
            <button
              onClick={() => {
                if (window.confirm('모든 기록 데이터를 초기화하시겠습니까?')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="hover:text-slate-600 transition-colors"
            >
              데이터 초기화
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

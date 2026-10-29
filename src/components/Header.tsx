import React, { useEffect, useState } from 'react';
import { Clock, Moon, Sun, Settings, Sparkles, Flame } from 'lucide-react';
import { ChronotypeInfo, UserProfile } from '../types';
import { CHRONOTYPES } from '../utils/circadian';

interface HeaderProps {
  profile: UserProfile;
  activeTab: 'map' | 'tracker' | 'tools' | 'ai';
  setActiveTab: (tab: 'map' | 'tracker' | 'tools' | 'ai') => void;
  onOpenSettings: () => void;
  onOpenAI: () => void;
  rhythmScore: number;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  activeTab,
  setActiveTab,
  onOpenSettings,
  onOpenAI,
  rhythmScore,
}) => {
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
  const [currentDateStr, setCurrentDateStr] = useState<string>('');
  const [isDaytime, setIsDaytime] = useState<boolean>(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      const s = now.getSeconds();
      setCurrentTimeStr(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);

      const daysKo = ['일', '월', '화', '수', '목', '금', '토'];
      setCurrentDateStr(`${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 (${daysKo[now.getDay()]})`);

      setIsDaytime(h >= 6 && h < 19);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const chrono: ChronotypeInfo = CHRONOTYPES[profile.chronotype] || CHRONOTYPES.bear;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between py-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-sm ring-1 ring-emerald-500/20">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">리듬케어</span>
                <span className="text-xs text-slate-400 font-mono">RhythmCare</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span>생체리듬 생활 패턴 코치</span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-600 font-medium">{currentDateStr}</span>
              </div>
            </div>
          </div>

          {/* Right Status & Controls */}
          <div className="flex items-center gap-3">
            {/* Live Clock Display */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 rounded-lg text-slate-700 text-xs font-mono font-medium border border-slate-200/60">
              {isDaytime ? (
                <Sun className="w-4 h-4 text-amber-500 animate-[spin_12s_linear_infinite]" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-400" />
              )}
              <span>현재 시각 {currentTimeStr}</span>
            </div>

            {/* Streak & Score Indicator */}
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-600">
              <div className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 rounded-lg text-amber-800 font-medium border border-amber-200/70">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{profile.streakDays}일 연속 실천</span>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 rounded-lg text-emerald-800 font-medium border border-emerald-200/70">
                <span>리듬 점수 {rhythmScore}점</span>
              </div>
            </div>

            {/* Chronotype quick toggle */}
            <button
              onClick={onOpenSettings}
              title="크로노타입 및 생활 시간대 설정"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-lg transition-colors border border-slate-200"
            >
              <span className="text-sm">{chrono.symbol}</span>
              <span className="hidden sm:inline">{chrono.nameKo.split(' ')[0]}</span>
              <Settings className="w-3.5 h-3.5 text-slate-500 ml-0.5" />
            </button>

            {/* AI Pattern Coach button */}
            <button
              onClick={onOpenAI}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 rounded-lg shadow-xs transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI 패턴 진단</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 border-t border-slate-100 pt-2 pb-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'map'
                ? 'bg-slate-900 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            24시간 생체 시계 지도
          </button>
          <button
            onClick={() => setActiveTab('tracker')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'tracker'
                ? 'bg-slate-900 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>데일리 습관 실천</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === 'tracker' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {rhythmScore}%
            </span>
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'tools'
                ? 'bg-slate-900 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            생체 케어 도구함 (호흡·카페인·산책)
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'ai'
                ? 'bg-slate-900 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-500" />
            <span>AI 맞춤 생활 처방</span>
          </button>
        </div>
      </div>
    </header>
  );
};

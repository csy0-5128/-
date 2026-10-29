import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Wind,
  Footprints,
  BookOpen,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { UserProfile } from '../types';
import { timeToMinutes, minutesToTime } from '../utils/circadian';

interface BioToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTool?: 'breathing' | 'caffeine' | 'walk' | 'science';
  profile: UserProfile;
}

export const BioToolsModal: React.FC<BioToolsModalProps> = ({
  isOpen,
  onClose,
  initialTool = 'breathing',
  profile,
}) => {
  const [activeTab, setActiveTab] = useState<'breathing' | 'caffeine' | 'walk' | 'science'>(initialTool);

  useEffect(() => {
    if (initialTool) {
      setActiveTab(initialTool);
    }
  }, [initialTool]);

  // Prevent background scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-150 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">생체 케어 도구함</h2>
              <span className="text-xs text-slate-500">신경계 이완 · 카페인 대사 계산 · 혈당 산책</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-6 pt-3 pb-2 border-b border-slate-150 flex gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('breathing')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'breathing'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>4-7-8 이완 호흡</span>
          </button>
          <button
            onClick={() => setActiveTab('caffeine')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'caffeine'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>카페인 반감기 계산기</span>
          </button>
          <button
            onClick={() => setActiveTab('walk')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'walk'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Footprints className="w-3.5 h-3.5" />
            <span>식후 15분 산책 타이머</span>
          </button>
          <button
            onClick={() => setActiveTab('science')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'science'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>생체 시계 과학 가이드</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'breathing' && <BreathingTool />}
          {activeTab === 'caffeine' && <CaffeineCalculator profile={profile} />}
          {activeTab === 'walk' && <PostMealWalkTimer />}
          {activeTab === 'science' && <ScienceGuide />}
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 1. 4-7-8 Breathing Tool
// -------------------------------------------------------------
const BreathingTool: React.FC = () => {
  const [mode, setMode] = useState<'478' | 'box'>('478');
  const [isRunning, setIsRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Play gentle bell sound using Web Audio API
  const playChime = (freq = 440) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);
    } catch {
      // ignore
    }
  };

  const phases478 = [
    { name: '들이마시기 (Inhale)', duration: 4, desc: '코로 천천히 숨을 깊게 들이마십니다.', scale: 'scale-125', color: 'from-teal-400 to-emerald-500', freq: 440 },
    { name: '숨 참기 (Hold)', duration: 7, desc: '폐에 산소를 머금고 편안하게 멈춥니다.', scale: 'scale-125', color: 'from-amber-400 to-amber-500', freq: 523 },
    { name: '내쉬기 (Exhale)', duration: 8, desc: '입으로 후- 소리를 내며 완전히 비웁니다.', scale: 'scale-90', color: 'from-indigo-400 to-blue-500', freq: 392 },
  ];

  const phasesBox = [
    { name: '들이마시기', duration: 4, desc: '4초간 코로 깊게 숨을 채웁니다.', scale: 'scale-120', color: 'from-teal-400 to-emerald-500', freq: 440 },
    { name: '숨 참기', duration: 4, desc: '4초간 차분하게 멈춥니다.', scale: 'scale-120', color: 'from-amber-400 to-amber-500', freq: 493 },
    { name: '내쉬기', duration: 4, desc: '4초간 천천히 숨을 비워냅니다.', scale: 'scale-90', color: 'from-indigo-400 to-blue-500', freq: 392 },
    { name: '비운 채 멈추기', duration: 4, desc: '4초간 고요 속에서 멈춥니다.', scale: 'scale-90', color: 'from-slate-400 to-slate-500', freq: 349 },
  ];

  const currentPhases = mode === '478' ? phases478 : phasesBox;
  const currentPhase = currentPhases[phaseIndex];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Next phase
            const nextIdx = (phaseIndex + 1) % currentPhases.length;
            if (nextIdx === 0) {
              setCompletedCycles((c) => c + 1);
            }
            setPhaseIndex(nextIdx);
            playChime(currentPhases[nextIdx].freq);
            return currentPhases[nextIdx].duration;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, phaseIndex, currentPhases]);

  const handleStart = () => {
    setIsRunning(true);
    playChime(currentPhase.freq);
  };

  const handleReset = () => {
    setIsRunning(false);
    setPhaseIndex(0);
    setSecondsLeft(currentPhases[0].duration);
    setCompletedCycles(0);
  };

  return (
    <div className="flex flex-col items-center py-2 space-y-6">
      {/* Mode Switcher */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => {
              setMode('478');
              handleReset();
            }}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              mode === '478' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            4-7-8 수면 호흡
          </button>
          <button
            onClick={() => {
              setMode('box');
              handleReset();
            }}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              mode === 'box' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            4-4-4-4 박스 브리딩
          </button>
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4" />}
          <span>{soundEnabled ? '종소리 켜짐' : '무음'}</span>
        </button>
      </div>

      {/* Animated Breathing Circle */}
      <div className="relative w-56 h-56 flex items-center justify-center my-4">
        {/* Outer pulsating glow ring */}
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-tr ${currentPhase.color} opacity-20 blur-xl transition-all duration-1000 ease-in-out ${
            isRunning ? currentPhase.scale : 'scale-100'
          }`}
        />

        {/* Middle decorative border circle */}
        <div
          className={`w-48 h-48 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center transition-all duration-1000 ease-in-out ${
            isRunning ? currentPhase.scale : 'scale-100'
          }`}
        >
          {/* Core Breathing Orb */}
          <div
            className={`w-36 h-36 rounded-full bg-gradient-to-tr ${currentPhase.color} shadow-lg flex flex-col items-center justify-center text-white transition-all duration-1000 ease-in-out`}
          >
            <span className="text-3xl font-bold font-mono tracking-tight">{secondsLeft}초</span>
            <span className="text-[11px] font-medium opacity-90 mt-0.5">{currentPhase.name.split(' ')[0]}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="text-center max-w-sm">
        <h4 className="text-sm font-bold text-slate-900">{currentPhase.name}</h4>
        <p className="text-xs text-slate-500 mt-1">{currentPhase.desc}</p>
        <div className="mt-2 text-xs text-emerald-700 font-medium">
          완료한 호흡 세트: {completedCycles}회
        </div>
      </div>

      {/* Control buttons */}
      <div className="flex items-center gap-3">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>호흡 시작하기</span>
          </button>
        ) : (
          <button
            onClick={() => setIsRunning(false)}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            <Pause className="w-4 h-4 fill-white" />
            <span>일시 정지</span>
          </button>
        )}
        <button
          onClick={handleReset}
          className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
          title="처음으로 리셋"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 2. Caffeine Half-Life Calculator
// -------------------------------------------------------------
const CaffeineCalculator: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  const [selectedDrink, setSelectedDrink] = useState<{ name: string; mg: number }>({
    name: '아메리카노 (2샷)',
    mg: 150,
  });
  const [intakeHour, setIntakeHour] = useState<number>(14);
  const [intakeMinute, setIntakeMinute] = useState<number>(0);

  const drinks = [
    { name: '에스프레소 1샷', mg: 75 },
    { name: '아메리카노 (2샷)', mg: 150 },
    { name: '콜드브루 1잔', mg: 200 },
    { name: '카페라떼 / 카푸치노', mg: 80 },
    { name: '에너지 드링크 (몬스터/핫식스)', mg: 160 },
    { name: '녹차 / 말차 1잔', mg: 35 },
  ];

  // Bedtime calculation
  const sleepMinutes = timeToMinutes(profile.sleepTime);
  const intakeMinutes = intakeHour * 60 + intakeMinute;

  let elapsedHoursToBed = (sleepMinutes - intakeMinutes + 1440) % 1440 / 60;
  if (elapsedHoursToBed > 24) elapsedHoursToBed = 24;

  // Formula: C(t) = C0 * 0.5^(t / 5.7)
  const halfLife = 5.7; // standard human caffeine half-life
  const remainingAtBed = selectedDrink.mg * Math.pow(0.5, elapsedHoursToBed / halfLife);

  // Hours until safe level (< 25mg)
  // 25 = C0 * 0.5^(t / 5.7) => t = 5.7 * log2(C0 / 25)
  const hoursToSafe = selectedDrink.mg > 25 ? halfLife * Math.log2(selectedDrink.mg / 25) : 0;
  const safeMinutes = (intakeMinutes + Math.round(hoursToSafe * 60)) % 1440;

  const isSafe = remainingAtBed <= 25;
  const isModerate = remainingAtBed > 25 && remainingAtBed <= 50;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-bold text-slate-900">카페인 체내 반감기 & 수면 영향 시뮬레이터</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          카페인의 인체 평균 반감기는 약 5.7시간입니다. 취침 시점에 혈중에 남은 카페인을 정밀 계산합니다.
        </p>
      </div>

      {/* Drink Select */}
      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-2">섭취한 음료 선택</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {drinks.map((d) => (
            <button
              key={d.name}
              type="button"
              onClick={() => setSelectedDrink(d)}
              className={`p-2.5 rounded-xl text-left border text-xs transition-all ${
                selectedDrink.name === d.name
                  ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold ring-1 ring-amber-400'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
              }`}
            >
              <span className="block">{d.name}</span>
              <span className="text-[11px] text-amber-600 font-mono mt-0.5 block">{d.mg}mg</span>
            </button>
          ))}
        </div>
      </div>

      {/* Intake Time Select */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70">
        <label className="text-xs font-semibold text-slate-700 block mb-2">
          섭취 시각: {String(intakeHour).padStart(2, '0')}:{String(intakeMinute).padStart(2, '0')}
        </label>
        <input
          type="range"
          min="6"
          max="23"
          step="1"
          value={intakeHour}
          onChange={(e) => setIntakeHour(parseInt(e.target.value, 10))}
          className="w-full accent-amber-500 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
          <span>오전 06:00</span>
          <span>정오 12:00</span>
          <span>오후 15:00</span>
          <span>오후 18:00</span>
          <span>밤 23:00</span>
        </div>
      </div>

      {/* Result Card */}
      <div
        className={`p-4 rounded-2xl border transition-all ${
          isSafe
            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
            : isModerate
            ? 'bg-amber-50/80 border-amber-300 text-amber-950'
            : 'bg-rose-50/80 border-rose-300 text-rose-950'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            {isSafe ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold block">
              목표 취침 시각({profile.sleepTime}) 잔류 카페인: {Math.round(remainingAtBed)}mg
            </span>
            <p className="text-xs leading-relaxed font-normal">
              {isSafe && '✅ 숙면 안전 기준(25mg 이하)을 충족합니다. 밤잠의 3~4단계 서파 수면에 미치는 영향이 미미합니다.'}
              {isModerate && '⚠️ 경미한 각성 수준(25~50mg)입니다. 잠드는 데 시간이 더 걸리거나 미세 각성이 발생할 수 있습니다.'}
              {!isSafe && !isModerate && '🚨 깊은 수면 방해 위험! 카페인이 아데노신 수용체를 차단하여 뇌파 회복을 방해합니다. 따뜻한 온수 샤워와 이완 호흡을 권장합니다.'}
            </p>
            <div className="pt-2 text-[11px] text-slate-600 font-medium">
              💡 카페인이 25mg 이하로 떨어지는 안전 시간: <span className="font-mono font-bold text-slate-900">{minutesToTime(safeMinutes)}</span> 이후
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 3. Post-Meal Walk Timer
// -------------------------------------------------------------
const PostMealWalkTimer: React.FC = () => {
  const [seconds, setSeconds] = useState(15 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && seconds > 0) {
      interval = setInterval(() => setSeconds((s) => s - 1), 1000);
    } else if (seconds === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div className="flex flex-col items-center py-2 space-y-5">
      <div className="text-center">
        <h3 className="text-base font-bold text-slate-900">식후 15분 혈당 안정 산책 타이머</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md">
          식사 후 30분 이내에 15분만 걸어도 근육 세포(GLUT4 수송체)가 인슐린 분비 없이 혈중 포도당을 즉각 흡수합니다.
        </p>
      </div>

      {/* Countdown Ring */}
      <div className="relative w-48 h-48 rounded-full border-4 border-teal-100 flex items-center justify-center bg-teal-50/50 shadow-inner">
        <div className="text-center">
          <div className="text-4xl font-bold font-mono text-teal-800">
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </div>
          <span className="text-xs text-teal-600 font-medium mt-1 block">
            {isActive ? '가볍게 걷는 중...' : '준비 완료'}
          </span>
        </div>
      </div>

      {/* Control buttons */}
      <div className="flex items-center gap-3">
        {!isActive ? (
          <button
            onClick={() => setIsActive(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>산책 시작</span>
          </button>
        ) : (
          <button
            onClick={() => setIsActive(false)}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            <Pause className="w-4 h-4 fill-white" />
            <span>일시 정지</span>
          </button>
        )}
        <button
          onClick={() => {
            setIsActive(false);
            setSeconds(15 * 60);
          }}
          className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
          title="15분으로 리셋"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Walking Science Facts */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 text-xs text-slate-600 space-y-1.5 w-full">
        <span className="font-bold text-slate-800 block">🚶‍♂️ 식후 15분 걷기의 의학적 효과</span>
        <p>· 혈당 스파이크 폭을 최대 30~40% 감소시켜 인슐린 저항성을 예방합니다.</p>
        <p>· 급격한 혈당 롤러코스터로 인한 식후 나른함과 졸림(식곤증)을 원천 차단합니다.</p>
        <p>· 소화기 연동 운동을 자극하여 복부 팽만감과 소화 불량을 줄여줍니다.</p>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 4. Circadian Science Guide
// -------------------------------------------------------------
const ScienceGuide: React.FC = () => {
  const articles = [
    {
      title: '☀️ 아침 햇빛과 멜라토닌 타이머의 14시간 비밀',
      desc: '기상 직후 눈의 망막 세포(ipRGC)가 청색 파장을 감지하면 뇌 시교차상핵(SCN)이 "낮이 시작되었다"고 인식합니다. 이 순간 멜라토닌 분비가 멈추고 정확히 14~16시간 뒤 다시 멜라토닌이 방출되도록 화학적 타이머가 설정됩니다. 아침 햇빛을 쬐지 않으면 밤에 잠이 오지 않는 이유입니다.',
    },
    {
      title: '☕ 아데노신과 카페인의 줄다리기',
      desc: '깨어있는 동안 뇌에서는 피로 물질인 "아데노신"이 계속 쌓입니다. 카페인은 아데노신 수용체에 대신 결합하여 피로를 못 느끼게 속이는 물질입니다. 하지만 아데노신 자체가 사라진 것이 아니므로 카페인이 분해되면 한꺼번에 피로가 몰려오는 "카페인 크래시"가 발생합니다.',
    },
    {
      title: '🧠 수면 중 뇌를 세척하는 글림프 시스템',
      desc: '깊은 서파 수면(NREM 3단계)에 들어가면 뇌세포 사이 공간이 60% 넓어지며 뇌척수액이 파도처럼 밀려와 치매 유발 물질인 베타아밀로이드와 타우 단백질을 씻어냅니다. 수면 시간이 부족하면 뇌의 청소 주기가 중단되어 인지 기능이 영구적으로 저하됩니다.',
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900">생체 리듬(Circadian Biology) 핵심 의학 상식</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          인체의 24시간 생체 시계를 지배하는 과학적 원리를 이해하면 일상의 패턴 교정이 훨씬 쉬워집니다.
        </p>
      </div>

      <div className="space-y-3">
        {articles.map((art, idx) => (
          <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900">{art.title}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{art.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

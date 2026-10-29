import React, { useState } from 'react';
import { X, Check, Sparkles, HelpCircle } from 'lucide-react';
import { Chronotype, UserProfile } from '../types';
import { CHRONOTYPES } from '../utils/circadian';

interface ChronotypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
}

export const ChronotypeModal: React.FC<ChronotypeModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [chronotype, setChronotype] = useState<Chronotype>(profile.chronotype);
  const [wakeTime, setWakeTime] = useState<string>(profile.wakeTime);
  const [sleepTime, setSleepTime] = useState<string>(profile.sleepTime);
  const [waterTarget, setWaterTarget] = useState<number>(profile.waterTargetMl);
  const [showQuiz, setShowQuiz] = useState<boolean>(false);

  // Quiz state
  const [q1, setQ1] = useState<number | null>(null);
  const [q2, setQ2] = useState<number | null>(null);
  const [q3, setQ3] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleApplyQuiz = () => {
    if (q1 === null || q2 === null || q3 === null) return;
    const score = q1 + q2 + q3;
    let computed: Chronotype = 'bear';
    if (score <= 4) computed = 'lion';
    else if (score <= 7) computed = 'bear';
    else if (score <= 10) computed = 'wolf';
    else computed = 'dolphin';

    setChronotype(computed);
    setWakeTime(CHRONOTYPES[computed].naturalWake);
    setSleepTime(CHRONOTYPES[computed].naturalSleep);
    setShowQuiz(false);
  };

  const handleSave = () => {
    onSaveProfile({
      ...profile,
      chronotype,
      wakeTime,
      sleepTime,
      waterTargetMl: waterTarget,
    });
    onClose();
  };

  const currentChrono = CHRONOTYPES[chronotype];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-150 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900">내 생활 패턴 & 크로노타입 설정</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              기상·취침 시간에 맞춰 24시간 생체 시계가 실시간으로 자동 재조정됩니다.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Quick Quiz Accordion */}
          <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-200/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-900">
                <HelpCircle className="w-4 h-4 text-teal-600" />
                <span>나의 크로노타입을 잘 모르겠나요?</span>
              </div>
              <button
                type="button"
                onClick={() => setShowQuiz(!showQuiz)}
                className="text-xs text-teal-700 font-semibold hover:underline"
              >
                {showQuiz ? '자가진단 접기' : '3초 자가진단 시작하기'}
              </button>
            </div>

            {showQuiz && (
              <div className="mt-4 pt-3 border-t border-teal-200 space-y-3.5 text-xs text-slate-700">
                <div>
                  <span className="font-semibold block mb-1">Q1. 휴일에 알람 없이 눈을 뜨는 시간은?</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => setQ1(1)}
                      className={`p-2 rounded-lg border text-left ${q1 === 1 ? 'bg-teal-600 text-white font-bold' : 'bg-white'}`}
                    >
                      오전 6시 이전 (사자)
                    </button>
                    <button
                      onClick={() => setQ1(2)}
                      className={`p-2 rounded-lg border text-left ${q1 === 2 ? 'bg-teal-600 text-white font-bold' : 'bg-white'}`}
                    >
                      오전 7~8시 (곰)
                    </button>
                    <button
                      onClick={() => setQ1(3)}
                      className={`p-2 rounded-lg border text-left ${q1 === 3 ? 'bg-teal-600 text-white font-bold' : 'bg-white'}`}
                    >
                      오전 9시 이후 (늑대)
                    </button>
                    <button
                      onClick={() => setQ1(4)}
                      className={`p-2 rounded-lg border text-left ${q1 === 4 ? 'bg-teal-600 text-white font-bold' : 'bg-white'}`}
                    >
                      자주 깨며 불규칙함 (돌고래)
                    </button>
                  </div>
                </div>

                <div>
                  <span className="font-semibold block mb-1">Q2. 하루 중 머리가 가장 맑고 집중이 잘되는 시간은?</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => setQ2(1)}
                      className={`p-2 rounded-lg border text-left ${q2 === 1 ? 'bg-teal-600 text-white font-bold' : 'bg-white'}`}
                    >
                      아침 8시~정오 (사자)
                    </button>
                    <button
                      onClick={() => setQ2(2)}
                      className={`p-2 rounded-lg border text-left ${q2 === 2 ? 'bg-teal-600 text-white font-bold' : 'bg-white'}`}
                    >
                      오전 10시~오후 2시 (곰)
                    </button>
                    <button
                      onClick={() => setQ2(3)}
                      className={`p-2 rounded-lg border text-left ${q2 === 3 ? 'bg-teal-600 text-white font-bold' : 'bg-white'}`}
                    >
                      오후 5시~밤 11시 (늑대)
                    </button>
                    <button
                      onClick={() => setQ2(4)}
                      className={`p-2 rounded-lg border text-left ${q2 === 4 ? 'bg-teal-600 text-white font-bold' : 'bg-white'}`}
                    >
                      에너지가 짧게 끊김 (돌고래)
                    </button>
                  </div>
                </div>

                <div>
                  <span className="font-semibold block mb-1">Q3. 밤 11시가 되었을 때 당신의 몸 상태는?</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => setQ3(1)}
                      className={`p-2 rounded-lg border text-left ${q3 === 1 ? 'bg-teal-600 text-white font-bold' : 'bg-white'}`}
                    >
                      이미 잠들었거나 졸림 (사자)
                    </button>
                    <button
                      onClick={() => setQ3(2)}
                      className={`p-2 rounded-lg border text-left ${q3 === 2 ? 'bg-teal-600 text-white font-bold' : 'bg-white'}`}
                    >
                      잘 준비를 시작함 (곰)
                    </button>
                    <button
                      onClick={() => setQ3(3)}
                      className={`p-2 rounded-lg border text-left ${q3 === 3 ? 'bg-teal-600 text-white font-bold' : 'bg-white'}`}
                    >
                      이제야 집중이 시작됨 (늑대)
                    </button>
                    <button
                      onClick={() => setQ3(4)}
                      className={`p-2 rounded-lg border text-left ${q3 === 4 ? 'bg-teal-600 text-white font-bold' : 'bg-white'}`}
                    >
                      피곤하지만 잠들기 어려움 (돌고래)
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleApplyQuiz}
                  disabled={q1 === null || q2 === null || q3 === null}
                  className="w-full py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold rounded-lg transition-colors"
                >
                  진단 결과 적용하기
                </button>
              </div>
            )}
          </div>

          {/* Chronotype Selection 4 Cards */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-2">
              크로노타입 (생체 유형) 선택
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {(Object.keys(CHRONOTYPES) as Chronotype[]).map((key) => {
                const item = CHRONOTYPES[key];
                const isSelected = chronotype === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setChronotype(key);
                      setWakeTime(item.naturalWake);
                      setSleepTime(item.naturalSleep);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{item.symbol}</span>
                      {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                    </div>
                    <div className="mt-2">
                      <span className="text-xs font-bold text-slate-900 block">{item.nameKo}</span>
                      <span className="text-[11px] text-slate-500 block">{item.subtitle}</span>
                      <span className="text-[10px] text-emerald-700 font-mono mt-1 block">
                        권장: {item.naturalWake} 기상 / {item.naturalSleep} 취침
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-150">
              💡 {currentChrono.description}
            </p>
          </div>

          {/* Wake & Sleep Time pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                목표 기상 시간
              </label>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                목표 취침 시간
              </label>
              <input
                type="time"
                value={sleepTime}
                onChange={(e) => setSleepTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Daily Water Target */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-800">
                하루 수분 섭취 목표: <span className="text-cyan-600 font-mono font-bold">{waterTarget}ml</span>
              </label>
            </div>
            <input
              type="range"
              min="1000"
              max="3500"
              step="100"
              value={waterTarget}
              onChange={(e) => setWaterTarget(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
              <span>1000ml</span>
              <span>2000ml (권장)</span>
              <span>3000ml</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-150 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>설정 저장 & 스케줄 반영</span>
          </button>
        </div>
      </div>
    </div>
  );
};

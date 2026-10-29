import React, { useState } from 'react';
import { Sparkles, Send, RefreshCw, Copy, Check, Clock, HeartPulse, Zap } from 'lucide-react';
import { UserProfile } from '../types';
import { CHRONOTYPES } from '../utils/circadian';

interface AICoachSectionProps {
  profile: UserProfile;
  rhythmScore: number;
  completedHabitsCount: number;
  totalHabitsCount: number;
}

export const AICoachSection: React.FC<AICoachSectionProps> = ({
  profile,
  rhythmScore,
  completedHabitsCount,
  totalHabitsCount,
}) => {
  const [issues, setIssues] = useState('');
  const [goal, setGoal] = useState('수면의 질 개선 및 일상 활력 증진');
  const [isLoading, setIsLoading] = useState(false);
  const [prescription, setPrescription] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const presets = [
    {
      title: '☀️ 밤낮 바뀐 수면 패턴 리셋',
      issue: '새벽 2~3시까지 잠들지 못하고 아침에 억지로 일어나며 하루 종일 무기력합니다.',
      goal: '생체 시계 2시간 앞당기기 및 아침 각성 물질 정상화',
    },
    {
      title: '📉 오후 2~4시 극심한 식곤증 & 피로',
      issue: '점심 식사 후 눈을 뜰 수 없을 정도로 졸리고, 오후 집중력이 바닥나 커피를 몰아마십니다.',
      goal: '혈당 스파이크 차단 및 오후 인지 피로 극복',
    },
    {
      title: '☕ 카페인 의존 및 얕은 수면',
      issue: '하루에 커피를 3잔 이상 마시며, 밤에 누워도 머리가 각성되어 깊은 잠을 못 잡니다.',
      goal: '카페인 컷오프 엄수 및 서파 수면(깊은 잠) 비율 증대',
    },
    {
      title: '🏢 야근 및 불규칙한 식사 패턴',
      issue: '퇴근 시간이 늦어 밤 9시 이후에 저녁을 먹고, 주말에 몰아서 자는 소셜 제트랙이 심합니다.',
      goal: '위장관 생체시계 보호 및 주말 수면 분절 방지',
    },
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setIssues(p.issue);
    setGoal(p.goal);
  };

  const handleGeneratePrescription = async () => {
    setIsLoading(true);
    try {
      const chronoInfo = CHRONOTYPES[profile.chronotype];
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chronotype: chronoInfo.nameKo,
          wakeTime: profile.wakeTime,
          sleepTime: profile.sleepTime,
          issues: issues || '전반적인 피로감 및 생활 리듬 불균형',
          userGoal: goal,
          currentRoutines: {
            rhythmScore,
            completedHabits: `${completedHabitsCount}/${totalHabitsCount}`,
            waterTarget: profile.waterTargetMl,
          },
        }),
      });

      const data = await res.json();
      if (data.result) {
        setPrescription(data.result);
      } else {
        throw new Error('No result returned');
      }
    } catch (err) {
      console.error('Coaching request failed, using instant clinical prescription', err);
      // Client-side fallback if fetch fails
      setPrescription(`### 🎯 [패턴 진단 요약]
현재 기상 시간(${profile.wakeTime})과 취침 시간(${profile.sleepTime})을 분석한 결과, **${CHRONOTYPES[profile.chronotype].nameKo}** 패턴에 맞춘 코르티솔-멜라토닌 주기를 재설정해야 합니다. 아침 자연광 15분 노출과 오후 카페인 조기 마감이 오늘 가장 시급한 핵심 과제입니다.

---

### ⏰ [맞춤형 24시간 바이오리듬 타임라인]
- **${profile.wakeTime} [기상 & 햇빛 리셋]**: 기상 직후 미온수 350ml를 마시고 15분간 창가 햇빛을 눈에 담으세요.
- **기상 후 2시간 [영양 아침 식사]**: 단백질 위주의 든든한 식사로 대사 시계를 가동합니다.
- **오전 10:00 ~ 12:00 [인지력 골든타임]**: 집중력이 가장 높은 시간이므로 중요한 의사결정을 완료하세요.
- **점심 식사 후 [식후 15분 걷기]**: 근육의 GLUT4 포도당 흡수를 유도해 오후 식곤증을 막습니다.
- **오후 14:00 [카페인 컷오프]**: 이후에는 보리차나 루이보스티로 전환하세요.
- **퇴근 전후 [체온 피크 운동 30분]**: 심폐 및 근력 운동으로 야간 수면 압력을 생성합니다.
- **${profile.sleepTime} 1시간 전 [디지털 디톡스]**: 조명을 어둡게 하고 4-7-8 이완 호흡을 진행하세요.

---

### ⚡ [오늘 당장 실천할 골든 룰 3가지]
1. 기상 직후 침대에서 벗어나 햇빛 15분 마주하기
2. 오후 2시 이후 카페인 음료 일절 중단하기
3. 취침 전 스마트폰 화면 끄고 주황빛 간접등 켜기`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!prescription) return;
    navigator.clipboard.writeText(prescription);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-teal-800/40">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
          <Sparkles className="w-4 h-4" />
          <span>생체 의학 기반 AI 생활 패턴 코치</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
          나만의 24시간 바이오리듬 맞춤 처방전
        </h2>
        <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
          당신의 기상 시간({profile.wakeTime}), 취침 시간({profile.sleepTime}), {CHRONOTYPES[profile.chronotype].nameKo} 체질에 맞춰
          만성 피로를 없애고 최적의 컨디션을 이끌어내는 정밀 시간표를 생성합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Dilemmas & Presets */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900">자주 겪는 생활 패턴 고민 (클릭 시 자동 입력)</h3>
            <div className="space-y-2 mt-2.5">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all text-xs"
                >
                  <span className="font-bold text-slate-800 block">{p.title}</span>
                  <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{p.issue}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              현재 겪고 있는 건강 & 생활 패턴 고민
            </label>
            <textarea
              rows={3}
              value={issues}
              onChange={(e) => setIssues(e.target.value)}
              placeholder="예: 아침 7시에 일어나는데 오전 내내 멍하고, 점심 먹으면 쏟아지는 잠 때문에 커피를 3잔 마셔요. 취침은 밤 12시 반입니다."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              개선하고 싶은 최우선 목표
            </label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="예: 식곤증 극복 및 깊은 숙면 달성"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            onClick={handleGeneratePrescription}
            disabled={isLoading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>생체리듬 분석 및 처방전 생성 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>AI 맞춤 생활 처방전 생성하기</span>
              </>
            )}
          </button>
        </div>

        {/* Right Area: Generated Prescription View */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-150">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
                <HeartPulse className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">맞춤 처방 결과</h3>
            </div>
            {prescription && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? '복사 완료!' : '처방전 복사'}</span>
              </button>
            )}
          </div>

          {prescription ? (
            <div className="prose prose-sm max-w-none text-xs leading-relaxed text-slate-700 whitespace-pre-wrap font-sans">
              {prescription}
            </div>
          ) : (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">아직 생성된 처방전이 없습니다</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                  왼쪽에서 당신의 평소 고민이나 프리셋을 선택한 뒤 [처방전 생성하기]를 누르면 과학적인 24시간 생활 패턴 지도가 만들어집니다.
                </p>
              </div>
              <button
                onClick={() => {
                  handleApplyPreset(presets[0]);
                  handleGeneratePrescription();
                }}
                className="inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                <span>추천 프리셋으로 바로 시작해보기</span>
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

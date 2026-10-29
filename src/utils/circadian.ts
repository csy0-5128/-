import { Chronotype, ChronotypeInfo, CircadianPhase, UserProfile, HabitItem } from '../types';

export const CHRONOTYPES: Record<Chronotype, ChronotypeInfo> = {
  lion: {
    type: 'lion',
    nameKo: '사자형 (Lion)',
    subtitle: '아침형 인간 · 얼리 버드',
    symbol: '🦁',
    percentage: '전체 인구의 약 15~20%',
    naturalWake: '05:30',
    naturalSleep: '21:30',
    peakEnergy: '오전 08:00 ~ 12:00',
    description: '알람 없이도 일찍 눈을 뜨며, 오전 중에 최고의 집중력과 의사결정력을 발휘합니다. 저녁에는 에너지가 급격히 떨어지므로 중요한 일은 오전에 마치는 것이 좋습니다.',
    advice: '아침 시간대를 핵심 업무에 집중 배치하고, 저녁에는 강도 높은 운동이나 야근을 피하여 일찍 수면 환경을 조성하세요.',
  },
  bear: {
    type: 'bear',
    nameKo: '곰형 (Bear)',
    subtitle: '태양 동기화형 · 표준 생체 리듬',
    symbol: '🐻',
    percentage: '전체 인구의 약 50%',
    naturalWake: '07:00',
    naturalSleep: '23:00',
    peakEnergy: '오전 10:00 ~ 오후 14:00',
    description: '태양의 주기에 가장 완벽하게 동기화된 리듬입니다. 아침 기상 후 1~2시간 뒤부터 에너지가 올라가며, 점심 직후 살짝 나른함을 겪지만 규칙적인 생활에 가장 최적화되어 있습니다.',
    advice: '점심 식사 후 15분 햇빛 산책으로 오후 식곤증을 예방하고, 오후 2시 이전 카페인 섭취 마감을 엄수하면 최상의 컨디션을 유지할 수 있습니다.',
  },
  wolf: {
    type: 'wolf',
    nameKo: '늑대형 (Wolf)',
    subtitle: '저녁형 인간 · 나이트 아울',
    symbol: '🐺',
    percentage: '전체 인구의 약 15~20%',
    naturalWake: '08:30',
    naturalSleep: '00:30',
    peakEnergy: '오후 17:00 ~ 밤 22:00',
    description: '아침에 눈을 뜨는 것이 가장 힘들고 오전에는 뇌 기능이 서서히 워밍업됩니다. 오후 늦은 시간부터 밤에 걸쳐 창의력, 사고력, 집중력이 폭발합니다.',
    advice: '기상 직후 강력한 햇빛이나 밝은 빛을 의도적으로 쬐어 코르티솔 분비를 촉진하고, 밤늦게 블루라이트에 노출되어 취침이 더 밀리지 않도록 관리하세요.',
  },
  dolphin: {
    type: 'dolphin',
    nameKo: '돌고래형 (Dolphin)',
    subtitle: '예민형 · 가벼운 수면가',
    symbol: '🐬',
    percentage: '전체 인구의 약 10%',
    naturalWake: '06:30',
    naturalSleep: '23:30',
    peakEnergy: '오전 10:00 ~ 12:00 & 16:00 ~ 18:00',
    description: '뇌의 한쪽 반구만 자고 다른 쪽은 깨어있는 돌고래처럼, 소음이나 스트레스에 예민하고 얕은 잠을 자는 경향이 있습니다. 불안과 완벽주의 성향이 잦습니다.',
    advice: '취침 전 2시간 동안 모든 디지털 기기를 멀리하고 4-7-8 이완 호흡을 매일 실천하세요. 카페인에 매우 민감하므로 하루 1잔 이하, 정오 이전에만 마시는 것이 좋습니다.',
  },
};

export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function minutesToTime(minutes: number): string {
  const norm = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(norm / 60);
  const m = norm % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatMinutesLabel(minutes: number): string {
  const norm = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(norm / 60);
  const m = norm % 60;
  const period = h < 12 ? '오전' : '오후';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${period} ${displayH}시` : `${period} ${displayH}시 ${m}분`;
}

/**
 * Calculates customized 24-hour circadian phases based on user profile.
 */
export function calculateCircadianPhases(profile: UserProfile): CircadianPhase[] {
  const wakeM = timeToMinutes(profile.wakeTime);
  const sleepM = timeToMinutes(profile.sleepTime);

  // Calculate day length and sleep duration
  const sleepDuration = (sleepM - wakeM + 1440) % 1440; // awake period is 1440 - sleepDuration

  const p1End = (wakeM + 90) % 1440; // 기상 후 90분
  const p2End = (wakeM + 180) % 1440; // 기상 후 3시간
  const p3End = (wakeM + 330) % 1440; // 기상 후 5.5시간 (오전 집중)
  const p4End = (wakeM + 420) % 1440; // 점심 & 리셋
  const p5End = (sleepM - 480 + 1440) % 1440; // 취침 8시간 전 (카페인 컷오프)
  const p6End = (sleepM - 300 + 1440) % 1440; // 운동 골든타임
  const p7End = (sleepM - 150 + 1440) % 1440; // 저녁 & 소화 완료
  const p8End = sleepM; // 취침 준비 & 멜라토닌

  const phases: CircadianPhase[] = [
    {
      id: 'wake_cortisol',
      title: '기상 & 코르티솔 각성 서지',
      timeRange: `${profile.wakeTime} ~ ${minutesToTime(p1End)}`,
      startMinutes: wakeM,
      endMinutes: p1End,
      tag: '모닝 리셋',
      iconName: 'Sunrise',
      accentColor: 'text-amber-500',
      badgeBg: 'bg-amber-50 text-amber-700',
      borderColor: 'border-amber-200',
      biomarker: '코르티솔 각성 반응(CAR) 급증, 심부 체온 상승 시작',
      summary: '자연광 햇빛 15분과 미온수 350ml로 세포의 생체 시계를 일깨우는 가장 중요한 시간입니다.',
      actionItems: [
        '기상 즉시 커튼을 열고 창가 또는 야외에서 햇빛 15분 쬐기',
        '미온수 350ml를 마셔 밤사이 손실된 수분과 혈액 순환 보충',
        '기상 90분 이내에는 커피 자제 (천연 코르티솔 분비 방해 예방)',
        '가벼운 관절 회전 및 척추 기지개 스트레칭',
      ],
      recommendedAction: '창가로 가서 햇빛을 바라보며 미온수 한 잔을 천천히 드세요.',
      caution: '기상 직후 침대에서 스마트폰을 보는 것은 도파민 교란을 일으킵니다.',
      hormoneFocus: '코르티솔(각성 호르몬) 정상 분비 유도',
    },
    {
      id: 'digest_nutrition',
      title: '소화 활성 & 아침 영양 흡수',
      timeRange: `${minutesToTime(p1End)} ~ ${minutesToTime(p2End)}`,
      startMinutes: p1End,
      endMinutes: p2End,
      tag: '영양 충전',
      iconName: 'Utensils',
      accentColor: 'text-emerald-500',
      badgeBg: 'bg-emerald-50 text-emerald-700',
      borderColor: 'border-emerald-200',
      biomarker: '위장 연동 운동 활성화, 인슐린 감수성 양호',
      summary: '신진대사를 켜고 혈당 롤러코스터를 방지하기 위해 단백질 위주의 든든한 식사를 섭취하세요.',
      actionItems: [
        '단백질 20g 이상 함유된 식사 (달걀, 두부, 닭가슴살, 그릭요거트)',
        '단당류·정제 탄수화물(빵, 시리얼, 과일주스) 단독 섭취 지양',
        '첫 커피는 이 시간대에 섭취 (아데노신 수용체 블록 효과 최적화)',
      ],
      recommendedAction: '단백질이 포함된 균형 잡힌 아침 식사를 천천히 씹어드세요.',
      hormoneFocus: '그렐린(식탐 호르몬) 억제 & 포만감 펩타이드(PYY) 분비',
    },
    {
      id: 'cognitive_peak',
      title: '인지력 & 뇌 집중 골든 아워',
      timeRange: `${minutesToTime(p2End)} ~ ${minutesToTime(p3End)}`,
      startMinutes: p2End,
      endMinutes: p3End,
      tag: '몰입 & 집중',
      iconName: 'Brain',
      accentColor: 'text-indigo-500',
      badgeBg: 'bg-indigo-50 text-indigo-700',
      borderColor: 'border-indigo-200',
      biomarker: '전두엽 실행 기능, 논리 분석력, 작업 기억력 일일 최고치',
      summary: '하루 중 뇌가 가장 명료하고 날카로운 시간대입니다. 복잡한 의사결정, 기획, 학습을 배치하세요.',
      actionItems: [
        '메신저와 SNS 알림을 끄고 50분 집중 / 10분 휴식 뽀모도로 실천',
        '가장 난이도가 높고 중요한 핵심 업무 1순위 완료하기',
        '수분 300ml 섭취로 뇌 탈수 예방',
      ],
      recommendedAction: '지금 가장 집중을 요하는 핵심 과제에 50분간 몰입하세요.',
      caution: '잡무나 단순 메일 회신으로 이 골든 아워를 낭비하지 마세요.',
      hormoneFocus: '노르에피네프린 & 아세틸콜린 집중 물질 최고조',
    },
    {
      id: 'lunch_glycemic_walk',
      title: '점심 식사 & 혈당 안정 산책',
      timeRange: `${minutesToTime(p3End)} ~ ${minutesToTime(p4End)}`,
      startMinutes: p3End,
      endMinutes: p4End,
      tag: '대사 & 리셋',
      iconName: 'Footprints',
      accentColor: 'text-teal-500',
      badgeBg: 'bg-teal-50 text-teal-700',
      borderColor: 'border-teal-200',
      biomarker: '인슐린 분비에 따른 식후 나른함(Postprandial dip)',
      summary: '식사 후 가벼운 15분 걷기는 인슐린 도움 없이 근육이 혈당을 흡수하게 해 식곤증을 없애줍니다.',
      actionItems: [
        '식이섬유(채소) → 단백질 → 탄수화물 순서로 식사하기',
        '식후 30분 이내에 가벼운 보폭으로 15분 야외 산책',
        '극심한 졸음 발생 시 15~20분 파워 냅(Power Nap) 취하기 (30분 초과 금지)',
      ],
      recommendedAction: '식사 후 바로 앉지 말고 10~15분 동안 천천히 걸어보세요.',
      caution: '고탄수화물 과식은 급격한 혈당 스파이크와 극심한 오후 피로를 유발합니다.',
      hormoneFocus: '인슐린 스파이크 방지 & 포도당 대사 조절',
    },
    {
      id: 'caffeine_cutoff',
      title: '협업 업무 & 카페인 컷오프 데드라인',
      timeRange: `${minutesToTime(p4End)} ~ ${minutesToTime(p5End)}`,
      startMinutes: p4End,
      endMinutes: p5End,
      tag: '카페인 마감',
      iconName: 'Coffee',
      accentColor: 'text-amber-600',
      badgeBg: 'bg-amber-50 text-amber-800',
      borderColor: 'border-amber-300',
      biomarker: '카페인 반감기(5~8시간) 시작 카운트다운',
      summary: '오늘 밤의 깊은 서파 수면(Slow-wave sleep)을 위해 이 시간 이후 카페인 섭취를 중단해야 합니다.',
      actionItems: [
        `⚠️ 오후 ${minutesToTime(p5End)} 이후 커피, 에너지드링크, 진한 녹차 섭취 중단`,
        '미팅, 이메일 답장, 협업 및 창의적 브레인스토밍 업무 진행',
        '수분 보충: 루이보스티, 따뜻한 보리차, 레몬수 추천',
      ],
      recommendedAction: '마지막 커피 잔을 비우고, 이후에는 카페인 프리 음료로 전환하세요.',
      caution: '오후 늦은 카페인은 잠이 드는 것과 무관하게 깊은 잠(3~4단계)을 30% 이상 파괴합니다.',
      hormoneFocus: '아데노신 자연 축적 보장 (야간 수면 압력 생성)',
    },
    {
      id: 'physical_peak',
      title: '신체 운동 골든타임 & 체온 피크',
      timeRange: `${minutesToTime(p5End)} ~ ${minutesToTime(p6End)}`,
      startMinutes: p5End,
      endMinutes: p6End,
      tag: '운동 최적기',
      iconName: 'Dumbbell',
      accentColor: 'text-rose-500',
      badgeBg: 'bg-rose-50 text-rose-700',
      borderColor: 'border-rose-200',
      biomarker: '심부 체온 하루 최고점, 악력·폐활량·관절 유연성 정점',
      summary: '체온과 근육 반응성이 최고조여서 부상 위험이 가장 낮고 운동 효율과 칼로리 소모가 극대화됩니다.',
      actionItems: [
        '중강도~고강도 근력 운동 또는 인터벌 유산소 30~50분 진행',
        '운동 중 충분한 수분 섭취',
        '운동 후 가벼운 쿨다운 스트레칭으로 젖산 배출',
      ],
      recommendedAction: '퇴근 전후 30분 운동이나 빠른 걷기로 심폐와 근육을 자극하세요.',
      hormoneFocus: '엔도르핀 & 성장호르몬 자극, 일일 스트레스 호르몬 정화',
    },
    {
      id: 'dinner_winddown',
      title: '저녁 식사 & 소화 휴식',
      timeRange: `${minutesToTime(p6End)} ~ ${minutesToTime(p7End)}`,
      startMinutes: p6End,
      endMinutes: p7End,
      tag: '저녁 루틴',
      iconName: 'MoonStar',
      accentColor: 'text-violet-500',
      badgeBg: 'bg-violet-50 text-violet-700',
      borderColor: 'border-violet-200',
      biomarker: '체온 서서히 하강 시작, 위장 운동 둔화 조짐',
      summary: '취침 최소 3시간 전에 가볍게 식사를 마쳐야 수면 중 소화기 내장 기관이 온전히 휴식합니다.',
      actionItems: [
        '자극적이거나 기름진 야식 금지, 소화가 잘되는 가벼운 식단',
        '취침 3시간 전 식사 완료 (역류성 식도염 및 수면 분절 방지)',
        '하루 일과 정리 및 내일의 우선순위 3가지 메모하기',
      ],
      recommendedAction: '소화가 편한 식사를 마치고 가벼운 설거지나 정리로 마음을 가라앉히세요.',
      caution: '늦은 야식은 밤새 심장박동을 올리고 멜라토닌 분비를 방해합니다.',
      hormoneFocus: '소화기 췌장 쉴 준비 & 체온 점진적 하강',
    },
    {
      id: 'melatonin_prep',
      title: '멜라토닌 보호 & 디지털 디톡스',
      timeRange: `${minutesToTime(p7End)} ~ ${profile.sleepTime}`,
      startMinutes: p7End,
      endMinutes: sleepM,
      tag: '수면 준비',
      iconName: 'ShieldAlert',
      accentColor: 'text-blue-500',
      badgeBg: 'bg-blue-50 text-blue-700',
      borderColor: 'border-blue-200',
      biomarker: '송과체 멜라토닌 대량 분비 시작, 부교감 신경계(이완) 우세',
      summary: '파란빛(블루라이트)을 완전히 차단하고 주황빛 조명과 이완 호흡으로 뇌에 수면 신호를 전달하세요.',
      actionItems: [
        '집안 메인 천장등 끄고 낮은 주황색 간접 스탠드 조명 켜기',
        '취침 60분 전 스마트폰·태블릿 침실 밖으로 치우기',
        '40°C 미온수로 10분 가벼운 샤워 (혈관 확장 후 심부 체온 급랭 유도)',
        '4-7-8 이완 수면 호흡 4회 반복',
      ],
      recommendedAction: '스마트폰을 내려놓고 방 조명을 어둡게 한 뒤 4-7-8 호흡을 해보세요.',
      caution: '침대에서 숏폼 비디오 시청 시 멜라토닌 분비가 50% 이상 억제됩니다.',
      hormoneFocus: '멜라토닌(수면 호르몬) 폭발적 합성',
    },
    {
      id: 'deep_sleep_recovery',
      title: '깊은 재생 수면 & 글림프 뇌청소',
      timeRange: `${profile.sleepTime} ~ ${profile.wakeTime}`,
      startMinutes: sleepM,
      endMinutes: wakeM,
      tag: '세포 재생',
      iconName: 'BedDouble',
      accentColor: 'text-slate-600',
      badgeBg: 'bg-slate-100 text-slate-700',
      borderColor: 'border-slate-300',
      biomarker: '뇌 척수액 글림프 시스템 활성화(베타아밀로이드 노폐물 청소), 근육 조직 합성',
      summary: '완전한 암막과 적정 실내 온도(18~20°C)에서 뇌와 면역 세포가 하루의 피로를 치유합니다.',
      actionItems: [
        '완전 암막 커튼 또는 안대 착용으로 미세 빛 차단',
        '실내 온도 18~21°C 유지 (약간 서늘한 온도가 숙면에 최적)',
        '최소 7시간 이상의 양질의 연속 수면 확보',
      ],
      recommendedAction: '눈을 감고 온몸의 긴장을 풀며 편안한 호흡에 집중하세요.',
      hormoneFocus: '성장호르몬 분비 & 면역 사이토카인 재건',
    },
  ];

  return phases;
}

export function getCurrentTimeMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

/**
 * Checks if targetMinutes falls between start and end (handling overnight wrapping).
 */
export function isTimeInPhase(targetMinutes: number, start: number, end: number): boolean {
  if (start <= end) {
    return targetMinutes >= start && targetMinutes < end;
  }
  // Wraps over midnight (e.g. 23:00 to 07:00)
  return targetMinutes >= start || targetMinutes < end;
}

/**
 * Returns current phase and minutes remaining until phase end.
 */
export function findCurrentPhase(phases: CircadianPhase[], currentMinutes: number): {
  phase: CircadianPhase;
  remainingMinutes: number;
  progressPercent: number;
} {
  for (const p of phases) {
    if (isTimeInPhase(currentMinutes, p.startMinutes, p.endMinutes)) {
      let duration: number;
      let elapsed: number;
      if (p.startMinutes <= p.endMinutes) {
        duration = p.endMinutes - p.startMinutes;
        elapsed = currentMinutes - p.startMinutes;
      } else {
        duration = (p.endMinutes - p.startMinutes + 1440) % 1440;
        elapsed = (currentMinutes - p.startMinutes + 1440) % 1440;
      }
      const remainingMinutes = Math.max(0, duration - elapsed);
      const progressPercent = duration > 0 ? Math.min(100, Math.round((elapsed / duration) * 100)) : 0;
      return { phase: p, remainingMinutes, progressPercent };
    }
  }

  // fallback to first phase
  return { phase: phases[0], remainingMinutes: 60, progressPercent: 50 };
}

export const CORE_HABITS: HabitItem[] = [
  {
    id: 'habit_sunlight',
    title: '아침 햇빛 15분 쬐기',
    category: 'morning',
    description: '기상 직후 자연광으로 뇌 시교차상핵 생체 시계 리셋',
    iconName: 'Sun',
    points: 20,
  },
  {
    id: 'habit_morning_water',
    title: '기상 직후 미온수 350ml',
    category: 'morning',
    description: '밤사이 손실된 체액 보충 및 혈액 림프 순환 가동',
    iconName: 'Droplet',
    points: 15,
  },
  {
    id: 'habit_meal_walk',
    title: '식후 15분 가벼운 걷기',
    category: 'day',
    description: '식후 혈당 스파이크 차단 및 오후 식곤증 예방',
    iconName: 'Footprints',
    points: 20,
  },
  {
    id: 'habit_caffeine_cutoff',
    title: '오후 카페인 컷오프 엄수',
    category: 'day',
    description: '취침 8시간 전 카페인 섭취 중단하여 서파 수면 보호',
    iconName: 'Coffee',
    points: 15,
  },
  {
    id: 'habit_golden_workout',
    title: '골든타임 신체 활동 30분',
    category: 'evening',
    description: '체온 최고점 시간대에 유산소 또는 스트레칭·근력 운동',
    iconName: 'Activity',
    points: 15,
  },
  {
    id: 'habit_night_detox',
    title: '취침 1시간 전 디지털 디톡스',
    category: 'night',
    description: '주황빛 간접조명 전환 및 스마트폰 블루라이트 차단',
    iconName: 'Moon',
    points: 15,
  },
];

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini client if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  aiClient = new GoogleGenAI({ apiKey });
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasApiKey: !!aiClient });
});

// AI Lifestyle Pattern Coach Endpoint
app.post('/api/ai/coach', async (req, res) => {
  try {
    const { chronotype, wakeTime, sleepTime, issues, currentRoutines, userGoal } = req.body;

    const prompt = `
당신은 대한민국 최고의 생체리듬(Circadian Biology) 및 건강 생활의학 전문 코치입니다.
사용자의 생활 패턴 정보와 건강 고민을 바탕으로, 과학적이고 즉시 실천 가능한 맞춤형 "24시간 건강 생활 리듬 처방전"을 한국어로 작성해주세요.

[사용자 프로필]
- 크로노타입(생체 유형): ${chronotype || '미설정'}
- 평소 기상 시간: ${wakeTime || '07:00'}
- 평소 취침 시간: ${sleepTime || '23:30'}
- 주요 건강 고민 및 불편 증상: ${issues || '만성 피로 및 불규칙한 생활 리듬'}
- 현재 지키고 있는 루틴: ${currentRoutines ? JSON.stringify(currentRoutines) : '없음'}
- 개선 목표: ${userGoal || '생체 리듬 회복과 에너지 향상'}

[지침 사항]
1. 따뜻하고 전문적이며 격려하는 어조로 답변하세요.
2. 아래 4가지 섹션으로 명확하게 구분하여 작성해주세요:
   - 🎯 **[패턴 진단 요약]**: 사용자의 현재 패턴의 핵심 문제점과 개선 포인트 (2~3문장)
   - ⏰ **[맞춤형 24시간 바이오리듬 타임라인]**: 기상부터 취침까지 시간대별 행동 가이드 (기상, 아침 햇볕, 식사 시간, 집중 업무, 카페인 컷오프, 운동 최적기, 취침 준비 루틴)
   - ⚡ **[오늘 당장 실천할 골든 룰 3가지]**: 실천 난이도가 낮으면서 효과가 가장 큰 행동 3가지
   - 💡 **[생체학적 꿀팁 (Chronobiology Insight)]**: 코르티솔/멜라토닌/체온 리듬 관점의 전문적인 건강 팁
3. 마크다운 형식으로 가독성 높고 깔끔하게 작성해주세요. 불필요한 서론이나 장황한 인사말은 생략하고 바로 본론으로 들어가세요.
`;

    if (!aiClient) {
      // High-quality deterministic fallback coaching if API key is not configured
      const fallbackResponse = generateRuleBasedPrescription(chronotype, wakeTime, sleepTime, issues, userGoal);
      return res.json({ result: fallbackResponse, source: 'fallback' });
    }

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI response timeout')), 8000)
    );

    let resultText = '';
    try {
      const response = await Promise.race([
        aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        }),
        timeoutPromise,
      ]) as any;
      resultText = response.text || '';
    } catch (primaryErr) {
      console.warn('Live model took too long or was busy, using instant clinical prescription fallback', primaryErr);
      const fallbackResponse = generateRuleBasedPrescription(
        chronotype,
        wakeTime,
        sleepTime,
        issues,
        userGoal
      );
      return res.json({ result: fallbackResponse, source: 'fallback' });
    }

    res.json({ result: resultText, source: 'gemini' });
  } catch (error: any) {
    console.error('Error generating AI coaching:', error);
    // Graceful fallback on API error
    const fallbackResponse = generateRuleBasedPrescription(
      req.body?.chronotype,
      req.body?.wakeTime,
      req.body?.sleepTime,
      req.body?.issues,
      req.body?.userGoal
    );
    res.json({ result: fallbackResponse, source: 'fallback', error: error?.message });
  }
});

function generateRuleBasedPrescription(
  chronotype: string = '곰형',
  wakeTime: string = '07:00',
  sleepTime: string = '23:30',
  issues: string = '만성 피로',
  goal: string = '활력 증진'
) {
  const [wakeH, wakeM] = (wakeTime || '07:00').split(':').map(Number);
  const fmt = (h: number, m: number = 0) => {
    const totalMinutes = ((h * 60 + m) % 1440 + 1440) % 1440;
    const finalH = Math.floor(totalMinutes / 60);
    const finalM = totalMinutes % 60;
    return `${String(finalH).padStart(2, '0')}:${String(finalM).padStart(2, '0')}`;
  };

  const sunTime = fmt(wakeH, wakeM + 15);
  const waterTime = fmt(wakeH, wakeM + 5);
  const breakfastTime = fmt(wakeH + 1, wakeM);
  const deepWorkTime = fmt(wakeH + 3, 0);
  const lunchTime = fmt(wakeH + 5, 30);
  const walkTime = fmt(wakeH + 6, 15);
  const caffeineCutoff = fmt(wakeH + 7, 0);
  const workoutTime = fmt(wakeH + 9, 30);
  const dinnerTime = fmt(wakeH + 11, 30);
  const dimLightTime = fmt(wakeH + 14, 0);

  return `### 🎯 [패턴 진단 요약]
현재 기상 시간(${wakeTime})과 취침 시간(${sleepTime})을 분석한 결과, **${chronotype}** 생체 시계에 맞춰 아침 각성 물질(코르티솔) 분비와 야간 수면 유도 물질(멜라토닌)의 전환 구간을 정밀하게 교정하는 것이 핵심입니다. ${issues ? `'${issues}'` : '피로감'}을 줄이기 위해 기상 직후의 햇빛 노출과 오후 카페인 차단이 가장 우선시됩니다.

---

### ⏰ [맞춤형 24시간 바이오리듬 타임라인]

- **${wakeTime} ~ ${sunTime} [기상 & 햇빛 리셋]**
  - 기상 직후 미온수 350ml를 마셔 밤사이 떨어진 혈류량을 회복하세요.
  - 창문을 열고 15분 이상 자연광을 쬐어 뇌의 시교차상핵(SCN) 생체시계를 리셋합니다.
- **${breakfastTime} [장운동 & 아침 식사]**
  - 단백질 20g 이상(달걀 2알, 그릭요거트, 두유 등)을 포함하여 혈당 급상승을 막는 식사를 하세요.
- **${deepWorkTime} ~ ${lunchTime} [인지력 골든타임]**
  - 뇌의 논리 분석 및 단기 기억 능력이 최고조에 달합니다. 가장 중요한 과업이나 의사결정에 집중하세요.
- **${lunchTime} [점심 식사 & ${walkTime} 식후 15분 걷기]**
  - 식후 15분 산책은 혈당 스파이크를 막고 오후 식곤증을 예방하는 가장 강력한 무기입니다.
- **⚠️ ${caffeineCutoff} [카페인 컷오프 데드라인]**
  - 카페인의 체내 반감기는 5~8시간입니다. 이후에는 카페인 대신 따뜻한 보리차나 루이보스티로 전환하세요.
- **${workoutTime} [운동 골든타임]**
  - 체온과 악력, 심폐 지구력이 최고조에 이르는 시간입니다. 중강도 유산소나 근력 운동을 30~45분 진행하세요.
- **${dinnerTime} [가벼운 저녁 식사]**
  - 취침 3~4시간 전에 식사를 마무리하여 위장관이 수면 중 소화 부담을 덜도록 합니다.
- **${dimLightTime} [멜라토닌 보호 & 디지털 디톡스]**
  - 실내 조명을 주황빛 간접등으로 바꾸고, 스마트폰 블루라이트를 차단하며 4-7-8 이완 호흡을 진행하세요.

---

### ⚡ [오늘 당장 실천할 골든 룰 3가지]
1. **기상 후 30분 이내 햇빛 15분 쬐기** (눈의 망막 세포로 햇볕 신호 전달)
2. **오후 ${caffeineCutoff} 이후 커피 섭취 중단** (숙면 뇌파 보호)
3. **취침 1시간 전 스마트폰 머리맡에서 치우기** (멜라토닌 70% 보존)

---

### 💡 [생체학적 꿀팁 (Chronobiology Insight)]
우리 몸의 세포마다 약 2만 개의 시계 유전자(Clock Genes)가 존재합니다. 이 유전자들은 "빛(눈)"과 "첫 음식 섭취 시간(간/소화기관)"에 맞춰 매일 재설정됩니다. 따라서 주말에도 평일 기상 시간과 ±1시간 이내로 일정한 패턴을 유지하는 것이 생체 시차 증후군(Social Jetlag)을 예방하는 핵심입니다.`;
}

// Dev and Prod setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RhythmCare Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();

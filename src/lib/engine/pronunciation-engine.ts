export type PronunciationBreakdown = {
  overall: number;
  accuracy: number;
  fluency: number;
  completeness: number;
  feedbackAr: string[];
};

function normalize(text: string) {
  return text.toLowerCase().normalize("NFKC").replace(/[^a-zäöüß\s]/g, " ").replace(/\s+/g, " ").trim();
}

function levenshtein(a: string, b: string) {
  const rows = Array.from({ length: a.length + 1 }, (_, i) => Array<number>(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) rows[i][0] = i;
  for (let j = 0; j <= b.length; j++) rows[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) rows[i][j] = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return rows[a.length][b.length];
}

export function scoreTranscriptPronunciation(target: string, transcript: string, durationMs?: number): PronunciationBreakdown {
  const t = normalize(target);
  const r = normalize(transcript);
  if (!t || !r) return { overall: 0, accuracy: 0, fluency: 0, completeness: 0, feedbackAr: ["لم يصل كلام كافٍ للتقييم."] };
  const distance = levenshtein(t, r);
  const accuracy = Math.round(Math.max(0, 1 - distance / Math.max(t.length, r.length)) * 100);
  const targetWords = t.split(" ").filter(Boolean);
  const heardWords = r.split(" ").filter(Boolean);
  const completeness = Math.round(Math.min(1, heardWords.length / Math.max(1, targetWords.length)) * 100);
  let fluency = 85;
  if (durationMs && targetWords.length) {
    const wordsPerMinute = heardWords.length / (durationMs / 60000);
    const deviation = Math.abs(wordsPerMinute - 115);
    fluency = Math.round(Math.max(35, 100 - deviation * .45));
  }
  const overall = Math.round(accuracy * .6 + completeness * .25 + fluency * .15);
  const feedbackAr: string[] = [];
  if (accuracy < 80) feedbackAr.push("أعد الجملة ببطء وركز على الأصوات النهائية والحروف المركبة.");
  if (completeness < 90) feedbackAr.push("هناك كلمات مفقودة؛ استخدم shadowing جملة بجملة.");
  if (fluency < 70) feedbackAr.push("حافظ على إيقاع ثابت بدل التوقف بعد كل كلمة.");
  if (!feedbackAr.length) feedbackAr.push("النطق واضح جدًا. أعد المحاولة بسرعة طبيعية للحفاظ على المستوى.");
  return { overall, accuracy, fluency, completeness, feedbackAr };
}

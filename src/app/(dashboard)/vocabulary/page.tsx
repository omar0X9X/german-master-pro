import { PageScaffold, Metric } from "@/components/PageScaffold";
import { VocabularyLab } from "@/components/features/vocabulary/VocabularyLab";
export default function Page(){return <PageScaffold eyebrow="WORTSCHATZ" title="المفردات" description="بطاقات سياقية عربية/ألمانية مع article والجمع والمثال والنطق."><div className="mb-5 grid gap-4 md:grid-cols-3"><Metric label="كلمات متقنة" value="1,240"/><Metric label="مستحقة اليوم" value="42"/><Metric label="دقة آخر 7 أيام" value="86%"/></div><VocabularyLab/></PageScaffold>}

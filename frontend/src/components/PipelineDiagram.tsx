import type { ReactNode } from "react";
import { DocIcon, LayersIcon, NetworkIcon, SparkIcon, TagIcon } from "./Icons";

function Node({ children, tone = "plain", icon, mono }: { children: ReactNode; tone?: "plain" | "navy" | "accent"; icon?: ReactNode; mono?: boolean }) {
  const tones = {
    plain: "bg-white border-line text-ink",
    navy: "bg-navy border-navy text-white",
    accent: "bg-accent-soft border-[#c9ddf6] text-ink",
  };
  return (
    <div className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-[13px] font-medium shadow-sm ${tones[tone]} ${mono ? "font-mono text-[12px]" : ""}`}>
      {icon}
      {children}
    </div>
  );
}

const VLine = ({ h = "h-5" }: { h?: string }) => <div className={`mx-auto w-px ${h} bg-[#b8c4d4]`} />;

function Fork({ merge = false }: { merge?: boolean }) {
  const d = merge ? "M25 0 V10 H75 V0 M50 10 V20" : "M50 0 V10 M25 20 V10 H75 V20";
  return (
    <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="block h-6 w-full">
      <path d={d} fill="none" stroke="#b8c4d4" strokeWidth="1" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function Branch({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-[#c7d2e0] bg-canvas/60 px-4 pb-4 pt-3">
      <div className="mb-3 text-center">
        <div className="eyebrow">{title}</div>
        <div className="text-[11px] text-ink-3">{subtitle}</div>
      </div>
      {children}
    </div>
  );
}

export default function PipelineDiagram() {
  const ic = "h-4 w-4 text-accent";
  return (
    <div className="mx-auto max-w-3xl text-center">
      <Node tone="navy" icon={<DocIcon className="h-4 w-4 text-[#7cc4f0]" />}>Kazakh / Russian News</Node>
      <VLine />
      <Node icon={<SparkIcon className={ic} />}>Text Cleaning</Node>
      <div className="mt-1 text-[11px] text-ink-3">Removes URLs, HTML, e-mails, digits &amp; punctuation · keeps Russian + Kazakh Cyrillic · lower-case</div>
      <Fork />
      <div className="grid grid-cols-2 gap-5">
        <Branch title="Traditional ML" subtitle="scikit-learn · XGBoost">
          <Node tone="accent" icon={<LayersIcon className={ic} />}>TF-IDF</Node>
          <div className="mt-1 text-[11px] text-ink-3">word 1–2-grams · ≤ 10k features · min_df 2 · sublinear tf</div>
          <VLine h="h-4" />
          <div className="grid w-full grid-cols-2 gap-2">
            {["Logistic Regression", "Linear SVM", "Random Forest", "XGBoost"].map((m) => (
              <div key={m} className="rounded-md border border-line bg-white px-2 py-1.5 text-[12px] font-medium text-ink-2">{m}</div>
            ))}
          </div>
        </Branch>
        <Branch title="Transformer" subtitle="PyTorch · Hugging Face">
          <Node tone="accent" icon={<NetworkIcon className={ic} />}>mBERT Tokenizer</Node>
          <div className="mt-1 text-[11px] text-ink-3">WordPiece · max length 256</div>
          <VLine h="h-4" />
          <Node mono>bert-base-multilingual-cased</Node>
          <VLine h="h-4" />
          <Node>Sequence Classification</Node>
          <div className="mt-1 text-[11px] text-ink-3">3 epochs · lr 2e-5 · batch 8</div>
        </Branch>
      </div>
      <Fork merge />
      <div className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 shadow-sm">
        <TagIcon className="h-4 w-4 text-ink-3" />
        <span className="rounded-md bg-real-soft px-2 py-0.5 text-xs font-semibold text-real">REAL&nbsp;=&nbsp;0</span>
        <span className="text-ink-3">/</span>
        <span className="rounded-md bg-fake-soft px-2 py-0.5 text-xs font-semibold text-fake">FAKE&nbsp;=&nbsp;1</span>
      </div>
    </div>
  );
}

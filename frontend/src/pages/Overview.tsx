import type { ReactNode } from "react";
import PerformanceChart from "../components/PerformanceChart";
import PipelineDiagram from "../components/PipelineDiagram";
import { ArrowRight, ChartIcon, InfoIcon, LanguageIcon, NetworkIcon, SplitIcon, TagIcon } from "../components/Icons";
import { BEST_F1, RESULTS, pct } from "../data/results";

function Section({ id, eyebrow, title, desc, children }: { id?: string; eyebrow: string; title: string; desc?: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20">
      <div className="mb-5">
        <div className="eyebrow mb-1.5">{eyebrow}</div>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {desc && <p className="mt-1 text-sm text-ink-2">{desc}</p>}
      </div>
      {children}
    </section>
  );
}

const STATS = [
  { value: "5", label: "Models Evaluated", sub: "4 traditional ML + mBERT", icon: NetworkIcon },
  { value: "2", label: "Languages", sub: "Kazakh + Russian", icon: LanguageIcon },
  { value: "2", label: "Classes", sub: "REAL / FAKE", icon: TagIcon },
  { value: "80 / 20", label: "Train / Test Split", sub: "224 / 56 texts · stratified", icon: SplitIcon },
];

function BestBadge() {
  return (
    <span className="ml-2 inline-flex items-center rounded-full border border-[#c9ddf6] bg-accent-soft px-2 py-0.5 text-[10px] font-bold tracking-wider text-accent">
      BEST F1
    </span>
  );
}

function ResultsTable() {
  const metric = (v: number, best: boolean) => (
    <td className={`px-5 py-3.5 text-right text-[13.5px] tabular-nums ${best ? "font-semibold text-ink" : "text-ink-2"}`}>{pct(v)}</td>
  );
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-line bg-canvas/70 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-3">
            <th className="px-5 py-3">Model</th>
            <th className="px-5 py-3">Family</th>
            <th className="px-5 py-3 text-right">Accuracy</th>
            <th className="px-5 py-3 text-right">Precision</th>
            <th className="px-5 py-3 text-right">Recall</th>
            <th className="px-5 py-3 text-right">F1</th>
          </tr>
        </thead>
        <tbody>
          {RESULTS.map((r) => {
            const best = r.f1 === BEST_F1;
            return (
              <tr key={r.key} className={`border-b border-line last:border-0 ${best ? "bg-[#f5f9fe]" : ""}`}>
                <td className="relative px-5 py-3.5 font-medium">
                  {best && <span className="absolute inset-y-2 left-0 w-[3px] rounded-r bg-accent" />}
                  {r.name}
                  {best && <BestBadge />}
                </td>
                <td className="px-5 py-3.5 text-[13px] text-ink-3">{r.family}</td>
                {metric(r.accuracy, best)}
                {metric(r.precision, best)}
                {metric(r.recall, best)}
                {metric(r.f1, best)}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="border-t border-line px-5 py-2.5 text-[11px] text-ink-3">
        Precision, recall and F1 computed for the positive class FAKE (= 1). Logistic Regression and mBERT tie on every metric.
      </div>
    </div>
  );
}

function FindingsCard() {
  return (
    <div className="card flex flex-col p-6">
      <div className="eyebrow mb-2">Experimental finding</div>
      <p className="text-[15px] leading-relaxed text-ink">
        <strong>Logistic Regression</strong> and <strong>mBERT</strong> achieved the highest observed performance on the held-out test set, each reaching an
        F1-score of <span className="font-semibold tabular-nums">1.0000</span>. <strong>Linear SVM</strong> followed closely with an F1-score of{" "}
        <span className="font-semibold tabular-nums">0.9825</span>, while Random Forest and XGBoost produced lower results.
      </p>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        {[
          ["Best F1 (tie)", "1.0000", "LogReg · mBERT"],
          ["Runner-up F1", "0.9825", "Linear SVM"],
          ["XGBoost F1", "0.8852", "TF-IDF input"],
          ["Random Forest F1", "0.8657", "recall 1.0000"],
        ].map(([k, v, s]) => (
          <div key={k} className="rounded-lg border border-line bg-canvas/60 px-3 py-2.5">
            <dt className="text-[11px] text-ink-3">{k}</dt>
            <dd className="text-base font-semibold tabular-nums">{v}</dd>
            <dd className="text-[11px] text-ink-3">{s}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-auto pt-5">
        <div className="flex gap-2.5 rounded-lg border border-[#f3dfb3] bg-[#fffaf0] p-3 text-xs leading-relaxed text-[#7a5a12]">
          <InfoIcon className="mt-px h-4 w-4 shrink-0" />
          Results describe this experimental split and should not be interpreted as guaranteed performance on unseen real-world news.
        </div>
      </div>
    </div>
  );
}

export default function Overview() {
  return (
    <>
      <div className="grid-bg border-b border-line bg-gradient-to-b from-white to-canvas">
        <div className="mx-auto max-w-6xl px-6 pb-12 pt-14">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-ink-2 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Comparative machine-learning and transformer-based classification using KazFakeCorpus
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-ink">KazFake Detector</h1>
            <p className="mt-2 text-lg font-medium text-ink-2">Kazakh &amp; Russian News Veracity Classification</p>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-2">
              A comparative study of traditional machine-learning and transformer approaches for REAL/FAKE news classification.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#/demo" className="inline-flex items-center gap-2 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#163a63]">
                Try Live Demo <ArrowRight className="h-4 w-4" />
              </a>
              <button
                onClick={() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-white px-5 py-2.5 text-sm font-semibold text-ink shadow-sm transition hover:border-[#c7d2e0]"
              >
                <ChartIcon className="h-4 w-4 text-accent" /> View Results
              </button>
            </div>
          </div>

          <div className="mt-11 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {STATS.map(({ value, label, sub, icon: Icon }) => (
              <div key={label} className="card flex items-start gap-4 p-5">
                <div className="rounded-lg bg-accent-soft p-2.5 text-accent">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold tracking-tight tabular-nums">{value}</div>
                  <div className="text-sm font-medium text-ink">{label}</div>
                  <div className="text-xs text-ink-3">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-14 px-6 py-12">
        <Section id="results" eyebrow="Results" title="Model Performance" desc="Evaluation on the held-out 20% test split. Highest-F1 models highlighted.">
          <ResultsTable />
          <div className="mt-5 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
            <div className="card p-6">
              <div className="mb-1 text-sm font-semibold">Accuracy vs. F1-score by model</div>
              <PerformanceChart />
            </div>
            <FindingsCard />
          </div>
        </Section>

        <Section eyebrow="Methodology" title="Model Architecture & Pipeline" desc="Both branches share the same cleaning step and the same stratified train/test split.">
          <div className="card px-6 py-8">
            <PipelineDiagram />
          </div>
        </Section>
      </div>
    </>
  );
}

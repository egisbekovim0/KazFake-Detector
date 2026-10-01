import { useEffect, useMemo, useRef, useState } from "react";
import { CheckIcon, DocIcon, InfoIcon, LayersIcon, NetworkIcon, WarnIcon } from "../components/Icons";
import { EXAMPLES, type Label } from "../data/examples";
import { MODEL_ORDER, RESULTS } from "../data/results";
import { detectMode, predictDemo, predictLive, PredictError, type Mode, type PredictResponse } from "../lib/api";

const MIN_LOADING_MS = 650;

function VerdictPill({ label, size = "md" }: { label: Label; size?: "md" | "lg" }) {
  const real = label === "REAL";
  const Icon = real ? CheckIcon : WarnIcon;
  const cls = real ? "bg-real-soft text-real border-real-line" : "bg-fake-soft text-fake border-fake-line";
  return size === "lg" ? (
    <span className={`inline-flex items-center gap-2.5 rounded-xl border px-4 py-2 text-3xl font-bold tracking-tight ${cls}`}>
      <Icon className="h-7 w-7" />
      {label}
    </span>
  ) : (
    <span className={`inline-flex w-[88px] items-center justify-center gap-1.5 rounded-lg border py-1.5 text-[13px] font-bold tracking-wide ${cls}`}>
      <Icon className="h-4 w-4" />
      {label}
    </span>
  );
}

function ModeBadge({ mode }: { mode: Mode }) {
  if (mode.kind === "checking") return <span className="text-xs text-ink-3">Connecting to inference API…</span>;
  if (mode.kind === "live") {
    const loaded = Object.values(mode.models).filter(Boolean).length;
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-real-line bg-real-soft px-3 py-1 text-xs font-medium text-real">
        <span className="h-1.5 w-1.5 rounded-full bg-real" /> Live inference · {loaded}/5 trained models loaded
      </span>
    );
  }
  const why = { forced: "VITE_DEMO_MODE=true", offline: "backend not reachable", "no-models": "no model artifacts on backend" }[mode.reason];
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#f3dfb3] bg-[#fffaf0] px-3 py-1 text-xs font-medium text-[#7a5a12]" title={why}>
      <span className="h-1.5 w-1.5 rounded-full bg-[#d99a00]" /> Demo mode · pre-recorded outputs for examples ({why})
    </span>
  );
}

function ConsensusCard({ result }: { result: PredictResponse }) {
  const { consensus, votes, models_used: used, agreement } = result;
  const majority = consensus ? votes[consensus] : Math.max(votes.REAL, votes.FAKE);
  return (
    <div className="card fade-up overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-6 p-6">
        <div>
          <div className="eyebrow mb-3">Overall prediction</div>
          {consensus ? (
            <VerdictPill label={consensus} size="lg" />
          ) : (
            <span className="text-3xl font-bold text-ink-2">No majority</span>
          )}
          <p className="mt-3 text-sm text-ink-2">
            {consensus ? (
              <>
                <strong className="text-ink">{majority} of {used}</strong> models classify this article as <strong className="text-ink">{consensus}</strong>
              </>
            ) : (
              <>Models are split {votes.REAL}–{votes.FAKE}</>
            )}
          </p>
        </div>
        <div className="min-w-[220px]">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-medium text-ink-3">Model agreement</span>
            <span className="text-2xl font-bold tabular-nums">{Math.round(agreement * 100)}%</span>
          </div>
          <div className="mt-2 flex gap-1.5">
            {MODEL_ORDER.map((key) => {
              const p = result.predictions[key];
              const color = !p ? "bg-line" : p === "REAL" ? "bg-real" : "bg-fake";
              return <div key={key} className={`h-2.5 flex-1 rounded-full ${color} ${p && consensus && p !== consensus ? "opacity-45" : ""}`} title={`${key}: ${p ?? "not loaded"}`} />;
            })}
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-ink-3">
            <span>REAL {votes.REAL}</span>
            <span>FAKE {votes.FAKE}</span>
          </div>
        </div>
      </div>
      <div className="flex items-start gap-2 border-t border-line bg-canvas/60 px-6 py-2.5 text-[11px] text-ink-3">
        <InfoIcon className="mt-px h-3.5 w-3.5 shrink-0" />
        Simple majority vote shown as a UI summary; it was not trained or evaluated as a separate model. Agreement = models agreeing with the majority ÷ models run.
      </div>
    </div>
  );
}

function ModelRow({ index, prediction, loading }: { index: number; prediction?: Label | null; loading: boolean }) {
  const r = RESULTS[index];
  const Icon = r.family === "Transformer" ? NetworkIcon : LayersIcon;
  return (
    <div className="flex items-center gap-4 px-5 py-3.5">
      <div className={`rounded-lg p-2 ${r.family === "Transformer" ? "bg-[#eef0fb] text-[#4a3aa7]" : "bg-accent-soft text-accent"}`}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold">{r.name}</div>
        <div className="text-[11px] text-ink-3">
          {r.family} · {r.input} · test F1 <span className="tabular-nums">{r.f1.toFixed(4)}</span>
        </div>
      </div>
      {loading ? (
        <div className="pulse-bar h-8 w-[88px] rounded-lg bg-line" />
      ) : prediction ? (
        <VerdictPill label={prediction} />
      ) : prediction === null ? (
        <span className="w-[88px] text-center text-[11px] text-ink-3">not loaded</span>
      ) : (
        <span className="w-[88px] rounded-lg border border-dashed border-line py-1.5 text-center text-xs text-ink-3">—</span>
      )}
    </div>
  );
}

export default function LiveDemo() {
  const [mode, setMode] = useState<Mode>({ kind: "checking" });
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    detectMode().then(setMode);
  }, []);

  const example = useMemo(() => EXAMPLES.find((e) => e.text === text.trim()), [text]);

  // e.g. #/demo?example=kz-real&run=1
  const autorun = useRef(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split("?")[1] ?? "");
    const ex = EXAMPLES.find((e) => e.id === params.get("example"));
    if (ex) {
      setText(ex.text);
      autorun.current = params.get("run") === "1";
    }
  }, []);
  useEffect(() => {
    if (autorun.current && mode.kind !== "checking" && text) {
      autorun.current = false;
      analyze();
    }
  });

  const analyze = async () => {
    if (!text.trim() || loading || mode.kind === "checking") return;
    setLoading(true);
    setError(null);
    setResult(null);
    const started = Date.now();
    try {
      const res = mode.kind === "live" ? await predictLive(text) : predictDemo(text);
      await new Promise((r) => setTimeout(r, Math.max(0, MIN_LOADING_MS - (Date.now() - started))));
      setResult(res);
    } catch (e) {
      setError(e instanceof PredictError ? e.message : "Could not reach the inference API.");
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setText("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="grid-bg">
      <div className="mx-auto max-w-6xl px-6 pb-14 pt-10">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="eyebrow mb-1.5">Live Demo</div>
            <h1 className="text-3xl font-bold tracking-tight">News Veracity Detector</h1>
            <p className="mt-1.5 text-[15px] text-ink-2">Enter a Kazakh or Russian news text and compare predictions across the five classifiers.</p>
          </div>
          <ModeBadge mode={mode} />
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
          <div className="card p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <DocIcon className="h-4.5 w-4.5 text-accent" /> News text
            </div>
            <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => {
                    setText(ex.text);
                    setResult(null);
                    setError(null);
                  }}
                  className={`cursor-pointer whitespace-nowrap rounded-full border px-2 py-1 text-[11.5px] font-medium transition ${
                    example?.id === ex.id ? "border-accent bg-accent-soft text-accent" : "border-line bg-white text-ink-2 hover:border-[#c7d2e0] hover:text-ink"
                  }`}
                >
                  {ex.chip}
                </button>
              ))}
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) analyze();
              }}
              placeholder={"Қазақстан немесе Ресей жаңалығының мәтінін енгізіңіз...\nВведите текст новости на казахском или русском языке..."}
              className="h-64 w-full resize-none rounded-xl border border-line bg-canvas/50 p-4 text-[14px] leading-relaxed text-ink outline-none transition placeholder:text-ink-3 focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/10"
            />
            <div className="mt-2 flex items-center justify-between gap-4 text-[11px] text-ink-3">
              <span>
                {example ? (
                  <>
                    KazFakeCorpus test-split sample · {example.source} · label{" "}
                    <strong className={example.label === "REAL" ? "text-real" : "text-fake"}>{example.label}</strong>
                  </>
                ) : (
                  "Ctrl + Enter to analyze"
                )}
              </span>
              <span className="shrink-0 font-mono tabular-nums">{text.length.toLocaleString()} chars</span>
            </div>
            <div className="mt-4 flex gap-3">
              <button onClick={clear} disabled={!text && !result} className="cursor-pointer rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink-2 transition hover:text-ink disabled:cursor-default disabled:opacity-50">
                Clear
              </button>
              <button
                onClick={analyze}
                disabled={!text.trim() || loading || mode.kind === "checking"}
                className="flex-1 cursor-pointer rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#163a63] disabled:cursor-default disabled:opacity-50"
              >
                {loading ? "Analyzing…" : "Analyze News"}
              </button>
            </div>
            <p className="mt-4 border-t border-line pt-3 text-[11px] leading-relaxed text-ink-3">
              Classifiers reproduce patterns learned from KazFakeCorpus. They do not search external sources or verify factual claims, and they output a label only — no calibrated confidence.
            </p>
          </div>

          <div className="space-y-5">
            {error && (
              <div className="fade-up flex gap-2.5 rounded-xl border border-fake-line bg-fake-soft p-4 text-sm text-fake">
                <WarnIcon className="mt-0.5 h-4 w-4 shrink-0" /> {error}
              </div>
            )}
            {result ? (
              <ConsensusCard result={result} />
            ) : (
              <div className="card flex items-center gap-4 p-6">
                <div className={`rounded-xl bg-accent-soft p-3 text-accent ${loading ? "pulse-bar" : ""}`}>
                  <NetworkIcon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{loading ? "Running five classifiers…" : "Overall prediction"}</div>
                  <div className="text-xs text-ink-3">
                    {loading ? "Cleaning text · TF-IDF features · mBERT tokenization" : "Choose an example or paste a news text, then press Analyze News."}
                  </div>
                </div>
              </div>
            )}
            <div className="card">
              <div className="flex items-center justify-between border-b border-line px-5 py-3">
                <span className="text-sm font-semibold">Classification Results</span>
                <span className="text-[11px] text-ink-3">REAL = 0 · FAKE = 1</span>
              </div>
              <div className="divide-y divide-line">
                {MODEL_ORDER.map((key, i) => (
                  <ModelRow key={key} index={i} loading={loading} prediction={result ? result.predictions[key] : undefined} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import type { Label } from "../data/examples";
import type { ModelKey } from "../data/results";
import { DEMO_FIXTURES } from "./demoFixtures";

export interface PredictResponse {
  predictions: Record<ModelKey, Label | null>; // null = model artifact not loaded
  consensus: Label | null; // null = tie
  agreement: number;
  votes: Record<Label, number>;
  models_used: number;
}

export type Mode =
  | { kind: "checking" }
  | { kind: "live"; models: Record<ModelKey, boolean> }
  | { kind: "demo"; reason: "forced" | "offline" | "no-models" };

export const DEMO_FORCED = import.meta.env.VITE_DEMO_MODE === "true";

export async function detectMode(): Promise<Mode> {
  if (DEMO_FORCED) return { kind: "demo", reason: "forced" };
  try {
    const res = await fetch("/api/health");
    if (!res.ok) return { kind: "demo", reason: "offline" };
    const body = (await res.json()) as { ready: boolean; models: Record<ModelKey, boolean> };
    return body.ready ? { kind: "live", models: body.models } : { kind: "demo", reason: "no-models" };
  } catch {
    return { kind: "demo", reason: "offline" };
  }
}

export class PredictError extends Error {}

export async function predictLive(text: string): Promise<PredictResponse> {
  const res = await fetch("/api/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    throw new PredictError(typeof detail?.detail === "string" ? detail.detail : `Request failed (${res.status}).`);
  }
  return res.json();
}

export function predictDemo(text: string): PredictResponse {
  const fixture = DEMO_FIXTURES.find((f) => f.text.trim() === text.trim());
  if (!fixture) {
    throw new PredictError(
      "Demo mode only covers the predefined examples. Start the FastAPI backend with trained models to classify custom text.",
    );
  }
  return fixture.response;
}

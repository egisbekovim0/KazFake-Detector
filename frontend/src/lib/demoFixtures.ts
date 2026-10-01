// Recorded API responses for the built-in examples, used in demo mode
import { EXAMPLES } from "../data/examples";
import type { PredictResponse } from "./api";

export interface DemoFixture {
  exampleId: string;
  text: string;
  response: PredictResponse;
}

const RECORDED: Record<string, PredictResponse> = {
  "kz-real": {
    predictions: { logistic_regression: "REAL", linear_svm: "REAL", random_forest: "FAKE", xgboost: "FAKE", mbert: "REAL" },
    consensus: "REAL",
    agreement: 0.6,
    votes: { REAL: 3, FAKE: 2 },
    models_used: 5,
  },
  "kz-fake": {
    predictions: { logistic_regression: "FAKE", linear_svm: "FAKE", random_forest: "FAKE", xgboost: "FAKE", mbert: "FAKE" },
    consensus: "FAKE",
    agreement: 1.0,
    votes: { REAL: 0, FAKE: 5 },
    models_used: 5,
  },
  "ru-real": {
    predictions: { logistic_regression: "REAL", linear_svm: "REAL", random_forest: "REAL", xgboost: "REAL", mbert: "REAL" },
    consensus: "REAL",
    agreement: 1.0,
    votes: { REAL: 5, FAKE: 0 },
    models_used: 5,
  },
  "ru-fake": {
    predictions: { logistic_regression: "FAKE", linear_svm: "FAKE", random_forest: "FAKE", xgboost: "FAKE", mbert: "FAKE" },
    consensus: "FAKE",
    agreement: 1.0,
    votes: { REAL: 0, FAKE: 5 },
    models_used: 5,
  },
};

export const DEMO_FIXTURES: DemoFixture[] = EXAMPLES.filter((e) => RECORDED[e.id]).map((e) => ({
  exampleId: e.id,
  text: e.text,
  response: RECORDED[e.id],
}));

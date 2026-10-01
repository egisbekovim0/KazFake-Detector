
export type ModelKey = "logistic_regression" | "linear_svm" | "random_forest" | "xgboost" | "mbert";

export interface ModelResult {
  key: ModelKey;
  name: string;
  short: string;
  family: "Traditional ML" | "Transformer";
  input: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
}

export const RESULTS: ModelResult[] = [
  { key: "logistic_regression", name: "Logistic Regression", short: "LogReg", family: "Traditional ML", input: "TF-IDF", accuracy: 1.0, precision: 1.0, recall: 1.0, f1: 1.0 },
  { key: "linear_svm", name: "Linear SVM", short: "Lin. SVM", family: "Traditional ML", input: "TF-IDF", accuracy: 0.9821, precision: 1.0, recall: 0.9655, f1: 0.9825 },
  { key: "random_forest", name: "Random Forest", short: "Rand. Forest", family: "Traditional ML", input: "TF-IDF", accuracy: 0.8393, precision: 0.7632, recall: 1.0, f1: 0.8657 },
  { key: "xgboost", name: "XGBoost", short: "XGBoost", family: "Traditional ML", input: "TF-IDF", accuracy: 0.875, precision: 0.8438, recall: 0.931, f1: 0.8852 },
  { key: "mbert", name: "mBERT", short: "mBERT", family: "Transformer", input: "WordPiece tokens", accuracy: 1.0, precision: 1.0, recall: 1.0, f1: 1.0 },
];

export const BEST_F1 = Math.max(...RESULTS.map((r) => r.f1));

export const MODEL_ORDER: ModelKey[] = RESULTS.map((r) => r.key);
export const MODEL_NAME: Record<ModelKey, string> = Object.fromEntries(
  RESULTS.map((r) => [r.key, r.name]),
) as Record<ModelKey, string>;

export const pct = (v: number) => `${(v * 100).toFixed(2)}%`;

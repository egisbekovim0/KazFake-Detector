"""Loads the saved models and runs all five classifiers on a text."""
from __future__ import annotations

import logging
import os
from collections import Counter
from pathlib import Path

import joblib

from preprocessing import MIN_CLEAN_LENGTH, clean_bilingual_text

log = logging.getLogger("kazfake")

MODEL_DIR = Path(os.environ.get("KAZFAKE_ARTIFACT_DIR", Path(__file__).resolve().parent / "models"))

LABELS = {0: "REAL", 1: "FAKE"}

CLASSICAL_MODELS = {
    "logistic_regression": "logistic_regression.joblib",
    "linear_svm": "linear_svm.joblib",
    "random_forest": "random_forest.joblib",
    "xgboost": "xgboost.joblib",
}
MODEL_KEYS = [*CLASSICAL_MODELS, "mbert"]

MBERT_MAX_LENGTH = 256


class TextTooShortError(ValueError):
    pass


class Classifiers:
    def __init__(self, model_dir: Path = MODEL_DIR):
        self.model_dir = model_dir
        self.vectorizer = None
        self.classical: dict = {}
        self.mbert = None
        self.tokenizer = None
        self._load()

    def _load(self) -> None:
        vec_path = self.model_dir / "tfidf_vectorizer.joblib"
        if vec_path.exists():
            self.vectorizer = joblib.load(vec_path)
            for key, filename in CLASSICAL_MODELS.items():
                path = self.model_dir / filename
                if path.exists():
                    self.classical[key] = joblib.load(path)
                else:
                    log.warning("Missing %s", path)
        else:
            log.warning("Missing %s - TF-IDF models disabled", vec_path)

        mbert_dir = self.model_dir / "mbert"
        if (mbert_dir / "config.json").exists():
            import torch
            from transformers import AutoModelForSequenceClassification, AutoTokenizer

            self._torch = torch
            self.tokenizer = AutoTokenizer.from_pretrained(mbert_dir)
            self.mbert = AutoModelForSequenceClassification.from_pretrained(mbert_dir)
            self.mbert.eval()
        else:
            log.warning("Missing fine-tuned mBERT in %s - mBERT disabled", mbert_dir)

    def status(self) -> dict[str, bool]:
        return {key: (key in self.classical) if key != "mbert" else self.mbert is not None for key in MODEL_KEYS}

    def predict(self, text: str) -> dict:
        clean = clean_bilingual_text(text)
        if len(clean) <= MIN_CLEAN_LENGTH:
            raise TextTooShortError(
                "After cleaning, the text has too little Kazakh/Russian Cyrillic content to classify."
            )

        predictions: dict[str, str | None] = {key: None for key in MODEL_KEYS}

        if self.classical:
            features = self.vectorizer.transform([clean])
            for key, model in self.classical.items():
                predictions[key] = LABELS[int(model.predict(features)[0])]

        if self.mbert is not None:
            inputs = self.tokenizer(clean, truncation=True, max_length=MBERT_MAX_LENGTH, return_tensors="pt")
            with self._torch.no_grad():
                logits = self.mbert(**inputs).logits
            predictions["mbert"] = LABELS[int(logits.argmax(dim=-1).item())]

        # Majority vote
        votes = Counter(label for label in predictions.values() if label is not None)
        used = sum(votes.values())
        top = votes.most_common()
        if not top or (len(top) > 1 and top[0][1] == top[1][1]):
            consensus, agreement = None, (0.5 if top else 0.0)
        else:
            consensus, agreement = top[0][0], top[0][1] / used

        return {
            "predictions": predictions,
            "consensus": consensus,
            "agreement": round(agreement, 4),
            "votes": {"REAL": votes.get("REAL", 0), "FAKE": votes.get("FAKE", 0)},
            "models_used": used,
        }

# ==============================================================================
# PIPELINE: KazFakeCorpus Classification (Kazakh & Russian)
# Models: Logistic Regression, Linear SVM, Random Forest, XGBoost
# ==============================================================================

# 1. Setup & Dependencies
# Run in bash/terminal if not installed:
# !pip install pandas numpy scikit-learn xgboost matplotlib seaborn openpyxl gitpython

import os
import re
import glob
import subprocess
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, classification_report, confusion_matrix

# Set visualization styles
sns.set_theme(style="whitegrid")
plt.rcParams.update({'font.size': 11, 'figure.autolayout': True})

# ------------------------------------------------------------------------------
# 2. Dataset Retrieval & Loading
# ------------------------------------------------------------------------------
REPO_URL = "https://github.com/Anargul-Aimuratovna/news-veracity-corpus.git"
REPO_DIR = "news-veracity-corpus"

if not os.path.exists(REPO_DIR):
    print(f"Cloning repository from {REPO_URL}...")
    subprocess.run(["git", "clone", REPO_URL], check=True)
else:
    print(f"Directory '{REPO_DIR}' already exists.")

# Discover available dataset files (.csv, .xlsx, .json)
all_files = glob.glob(f"{REPO_DIR}/**", recursive=True)
data_files = [f for f in all_files if f.endswith(('.csv', '.xlsx', '.json', '.tsv')) and not os.path.isdir(f)]
print(f"Found data files in repo: {data_files}")

# Helper to locate and load the corpus
def load_kazfake_corpus(repo_path):
    df_list = []
    for f in data_files:
        try:
            if f.endswith('.csv'):
                temp_df = pd.read_csv(f)
            elif f.endswith('.xlsx'):
                temp_df = pd.read_excel(f)
            elif f.endswith('.json'):
                temp_df = pd.read_json(f)
            df_list.append(temp_df)
        except Exception as e:
            continue

    if df_list:
        combined = pd.concat(df_list, ignore_index=True)
        return combined
    return None

df = load_kazfake_corpus(REPO_DIR)

# Fallback: inspect and normalize column names (texts and labels)
# Expected text columns: 'text', 'content', 'news_text', 'news'
# Expected label columns: 'label', 'veracity', 'REAL_or_FAKE', 'class'
def standardize_dataframe(df):
    text_col = None
    label_col = None

    for c in df.columns:
        if str(c).lower() in ['text', 'content', 'news_text', 'news', 'title_text', 'message']:
            text_col = c
            break
    for c in df.columns:
        if str(c).lower() in ['label', 'veracity', 'real_or_fake', 'class', 'target']:
            label_col = c
            break

    if not text_col or not label_col:
        # If columns cannot be auto-detected, print columns to assist
        raise ValueError(f"Could not automatically detect columns. Found: {df.columns.tolist()}")

    df = df[[text_col, label_col]].dropna().copy()
    df.rename(columns={text_col: 'text', label_col: 'label'}, inplace=True)

    # Standardize label mapping (REAL: 0, FAKE: 1)
    df['label'] = df['label'].astype(str).str.strip().str.upper()
    df = df[df['label'].isin(['REAL', 'FAKE', '0', '1', 'TRUE'])]
    df['target'] = df['label'].apply(lambda x: 1 if x in ['FAKE', '1'] else 0)
    return df

df = standardize_dataframe(df)
print(f"Successfully loaded {len(df)} samples.")
print(f"Class distribution:\n{df['label'].value_counts()}")

# ------------------------------------------------------------------------------
# 3. Text Preprocessing (Kazakh & Russian Cyrllic Support)
# ------------------------------------------------------------------------------
def clean_bilingual_text(text: str) -> str:
    """Cleans text preserving Kazakh specific characters (ә, ғ, қ, ң, ө, ұ, ү, h, і) and Russian Cyrillic."""
    text = str(text)
    # Remove URLs and hyperlinks
    text = re.sub(r'https?://\S+|www\.\S+', ' ', text)
    # Remove HTML tags
    text = re.sub(r'<.*?>', ' ', text)
    # Remove mentions, tags, emails
    text = re.sub(r'[\w\.-]+@[\w\.-]+', ' ', text)
    # Keep Cyrillic characters (Russian + Kazakh extensions) and remove digits/special characters
    text = re.sub(r'[^а-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\s]', ' ', text)
    # Lowercase & collapse whitespaces
    text = text.lower().strip()
    text = re.sub(r'\s+', ' ', text)
    return text

print("Running text normalization...")
df['clean_text'] = df['text'].apply(clean_bilingual_text)
df = df[df['clean_text'].str.len() > 10].reset_index(drop=True)

# ------------------------------------------------------------------------------
# 4. Feature Extraction & Train-Test Split
# ------------------------------------------------------------------------------
X_train, X_test, y_train, y_test = train_test_split(
    df['clean_text'],
    df['target'],
    test_size=0.20,
    random_state=42,
    stratify=df['target']
)

# Bilingual Word-level TF-IDF (capturing unigrams and bigrams)
vectorizer = TfidfVectorizer(
    ngram_range=(1, 2),
    max_features=10000,
    min_df=2,
    sublinear_tf=True
)

X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)
print(f"Vocabulary size: {X_train_vec.shape[1]} features.")

# ------------------------------------------------------------------------------
# 5. Model Training & Evaluation
# ------------------------------------------------------------------------------
models = {
    "Logistic Regression": LogisticRegression(C=1.0, max_iter=1000, random_state=42),
    "Support Vector Machine (Linear SVC)": LinearSVC(C=1.0, random_state=42),
    "Random Forest": RandomForestClassifier(n_estimators=200, max_depth=25, random_state=42, n_jobs=-1),
    "XGBoost": XGBClassifier(n_estimators=200, learning_rate=0.1, max_depth=6, eval_metric='logloss', random_state=42, n_jobs=-1)
}

results = []
predictions = {}

for name, model in models.items():
    print(f"Training {name}...")
    model.fit(X_train_vec, y_train)
    y_pred = model.predict(X_test_vec)
    predictions[name] = y_pred

    acc = accuracy_score(y_test, y_pred)
    prec, rec, f1, _ = precision_recall_fscore_support(y_test, y_pred, average='binary', pos_label=1)

    results.append({
        "Модель": name,
        "Accuracy": round(acc, 4),
        "Precision": round(prec, 4),
        "Recall": round(rec, 4),
        "F1": round(f1, 4)
    })

# ------------------------------------------------------------------------------
# 5.1 Transformer Baseline — Multilingual BERT (mBERT)
# ------------------------------------------------------------------------------
# Install once if needed:
# !pip install transformers datasets accelerate torch

import torch
from torch.utils.data import Dataset
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    Trainer,
    TrainingArguments
)

TRANSFORMER_MODEL = "bert-base-multilingual-cased"

print(f"\nTraining Transformer baseline: {TRANSFORMER_MODEL}...")

# Load tokenizer
tokenizer = AutoTokenizer.from_pretrained(TRANSFORMER_MODEL)


# PyTorch Dataset for Hugging Face Trainer
class NewsDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_length=256):
        self.encodings = tokenizer(
            texts.tolist(),
            truncation=True,
            padding=True,
            max_length=max_length
        )
        self.labels = labels.tolist()

    def __getitem__(self, idx):
        item = {
            key: torch.tensor(val[idx])
            for key, val in self.encodings.items()
        }
        item["labels"] = torch.tensor(self.labels[idx], dtype=torch.long)
        return item

    def __len__(self):
        return len(self.labels)


train_dataset = NewsDataset(
    X_train.reset_index(drop=True),
    y_train.reset_index(drop=True),
    tokenizer
)

test_dataset = NewsDataset(
    X_test.reset_index(drop=True),
    y_test.reset_index(drop=True),
    tokenizer
)


# Binary classification: REAL = 0, FAKE = 1
bert_model = AutoModelForSequenceClassification.from_pretrained(
    TRANSFORMER_MODEL,
    num_labels=2
)


training_args = TrainingArguments(
    output_dir="./mbert_results",
    num_train_epochs=3,
    per_device_train_batch_size=8,
    per_device_eval_batch_size=16,
    learning_rate=2e-5,
    weight_decay=0.01,
    logging_steps=50,
    save_strategy="no",
    report_to="none",
    seed=42
)


trainer = Trainer(
    model=bert_model,
    args=training_args,
    train_dataset=train_dataset
)


# Fine-tune mBERT
trainer.train()


# Predictions on exactly the same test split
bert_output = trainer.predict(test_dataset)
bert_pred = np.argmax(bert_output.predictions, axis=1)

bert_name = "mBERT"

predictions[bert_name] = bert_pred


# Calculate the same metrics used for the classical models
acc = accuracy_score(y_test, bert_pred)

prec, rec, f1, _ = precision_recall_fscore_support(
    y_test,
    bert_pred,
    average="binary",
    pos_label=1,
    zero_division=0
)

results.append({
    "Модель": bert_name,
    "Accuracy": round(acc, 4),
    "Precision": round(prec, 4),
    "Recall": round(rec, 4),
    "F1": round(f1, 4)
})

print("\nmBERT results:")
print(f"Accuracy : {acc:.4f}")
print(f"Precision: {prec:.4f}")
print(f"Recall   : {rec:.4f}")
print(f"F1       : {f1:.4f}")

results_df = pd.DataFrame(results)
print("\n" + "="*50)
print("3.1 Сводная таблица результатов классификации:")
print("="*50)
print(results_df.to_markdown(index=False))

# ------------------------------------------------------------------------------
# 5.2 Save Trained Models
# ------------------------------------------------------------------------------
import json
import joblib
from pathlib import Path

ARTIFACT_DIR = Path(os.environ.get(
    "KAZFAKE_ARTIFACT_DIR",
    Path(__file__).resolve().parents[1] / "backend" / "models"
))
ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)

joblib.dump(vectorizer, ARTIFACT_DIR / "tfidf_vectorizer.joblib")
joblib.dump(models["Logistic Regression"], ARTIFACT_DIR / "logistic_regression.joblib")
joblib.dump(models["Support Vector Machine (Linear SVC)"], ARTIFACT_DIR / "linear_svm.joblib")
joblib.dump(models["Random Forest"], ARTIFACT_DIR / "random_forest.joblib")
joblib.dump(models["XGBoost"], ARTIFACT_DIR / "xgboost.joblib")

trainer.save_model(str(ARTIFACT_DIR / "mbert"))
tokenizer.save_pretrained(str(ARTIFACT_DIR / "mbert"))

with open(ARTIFACT_DIR / "run_metrics.json", "w", encoding="utf-8") as fh:
    json.dump(results, fh, ensure_ascii=False, indent=2)
with open(ARTIFACT_DIR / "test_split.json", "w", encoding="utf-8") as fh:
    json.dump([
        {"text": df.loc[i, "text"], "label": "FAKE" if t == 1 else "REAL"}
        for i, t in zip(X_test.index, y_test)
    ], fh, ensure_ascii=False, indent=2)

print(f"\nSaved model artifacts to {ARTIFACT_DIR}")

# ------------------------------------------------------------------------------
# 6. Visualization & Error Analysis
# ------------------------------------------------------------------------------
# Figure 1: Model Comparison (Accuracy vs F1-score)
fig, ax = plt.subplots(figsize=(8, 4.5))
x = np.arange(len(results_df))
width = 0.35

rects1 = ax.bar(x - width/2, results_df['Accuracy'], width, label='Accuracy', color='#3470a3')
rects2 = ax.bar(x + width/2, results_df['F1'], width, label='F1-Score', color='#5cb85c')

ax.set_ylabel('Значение метрики')
ax.set_title('Сравнение моделей машинного обучения на KazFakeCorpus')
ax.set_xticks(x)
ax.set_xticklabels(results_df['Модель'], rotation=15, ha='right')
ax.set_ylim(0.70, 1.0)
ax.legend()
plt.tight_layout()
plt.savefig("model_comparison.png", dpi=300)
plt.show()

# Figure 2: Error Analysis - Confusion Matrix for Best Model
best_model_name = results_df.sort_values(by="F1", ascending=False).iloc[0]["Модель"]
cm = confusion_matrix(y_test, predictions[best_model_name])

plt.figure(figsize=(5.5, 4.5))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=['REAL', 'FAKE'],
            yticklabels=['REAL', 'FAKE'])
plt.title(f'Матрица ошибок (Confusion Matrix) — {best_model_name}')
plt.ylabel('Истинный класс')
plt.xlabel('Предсказанный класс')
plt.tight_layout()
plt.savefig("confusion_matrix_best.png", dpi=300)
plt.show()
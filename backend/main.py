import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from inference import Classifiers, TextTooShortError

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="KazFake Detector API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

classifiers = Classifiers()


class PredictRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=20_000)


@app.get("/api/health")
def health():
    models = classifiers.status()
    return {"ready": any(models.values()), "models": models}


@app.post("/api/predict")
def predict(req: PredictRequest):
    if not any(classifiers.status().values()):
        raise HTTPException(503, "No trained model artifacts found in backend/models. Run training/original_pipeline.py.")
    try:
        return classifiers.predict(req.text)
    except TextTooShortError as exc:
        raise HTTPException(422, str(exc)) from exc

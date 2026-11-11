"""Response contracts shared by the API and the web client."""

from typing import Literal

from pydantic import BaseModel

Provider = Literal["mock", "local", "cloud"]


class Box(BaseModel):
    x: float
    y: float
    w: float
    h: float


class Detection(BaseModel):
    id: str
    label: Literal["pothole"]
    confidence: float
    box: Box


class InferenceResult(BaseModel):
    provider: Provider
    model: str
    imageWidth: int
    imageHeight: int
    latencyMs: int
    detections: list[Detection]


class SignPrediction(BaseModel):
    gender: Literal["male", "female"]
    confidence: float


class CompareResult(BaseModel):
    provider: Provider
    model: str
    latencyMs: int
    a: SignPrediction
    b: SignPrediction
    similarity: float


class MatchCandidate(BaseModel):
    id: str
    similarity: float
    prediction: SignPrediction


class MatchResult(BaseModel):
    provider: Provider
    model: str
    latencyMs: int
    query: SignPrediction
    candidates: list[MatchCandidate]
    bestMatchId: str | None

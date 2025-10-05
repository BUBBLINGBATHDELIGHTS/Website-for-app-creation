"""FastAPI microservice that powers Bubbling Bath Delights' AI workflows.

The service wraps OpenAI models to assist the admin portal with
product enrichment, seasonal merchandising, code generation, and
operational insights.  Each endpoint follows a defensive pattern so
that the storefront can gracefully fall back if the OpenAI API is
unavailable.
"""

from __future__ import annotations

import asyncio
import logging
import os
from dataclasses import dataclass
from typing import Any, Dict, List, Optional
import json

from fastapi import Depends, FastAPI, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

try:
    from openai import OpenAI
except ImportError:  # pragma: no cover - dependency provided in production
    OpenAI = None  # type: ignore

LOGGER = logging.getLogger("bubbles.ai")
logging.basicConfig(level=logging.INFO)


@dataclass
class AiConfig:
    api_key: Optional[str]
    model: str
    organization: Optional[str]

    @classmethod
    def from_env(cls) -> "AiConfig":
        return cls(
            api_key=os.getenv("OPENAI_API_KEY"),
            model=os.getenv("OPENAI_MODEL", "gpt-4.1-mini"),
            organization=os.getenv("OPENAI_ORG"),
        )


def get_openai_client(config: AiConfig = Depends(lambda: AiConfig.from_env())) -> Optional[OpenAI]:
    if not config.api_key:
        LOGGER.warning("OPENAI_API_KEY missing – AI features will return curated fallbacks")
        return None

    if OpenAI is None:
        raise HTTPException(status_code=500, detail="openai package is not installed")

    return OpenAI(api_key=config.api_key, organization=config.organization)


class ProductBrief(BaseModel):
    name: str = Field(..., description="Working title supplied by the admin")
    description: str = Field(..., description="Short explanation of the product")
    price: float = Field(..., ge=0, description="Price in USD")
    category: Optional[str] = Field(None, description="Product category handle")
    ingredients: Optional[List[str]] = Field(None, description="Optional list of ingredients")
    tone: str = Field("playful luxury", description="Tone of voice for copy generation")
    seasonal_focus: Optional[str] = Field(None, description="Optional seasonal context such as 'winter' or 'mother's day'")
    image_alt: Optional[str] = Field(None, description="Alt text for the uploaded photo")


class SeasonalPlanRequest(BaseModel):
    season: str = Field(..., description="Season or campaign name")
    inventory_snapshot: List[Dict[str, Any]] = Field(
        default_factory=list, description="Current products, inventory, and performance metrics"
    )
    preferences: Optional[str] = Field(None, description="Optional merchandising preferences")


class CodeInstruction(BaseModel):
    instruction: str = Field(..., description="Natural language instruction from an admin")
    context: Optional[str] = Field(None, description="Optional codebase context or file list")
    target_area: Optional[str] = Field(None, description="Logical area that should be updated")


class OptimizationFeedbackRequest(BaseModel):
    metrics: Dict[str, Any] = Field(default_factory=dict)
    goals: Optional[str] = Field(None)


class OptimizationSuggestion(BaseModel):
    title: str
    description: str
    impact: str
    priority: str
    implementation_outline: str


def ai_enabled(client: Optional[OpenAI]) -> bool:
    return client is not None


async def complete_json_prompt(client: OpenAI, *, model: str, system: str, user: str) -> Dict[str, Any]:
    """Call the OpenAI Responses API and coerce the output into JSON."""

    response = await asyncio.get_event_loop().run_in_executor(
        None,
        lambda: client.responses.create(
            model=model,
            input=[
                {
                    "role": "system",
                    "content": system,
                },
                {
                    "role": "user",
                    "content": user,
                },
            ],
            response_format={"type": "json_object"},
        ),
    )
    message = response.output[0].content[0].text  # type: ignore[index]
    try:
        return json.loads(message)
    except json.JSONDecodeError as exc:  # pragma: no cover - unexpected payload
        LOGGER.warning("OpenAI returned non-JSON payload: %s", exc)
        raise HTTPException(status_code=502, detail="AI response was not valid JSON") from exc


def fallback_product_response(payload: ProductBrief) -> Dict[str, Any]:
    return {
        "status": "fallback",
        "product": {
            "name": payload.name.strip() or "Untitled Soak",
            "seo_title": f"{payload.name.strip()} | Bubbling Bath Delights",
            "seo_description": payload.description.strip(),
            "tags": [payload.category or "bath"],
            "price": payload.price,
            "description": payload.description,
            "highlights": payload.ingredients or ["Handcrafted", "Plant-based"],
            "marketing_copy": "A handcrafted treat for your rituals. Invite luxurious botanicals into every soak.",
        },
        "assets": {
            "alt_text": payload.image_alt or f"Product shot of {payload.name}",
            "promotions": [
                "Limited batch — reserve yours today!",
                "Bundle any 3 for an extra 10% off."
            ],
        },
    }


def fallback_seasonal_response(season: str) -> Dict[str, Any]:
    return {
        "status": "fallback",
        "theme": f"{season.title()} at Bubbling Bath Delights",
        "palette": ["#B8A8EA", "#7FB9A7", "#FAF7F2"],
        "collection_name": f"{season.title()} Rituals",
        "marketing_copy": [
            "Wrap yourself in seasonal comfort with curated botanicals.",
            "Limited-edition fizzers, scrubs, and candles designed for the coziest rituals.",
        ],
        "hero_copy": f"Celebrate {season.title()} with scent-forward serenity.",
    }


def fallback_code_response(instruction: str) -> Dict[str, Any]:
    return {
        "status": "fallback",
        "summary": "AI unavailable; please follow the manual update checklist.",
        "diff": "",
        "notes": [
            "No code changes were generated. Run through the dev checklist and deploy via the CI workflow.",
            f"Original instruction: {instruction}",
        ],
    }


def fallback_optimization_response() -> Dict[str, Any]:
    return {
        "status": "fallback",
        "suggestions": [
            OptimizationSuggestion(
                title="Enable HTTP response caching",
                description="Configure the API gateway to cache catalog requests for 60 seconds during peak traffic.",
                impact="medium",
                priority="high",
                implementation_outline="Use the provided Redis deployment or Vercel Edge middleware to cache /api/products responses.",
            ).dict(),
            OptimizationSuggestion(
                title="Review lighthouse bundle analysis",
                description="Tree-shake unused lucide icons and defer non-critical widgets on the storefront home page.",
                impact="medium",
                priority="medium",
                implementation_outline="Audit bundles via \'npm run analyze\' and split the hero carousel into a lazy chunk.",
            ).dict(),
        ],
    }


app = FastAPI(title="Bubbling Bath Delights AI Service", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("AI_ALLOWED_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/ai/products/generate")
async def generate_product(brief: ProductBrief, client: Optional[OpenAI] = Depends(get_openai_client)) -> Dict[str, Any]:
    if not ai_enabled(client):
        return fallback_product_response(brief)

    try:
        payload = await complete_json_prompt(
            client,
            model=AiConfig.from_env().model,
            system=(
                "You are the merchandising assistant for Bubbling Bath Delights. "
                "Return valid JSON with seo_title, seo_description, tags (array), highlights (array), "
                "marketing_copy (string) and launch_campaign ideas (array)."
            ),
            user=(
                "Create product merchandising content using the following brief:\n"
                f"Name: {brief.name}\n"
                f"Description: {brief.description}\n"
                f"Price: {brief.price}\n"
                f"Category: {brief.category or 'general'}\n"
                f"Ingredients: {', '.join(brief.ingredients or [])}\n"
                f"Tone: {brief.tone}\n"
                f"Seasonal focus: {brief.seasonal_focus or 'none'}"
            ),
        )
    except Exception as exc:  # pragma: no cover - upstream error path
        LOGGER.exception("OpenAI product generation failed")
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return {
        "status": "success",
        "product": {
            "name": brief.name,
            "price": brief.price,
            **payload.get("product", {}),
        },
        "assets": payload.get("assets", {}),
        "campaign": payload.get("launch_campaign", {}),
    }


@app.post("/ai/products/seasonal")
async def seasonal_plan(
    request: SeasonalPlanRequest,
    client: Optional[OpenAI] = Depends(get_openai_client),
) -> Dict[str, Any]:
    if not ai_enabled(client):
        return fallback_seasonal_response(request.season)

    try:
        payload = await complete_json_prompt(
            client,
            model=AiConfig.from_env().model,
            system=(
                "You help a boutique bath company curate seasonal campaigns. "
                "Respond with JSON describing theme, palette (array of hex strings), collection_name, hero_copy, "
                "marketing_copy (array), promotions (array), and layout_directives (array)."
            ),
            user=(
                "Generate a seasonal refresh plan.\n"
                f"Season: {request.season}\n"
                f"Inventory snapshot: {request.inventory_snapshot}\n"
                f"Preferences: {request.preferences or 'none'}"
            ),
        )
    except Exception as exc:  # pragma: no cover - upstream error path
        LOGGER.exception("OpenAI seasonal plan failed")
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return {"status": "success", **payload}


@app.post("/ai/code/assistant")
async def code_assistant(
    instruction: CodeInstruction,
    client: Optional[OpenAI] = Depends(get_openai_client),
) -> Dict[str, Any]:
    if not ai_enabled(client):
        return fallback_code_response(instruction.instruction)

    try:
        payload = await complete_json_prompt(
            client,
            model=AiConfig.from_env().model,
            system=(
                "You are an engineering assistant producing code diffs. "
                "Return JSON with summary, diff (unified diff format), risk, testing_plan, and notes (array)."
            ),
            user=(
                "Instruction: "
                f"{instruction.instruction}\n"
                f"Context: {instruction.context or 'none'}\n"
                f"Target Area: {instruction.target_area or 'not specified'}"
            ),
        )
    except Exception as exc:  # pragma: no cover
        LOGGER.exception("OpenAI code assistant failed")
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return {"status": "success", **payload}


@app.post("/ai/optimizations")
async def optimization_feedback(
    request: OptimizationFeedbackRequest,
    client: Optional[OpenAI] = Depends(get_openai_client),
) -> Dict[str, Any]:
    if not ai_enabled(client):
        return fallback_optimization_response()

    try:
        payload = await complete_json_prompt(
            client,
            model=AiConfig.from_env().model,
            system=(
                "You analyze ecommerce telemetry and propose optimizations. "
                "Return JSON with suggestions (array of objects containing title, description, impact, priority, implementation_outline)."
            ),
            user=(
                "Website metrics: "
                f"{request.metrics}\nGoals: {request.goals or 'none'}"
            ),
        )
    except Exception as exc:  # pragma: no cover
        LOGGER.exception("OpenAI optimization suggestions failed")
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    suggestions = payload.get("suggestions") or []
    if not suggestions:
        suggestions = fallback_optimization_response()["suggestions"]

    normalised = [OptimizationSuggestion(**item).dict() for item in suggestions]
    return {"status": "success", "suggestions": normalised}


@app.post("/ai/products/upload")
async def upload_product_media(file: UploadFile) -> Dict[str, Any]:
    """Endpoint placeholder for asset uploads.

    Actual object storage integration (e.g. Supabase Storage or S3)
    should replace this implementation.  We simply echo metadata so the
    client can confirm the upload pipeline.
    """

    return {
        "status": "queued",
        "filename": file.filename,
        "content_type": file.content_type,
        "size": file.size,
        "note": "Replace this endpoint with Supabase Storage or S3 upload handling during deployment.",
    }


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers.setdefault("Cache-Control", "no-store")
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    return response


@app.get("/health")
async def healthcheck() -> Dict[str, str]:
    return {"status": "ok"}


if __name__ == "__main__":  # pragma: no cover
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")), reload=True)

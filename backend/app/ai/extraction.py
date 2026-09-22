"""AI-based invoice field extraction (docs/03_Module_Description.md - AI Extraction Module).

Uses Google Gemini (free tier via Google AI Studio - aistudio.google.com, no
billing required to start). Accepts text, an image, or a PDF - Gemini reads
PDFs natively, no page rasterization needed. Always returns a draft for
human review - this module never writes to the database.
"""

from google import genai
from google.genai import types
from pydantic import BaseModel, Field

from app.config import settings

EXTRACTION_MODEL = "gemini-3.6-flash"

EXTRACTION_SYSTEM_PROMPT = """You extract structured invoice data from the provided content \
(text or an image/PDF of an invoice/receipt). Extract: vendor name, invoice number, invoice date, \
due date, tax amount, total amount, and line items (description, quantity, unit price). Extract \
only what is actually present; use null for anything you cannot find or are not confident about \
- never guess or invent values."""


class ExtractedLineItem(BaseModel):
    description: str
    quantity: float
    unit_price: float


class ExtractedInvoice(BaseModel):
    vendor_name: str | None = None
    invoice_number: str | None = None
    invoice_date: str | None = Field(default=None, description="ISO format YYYY-MM-DD")
    due_date: str | None = Field(default=None, description="ISO format YYYY-MM-DD")
    tax_amount: float | None = None
    total_amount: float | None = None
    items: list[ExtractedLineItem] = Field(default_factory=list)


def _client() -> genai.Client:
    if not settings.gemini_api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured")
    return genai.Client(api_key=settings.gemini_api_key)


def _call_gemini(parts: list) -> ExtractedInvoice:
    client = _client()
    response = client.models.generate_content(
        model=EXTRACTION_MODEL,
        contents=parts,
        config=types.GenerateContentConfig(
            system_instruction=EXTRACTION_SYSTEM_PROMPT,
            response_mime_type="application/json",
            response_schema=ExtractedInvoice,
        ),
    )
    return ExtractedInvoice.model_validate_json(response.text)


def extract_from_text(text: str) -> ExtractedInvoice:
    return _call_gemini([text])


def extract_from_image(image_bytes: bytes, mime_type: str) -> ExtractedInvoice:
    return _call_gemini([types.Part.from_bytes(data=image_bytes, mime_type=mime_type)])


def extract_from_pdf(pdf_bytes: bytes) -> ExtractedInvoice:
    return _call_gemini([types.Part.from_bytes(data=pdf_bytes, mime_type="application/pdf")])

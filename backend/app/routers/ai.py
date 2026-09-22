from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from google.genai import errors as genai_errors

from app.ai.extraction import ExtractedInvoice, extract_from_image, extract_from_pdf, extract_from_text
from app.services.auth_deps import get_current_user

router = APIRouter(prefix="/api/ai", tags=["ai"], dependencies=[Depends(get_current_user)])


@router.post("/extract", response_model=ExtractedInvoice)
async def extract_invoice(
    text: str | None = Form(default=None),
    file: UploadFile | None = File(default=None),
):
    """Extract invoice fields from text, an image, or a PDF.

    Returns a draft only — nothing is saved here. The frontend shows this on
    the AI Review screen; saving goes through POST /api/invoices with the
    same validation as manual entry (BR-1, BR-2 still enforced).
    """
    try:
        if file is not None:
            content = await file.read()
            if file.content_type == "application/pdf":
                return extract_from_pdf(content)
            return extract_from_image(content, file.content_type or "image/png")

        if text and text.strip():
            return extract_from_text(text)

        raise HTTPException(status_code=400, detail="Provide either 'text' or 'file'")
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except genai_errors.APIError as e:
        raise HTTPException(status_code=503, detail=f"AI extraction failed: {e.message}")

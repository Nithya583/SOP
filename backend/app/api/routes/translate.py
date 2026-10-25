from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from app.models.schemas import TranslateRequest
from app.services.translation_service import translate_text, TranslationServiceError
from app.services.session_manager import session_manager

router = APIRouter()


@router.post("/translate")
async def translate(req: TranslateRequest):
    text_to_translate = req.text

    # If document_id is provided, retrieve document text
    if req.document_id:
        found = session_manager.find_document_globally(req.document_id)
        if not found:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={
                    "error": {
                        "code": "DOCUMENT_NOT_FOUND",
                        "message": f"Document '{req.document_id}' was not found in the active session.",
                        "suggestion": "Please re-upload your document or check your session."
                    }
                }
            )
        _, doc = found
        if not text_to_translate:
            text_to_translate = doc.get("extracted_text", "")

    if not text_to_translate or not text_to_translate.strip():
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "error": {
                    "code": "EMPTY_TEXT",
                    "message": "No text provided or found to translate.",
                    "suggestion": "Provide text or select an active document."
                }
            }
        )

    try:
        result = await translate_text(
            text=text_to_translate,
            target_language=req.target_language,
            source_language=req.source_language,
            scope=req.scope,
            provider=req.provider or "auto"
        )
        return result

    except TranslationServiceError as tse:
        status_code = status.HTTP_503_SERVICE_UNAVAILABLE if tse.code == "PROVIDER_NOT_CONFIGURED" else status.HTTP_502_BAD_GATEWAY
        return JSONResponse(
            status_code=status_code,
            content={
                "error": {
                    "code": tse.code,
                    "message": tse.message,
                    "suggestion": tse.suggestion
                }
            }
        )
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": {
                    "code": "TRANSLATION_FAILED",
                    "message": f"Translation failed unexpectedly: {str(e)}",
                    "suggestion": "Please retry or verify provider settings."
                }
            }
        )

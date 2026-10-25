import secrets
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from fastapi.responses import JSONResponse
from app.services.document_parser import extract_document_text, DocumentParsingError
from app.services.llm_service import analyze_document_text, LLMServiceError
from app.services.session_manager import session_manager
from app.utils.languages import SUPPORTED_LANGUAGES
from app.config import settings

router = APIRouter()

LEGAL_DISCLAIMER = (
    "AI Legal Guardian provides general legal information and AI-generated explanations for educational purposes. "
    "It is not a law firm and does not provide legal representation or a substitute for advice from a qualified lawyer in India. "
    "AI analysis may be incomplete or inaccurate. Verify important legal matters with a qualified professional before signing a document or taking action."
)


@router.post("/analyze")
async def analyze_document(
    file: UploadFile = File(...),
    language: str = Form("en"),
    session_id: Optional[str] = Form(None)
):
    if not file.filename:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "error": {
                    "code": "MISSING_FILE",
                    "message": "No file was uploaded.",
                    "suggestion": "Please select a valid PDF, DOCX, or TXT file."
                }
            }
        )

    # 1. Read file bytes with size constraint
    file_bytes = await file.read()
    if len(file_bytes) > settings.max_upload_size_bytes:
        return JSONResponse(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            content={
                "error": {
                    "code": "FILE_TOO_LARGE",
                    "message": f"Uploaded file exceeds maximum limit of {settings.MAX_UPLOAD_SIZE_MB}MB.",
                    "suggestion": "Please upload a smaller document."
                }
            }
        )

    # 2. Extract text from document
    try:
        extracted_text, metadata = extract_document_text(
            filename=file.filename,
            file_bytes=file_bytes,
            content_type=file.content_type
        )
    except DocumentParsingError as dpe:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "error": {
                    "code": dpe.code,
                    "message": dpe.message,
                    "suggestion": dpe.suggestion
                }
            }
        )
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": {
                    "code": "EXTRACTION_FAILED",
                    "message": f"Failed to extract text from document: {str(e)}",
                    "suggestion": "Ensure the file is not corrupted or password-protected."
                }
            }
        )

    # 3. Create or retrieve active session and register document
    session = session_manager.get_or_create_session(session_id)
    document_id = secrets.token_urlsafe(16)

    session_manager.add_document(
        session_id=session.session_id,
        document_id=document_id,
        filename=file.filename,
        file_size=len(file_bytes),
        content_type=file.content_type or "application/octet-stream",
        extracted_text=extracted_text
    )

    # 4. Resolve target language
    lang_info = SUPPORTED_LANGUAGES.get(language, SUPPORTED_LANGUAGES["en"])
    target_lang_code = lang_info["code"]
    target_lang_name = lang_info["name"]

    # 5. Perform AI analysis
    try:
        analysis = analyze_document_text(
            text=extracted_text,
            target_language_code=target_lang_code,
            target_language_name=target_lang_name
        )
        session_manager.update_document_analysis(session.session_id, document_id, analysis)

        return {
            "session_id": session.session_id,
            "document_id": document_id,
            "filename": file.filename,
            "file_size": len(file_bytes),
            "character_count": len(extracted_text),
            "analysis": analysis.model_dump(),
            "disclaimer": LEGAL_DISCLAIMER
        }

    except LLMServiceError as lse:
        status_code = status.HTTP_503_SERVICE_UNAVAILABLE if lse.code == "PROVIDER_NOT_CONFIGURED" else status.HTTP_502_BAD_GATEWAY
        return JSONResponse(
            status_code=status_code,
            content={
                "error": {
                    "code": lse.code,
                    "message": lse.message,
                    "suggestion": lse.suggestion
                },
                "document_id": document_id,
                "session_id": session.session_id,
                "filename": file.filename
            }
        )
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": {
                    "code": "ANALYSIS_FAILED",
                    "message": f"Unexpected error during document analysis: {str(e)}",
                    "suggestion": "Check backend logs or retry."
                }
            }
        )

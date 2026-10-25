import time
from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from app.models.schemas import ChatRequest
from app.services.llm_service import chat_with_legal_assistant, LLMServiceError
from app.services.session_manager import session_manager
from app.utils.languages import SUPPORTED_LANGUAGES

router = APIRouter()

CHAT_LEGAL_DISCLAIMER = (
    "AI Legal Guardian is an AI assistant providing informational explanations of legal documents. "
    "It is NOT a lawyer, does not provide legal advice, and does not create an attorney-client relationship. "
    "Always consult a qualified advocate in India before taking legal decisions."
)


@router.post("/chat")
async def chat(req: ChatRequest):
    session = session_manager.get_or_create_session(req.session_id)
    doc_text = None

    if req.document_id:
        doc = session.documents.get(req.document_id)
        if not doc:
            # Try global find
            found = session_manager.find_document_globally(req.document_id)
            if found:
                _, doc = found
        if doc:
            doc_text = doc.get("extracted_text")

    lang_info = SUPPORTED_LANGUAGES.get(req.language, SUPPORTED_LANGUAGES["en"])
    lang_name = lang_info["name"]

    try:
        reply_data = chat_with_legal_assistant(
            document_text=doc_text,
            message=req.message,
            chat_history=session.chat_history,
            language_code=req.language,
            language_name=lang_name
        )

        # Record turns in temporary session history
        session.chat_history.append({"role": "user", "content": req.message, "timestamp": time.time()})
        session.chat_history.append({
            "role": "assistant",
            "content": reply_data["response"],
            "timestamp": time.time(),
            "is_general_legal_info": reply_data.get("is_general_legal_info", False)
        })

        return {
            "session_id": session.session_id,
            "response": reply_data["response"],
            "is_general_legal_info": reply_data.get("is_general_legal_info", False),
            "disclaimer": CHAT_LEGAL_DISCLAIMER
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
                "session_id": session.session_id
            }
        )
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": {
                    "code": "CHAT_FAILED",
                    "message": f"Chat assistant error: {str(e)}",
                    "suggestion": "Please retry your question."
                }
            }
        )

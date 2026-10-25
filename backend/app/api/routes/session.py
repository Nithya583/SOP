from typing import Optional
from fastapi import APIRouter, Query, Header, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from app.services.session_manager import session_manager

router = APIRouter()


class SessionClearPayload(BaseModel):
    session_id: Optional[str] = None


@router.delete("/documents/{document_id}")
def delete_document(
    document_id: str,
    session_id: Optional[str] = Query(None),
    x_session_id: Optional[str] = Header(None)
):
    sid = session_id or x_session_id or ""
    deleted = session_manager.delete_document(sid, document_id)

    if not deleted:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "error": {
                    "code": "DOCUMENT_NOT_FOUND",
                    "message": f"Document '{document_id}' was not found or already deleted.",
                    "suggestion": "The document may have already been purged or expired."
                }
            }
        )

    return {
        "success": True,
        "document_id": document_id,
        "message": "Document and all associated extracted text and temporary files have been permanently deleted from server memory."
    }


@router.post("/session/clear")
def clear_session(
    payload: Optional[SessionClearPayload] = None,
    session_id: Optional[str] = Query(None),
    x_session_id: Optional[str] = Header(None)
):
    sid = ""
    if payload and payload.session_id:
        sid = payload.session_id
    elif session_id:
        sid = session_id
    elif x_session_id:
        sid = x_session_id

    cleared = session_manager.clear_session(sid) if sid else {"documents_cleared": 0, "chat_cleared": 0, "translations_cleared": 0}

    return {
        "success": True,
        "cleared_items": cleared,
        "message": "Session terminated and all document contents, analyses, translations, and chat histories permanently purged from memory."
    }

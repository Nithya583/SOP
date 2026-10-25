from fastapi import APIRouter
from app.config import settings
from app.services.session_manager import session_manager

router = APIRouter()


@router.get("/health")
def health_check():
    gemini_configured = bool(
        settings.GEMINI_API_KEY and not settings.GEMINI_API_KEY.startswith("your_gemini")
    )
    openai_configured = bool(
        settings.OPENAI_API_KEY and not settings.OPENAI_API_KEY.startswith("your_openai")
    )
    google_configured = bool(
        settings.GOOGLE_TRANSLATION_API_KEY and not settings.GOOGLE_TRANSLATION_API_KEY.startswith("your_google")
    )

    return {
        "status": "healthy",
        "service": "AI Legal Guardian Backend",
        "version": "1.0.0",
        "providers": {
            "gemini": {
                "configured": gemini_configured,
                "tier": "free",
                "services": ["document_analysis", "grounded_chat", "multimodal_stt", "multilingual_translation"]
            },
            "openai": {
                "configured": openai_configured,
                "services": ["document_analysis", "grounded_chat", "whisper_stt", "tts_speech", "translation_fallback"]
            },
            "google_translation": {
                "configured": google_configured,
                "services": ["cloud_translation"]
            }
        },
        "session": {
            "active_sessions_count": len(session_manager._sessions),
            "ttl_minutes": settings.SESSION_TTL_MINUTES
        }
    }

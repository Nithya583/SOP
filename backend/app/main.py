import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.config import settings
from app.services.session_manager import session_manager
from app.api.routes import health, languages, analyze, translate, chat, speech, session

# Configure logging (no sensitive content logged)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("ai_legal_guardian")


async def periodic_session_cleanup():
    """Background task to remove expired sessions and clean up associated temp files."""
    while True:
        try:
            await asyncio.sleep(300)  # every 5 minutes
            cleaned = session_manager.cleanup_expired_sessions()
            if cleaned > 0:
                logger.info(f"Cleaned up {cleaned} expired temporary sessions and artifacts.")
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error(f"Error during periodic session cleanup: {str(e)}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: launch cleanup background task
    cleanup_task = asyncio.create_task(periodic_session_cleanup())
    logger.info("AI Legal Guardian backend started successfully.")
    yield
    # Shutdown: cancel cleanup and purge all active sessions
    cleanup_task.cancel()
    session_manager.cleanup_expired_sessions()
    logger.info("AI Legal Guardian backend shut down.")


app = FastAPI(
    title="AI Legal Guardian API",
    description="Privacy-first, multilingual legal document assistant for Indian citizens.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration for development frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    first_error = errors[0] if errors else {}
    msg = first_error.get("msg", "Invalid request parameters.")
    loc = " -> ".join([str(l) for l in first_error.get("loc", [])])
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": f"Validation failed: {msg} at {loc}",
                "suggestion": "Check request payload formatting."
            }
        }
    )


# Mount API routers
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(languages.router, prefix="/api", tags=["Languages"])
app.include_router(analyze.router, prefix="/api", tags=["Analysis"])
app.include_router(translate.router, prefix="/api", tags=["Translation"])
app.include_router(chat.router, prefix="/api", tags=["Chat"])
app.include_router(speech.router, prefix="/api", tags=["Speech"])
app.include_router(session.router, prefix="/api", tags=["Session"])


@app.get("/")
def root():
    return {
        "service": "AI Legal Guardian API",
        "documentation": "/docs",
        "status": "online"
    }

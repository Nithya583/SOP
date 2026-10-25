from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, Response, status
from fastapi.responses import JSONResponse
from app.models.schemas import SpeechSynthesizeRequest
from app.services.speech_service import transcribe_audio, synthesize_speech, SpeechServiceError
from app.services.llm_service import LLMServiceError

router = APIRouter()


@router.post("/speech/transcribe")
async def transcribe(
    file: UploadFile = File(...),
    language: Optional[str] = Form(None)
):
    if not file.filename:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "error": {
                    "code": "MISSING_AUDIO_FILE",
                    "message": "No audio file uploaded.",
                    "suggestion": "Record or upload audio to transcribe."
                }
            }
        )

    file_bytes = await file.read()
    if not file_bytes or len(file_bytes) == 0:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "error": {
                    "code": "EMPTY_AUDIO",
                    "message": "The audio recording was empty.",
                    "suggestion": "Please check your microphone and speak clearly."
                }
            }
        )

    try:
        result = transcribe_audio(
            file_bytes=file_bytes,
            filename=file.filename,
            language_code=language
        )
        return result
    except SpeechServiceError as sse:
        status_code = status.HTTP_503_SERVICE_UNAVAILABLE if sse.code == "PROVIDER_NOT_CONFIGURED" else status.HTTP_400_BAD_REQUEST if sse.code.startswith("UNSUPPORTED") else status.HTTP_502_BAD_GATEWAY
        return JSONResponse(
            status_code=status_code,
            content={
                "error": {
                    "code": sse.code,
                    "message": sse.message,
                    "suggestion": sse.suggestion
                }
            }
        )
    except LLMServiceError as lse:
        status_code = status.HTTP_503_SERVICE_UNAVAILABLE if lse.code == "PROVIDER_NOT_CONFIGURED" else status.HTTP_502_BAD_GATEWAY
        return JSONResponse(
            status_code=status_code,
            content={
                "error": {
                    "code": lse.code,
                    "message": lse.message,
                    "suggestion": lse.suggestion
                }
            }
        )
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": {
                    "code": "TRANSCRIPTION_FAILED",
                    "message": f"Audio transcription error: {str(e)}",
                    "suggestion": "Please retry recording."
                }
            }
        )


@router.post("/speech/synthesize")
async def synthesize(req: SpeechSynthesizeRequest):
    try:
        audio_bytes = synthesize_speech(text=req.text, language_code=req.language)
        return Response(content=audio_bytes, media_type="audio/mpeg")
    except SpeechServiceError as sse:
        status_code = status.HTTP_503_SERVICE_UNAVAILABLE if sse.code == "PROVIDER_NOT_CONFIGURED" else status.HTTP_400_BAD_REQUEST if sse.code.startswith("UNSUPPORTED") else status.HTTP_502_BAD_GATEWAY
        return JSONResponse(
            status_code=status_code,
            content={
                "error": {
                    "code": sse.code,
                    "message": sse.message,
                    "suggestion": sse.suggestion
                }
            }
        )
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": {
                    "code": "SYNTHESIS_FAILED",
                    "message": f"Speech synthesis error: {str(e)}",
                    "suggestion": "Please retry or use browser text-to-speech fallback."
                }
            }
        )

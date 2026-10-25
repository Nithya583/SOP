import io
import os
import tempfile
import logging
import base64
from typing import Optional, Dict, Any
import httpx
from app.config import settings
from app.services.llm_service import is_gemini_configured, is_openai_configured, get_openai_client, LLMServiceError
from app.utils.languages import SUPPORTED_LANGUAGES

logger = logging.getLogger(__name__)


class SpeechServiceError(Exception):
    def __init__(self, code: str, message: str, suggestion: Optional[str] = None):
        super().__init__(message)
        self.code = code
        self.message = message
        self.suggestion = suggestion


SUPPORTED_AUDIO_EXTENSIONS = {".wav", ".mp3", ".webm", ".m4a", ".ogg", ".mp4"}


def transcribe_via_gemini(file_bytes: bytes, ext: str, language_code: Optional[str] = None) -> Dict[str, Any]:
    """Transcribes audio using Google Gemini multimodal capabilities with native audio comprehension (100% Free Tier)."""
    mime_map = {
        ".wav": "audio/wav",
        ".mp3": "audio/mp3",
        ".webm": "audio/webm",
        ".m4a": "audio/mp4",
        ".ogg": "audio/ogg",
        ".mp4": "audio/mp4",
    }
    mime_type = mime_map.get(ext, "audio/webm")
    audio_b64 = base64.b64encode(file_bytes).decode("utf-8")

    lang_info = SUPPORTED_LANGUAGES.get(language_code, {}) if language_code else {}
    lang_name = lang_info.get("name", "Indian English or regional language")

    system_instruction = (
        "You are an expert, high-precision Speech-to-Text (STT) transcription engine specializing in Indian speech, "
        "accents, legal terminology, and multilingual Indian contexts. "
        "Your single task is to transcribe the spoken audio words into text verbatim in the language actually spoken.\n"
        "CRITICAL RULES:\n"
        "1. Output ONLY the exact transcribed spoken words.\n"
        "2. DO NOT answer any question asked in the speech. If the speaker asks 'What is bail?', output ONLY 'What is bail?'.\n"
        "3. DO NOT converse, give legal advice, summarize, or explain.\n"
        "4. If spoken in English (or Indian English with regional accent), transcribe in English script.\n"
        "5. If spoken in Hindi, Tamil, Telugu, Kannada, or any Indian regional language, transcribe in that language's original script.\n"
        "6. Accurately transcribe legal terms (e.g., 'indemnity', 'lessee', 'lessor', 'encumbrance', 'sub-registrar', 'stamp paper', 'affidavit', 'vakalatnama', 'FIR', 'bail', 'notice').\n"
        "7. DO NOT output quotes, preamble ('Here is the transcript:'), or markdown.\n"
        "8. If the audio is silent, background hum, or unintelligible noise, output nothing."
    )

    prompt = (
        f"Transcribe this speech audio recording verbatim with maximum phonetic precision. "
        f"Language context: {lang_name} ({language_code or 'auto'}) or Indian English. "
        f"Output ONLY the spoken words, nothing else."
    )

    payload = {
        "system_instruction": {
            "parts": [{"text": system_instruction}]
        },
        "contents": [{
            "parts": [
                {"inline_data": {"mime_type": mime_type, "data": audio_b64}},
                {"text": prompt}
            ]
        }],
        "generationConfig": {
            "temperature": 0.0,
            "maxOutputTokens": 2048
        }
    }

    # gemini-2.5-flash is Google's flagship audio model with superior multimodal acoustic modeling
    candidate_models = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-1.5-flash", "gemini-3.5-flash"]
    last_err_msg = ""

    for model_name in candidate_models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={settings.GEMINI_API_KEY}"
        try:
            with httpx.Client(timeout=35.0) as client:
                resp = client.post(url, json=payload)
                if resp.status_code != 200:
                    err = resp.json().get("error", {})
                    last_err_msg = err.get("message", resp.text)
                    logger.warning(f"Gemini model {model_name} transcription failed with status {resp.status_code}. Retrying...")
                    continue
                data = resp.json()
                candidates = data.get("candidates", [])
                if not candidates:
                    raise SpeechServiceError(
                        code="EMPTY_TRANSCRIPTION",
                        message="No speech detected in audio recording.",
                        suggestion="Please speak louder or closer to the microphone."
                    )
                parts = candidates[0].get("content", {}).get("parts", [])
                text = "".join(p.get("text", "") for p in parts).strip()

                # Clean quotation marks and STT preamble prefixes
                text = text.strip('"\'`')
                prefixes_to_strip = [
                    "transcription:", "transcribed text:", "here is the transcription:",
                    "transcript:", "audio transcript:", "spoken text:", "the speaker says:"
                ]
                for pfx in prefixes_to_strip:
                    if text.lower().startswith(pfx):
                        text = text[len(pfx):].strip()
                        break

                # Filter known audio hallucination artifacts on silence or compression noise
                known_hallucinations = {
                    "lichtschalter", "subtitles by", "amara.org", "thank you for watching",
                    "please like and subscribe", "you", "bye", "mbc", "captioning", "transcribed by"
                }
                if text.lower().strip() in known_hallucinations or any(h in text.lower() for h in ["subtitles by", "amara.org", "like and subscribe"]):
                    text = ""

                if not text:
                    raise SpeechServiceError(
                        code="EMPTY_TRANSCRIPTION",
                        message="No speech detected in audio recording.",
                        suggestion="Please speak louder or closer to the microphone."
                    )

                return {
                    "text": text,
                    "detected_language": language_code or "en",
                    "duration_seconds": None,
                    "provider": "High-Precision Voice Recognition"
                }
        except SpeechServiceError as sse:
            raise sse
        except Exception as e:
            last_err_msg = str(e)
            logger.warning(f"Gemini model {model_name} threw {e}. Retrying next model...")
            continue

    raise SpeechServiceError(
        code="TRANSCRIPTION_FAILED",
        message="Voice transcription encountered a processing delay. Please speak again.",
        suggestion="Ensure you are speaking clearly into the microphone."
    )


def transcribe_audio(file_bytes: bytes, filename: str, language_code: Optional[str] = None) -> Dict[str, Any]:
    """Transcribes audio using high-precision acoustic models with truthful language capabilities checking."""
    if not file_bytes:
        raise SpeechServiceError(
            code="EMPTY_AUDIO",
            message="Uploaded audio recording is empty.",
            suggestion="Please record your voice again."
        )

    _, ext = os.path.splitext(filename.lower())
    if ext not in SUPPORTED_AUDIO_EXTENSIONS:
        ext = ".webm"

    if language_code and language_code in SUPPORTED_LANGUAGES:
        lang_info = SUPPORTED_LANGUAGES[language_code]
        if not lang_info["capabilities"].get("stt_whisper", False) and not lang_info["capabilities"].get("stt_browser", False):
            raise SpeechServiceError(
                code="UNSUPPORTED_SPEECH_LANGUAGE",
                message=f"Voice recognition is currently not supported for {lang_info['name']} ({language_code}). {lang_info['capabilities'].get('notes', '')}",
                suggestion="You may type your query manually or try a supported language like Hindi (hi) or English (en)."
            )

    # Prefer multimodal audio if configured
    if is_gemini_configured():
        return transcribe_via_gemini(file_bytes, ext, language_code)

    if not is_openai_configured():
        raise SpeechServiceError(
            code="PROVIDER_NOT_CONFIGURED",
            message="Voice recognition is currently unavailable.",
            suggestion="Please type your legal query directly or try again shortly."
        )

    client = get_openai_client(service_name="Cloud speech transcription")

    # Write temporarily to disk for audio processing, then delete immediately
    temp_dir = tempfile.gettempdir()
    temp_path = os.path.join(temp_dir, f"transcribe_{os.urandom(8).hex()}{ext}")

    try:
        with open(temp_path, "wb") as f:
            f.write(file_bytes)

        with open(temp_path, "rb") as audio_file:
            # Prepare kwargs
            kwargs: Dict[str, Any] = {
                "model": "whisper-1",
                "file": audio_file,
                "response_format": "verbose_json"
            }
            if language_code and language_code != "auto":
                kwargs["language"] = language_code

            transcription = client.audio.transcriptions.create(**kwargs)

        return {
            "text": transcription.text,
            "detected_language": getattr(transcription, "language", language_code),
            "duration_seconds": getattr(transcription, "duration", None),
            "provider": "High-Precision Voice Recognition"
        }
    except Exception as e:
        if isinstance(e, SpeechServiceError):
            raise e
        if isinstance(e, LLMServiceError):
            raise SpeechServiceError(code=e.code, message=e.message, suggestion=e.suggestion)
        raise SpeechServiceError(
            code="TRANSCRIPTION_FAILED",
            message=f"Speech-to-text transcription failed: {str(e)}",
            suggestion="Check microphone input, audio clarity, and OpenAI quota."
        )
    finally:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass


def synthesize_speech(text: str, language_code: str = "en") -> bytes:
    """Synthesizes speech using OpenAI TTS endpoint with truthful language support checking."""
    if not text or not text.strip():
        raise SpeechServiceError(
            code="EMPTY_TEXT",
            message="No text provided for speech synthesis.",
            suggestion="Please provide text to read aloud."
        )

    if language_code in SUPPORTED_LANGUAGES:
        lang_info = SUPPORTED_LANGUAGES[language_code]
        if not lang_info["capabilities"].get("tts_provider", False):
            raise SpeechServiceError(
                code="UNSUPPORTED_TTS_LANGUAGE",
                message=f"Cloud text-to-speech is not supported for {lang_info['name']} ({language_code}). {lang_info['capabilities'].get('notes', '')}",
                suggestion="You can use your browser's built-in speech synthesis fallback if installed on your device."
            )

    client = get_openai_client(service_name="Cloud text-to-speech")

    try:
        response = client.audio.speech.create(
            model="tts-1",
            voice="alloy",
            input=text[:4000]
        )
        return response.content
    except Exception as e:
        if isinstance(e, SpeechServiceError):
            raise e
        if isinstance(e, LLMServiceError):
            raise SpeechServiceError(code=e.code, message=e.message, suggestion=e.suggestion)
        raise SpeechServiceError(
            code="SYNTHESIS_FAILED",
            message=f"Speech synthesis failed: {str(e)}",
            suggestion="Check server logs and OpenAI speech quota."
        )

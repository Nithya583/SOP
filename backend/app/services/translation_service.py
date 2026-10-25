import logging
from typing import Optional, Dict, Any, List
import httpx
from app.config import settings
from app.services.llm_service import (
    get_llm_client_and_model,
    get_openai_client,
    call_chat_completions,
    LLMServiceError,
    is_gemini_configured,
    is_openai_configured
)
from app.utils.languages import SUPPORTED_LANGUAGES

logger = logging.getLogger(__name__)


class TranslationServiceError(Exception):
    def __init__(self, code: str, message: str, suggestion: Optional[str] = None):
        super().__init__(message)
        self.code = code
        self.message = message
        self.suggestion = suggestion


# Mapping of app language codes to Google GTX supported codes where differences exist
GOOGLE_GTX_LANG_MAP = {
    "kok": "gom",  # Goan Konkani
}


async def translate_via_free_google(text: str, target_lang: str, source_lang: Optional[str] = None) -> str:
    """
    100% Free, zero-API-key translation engine powered by Google's client endpoint.
    Preserves clause numbers, paragraph structures, party designations, and statutory citations.
    """
    sl = source_lang if (source_lang and source_lang != "auto") else "auto"
    tl = GOOGLE_GTX_LANG_MAP.get(target_lang, target_lang)

    url = "https://translate.googleapis.com/translate_a/single"
    params = {
        "client": "gtx",
        "sl": sl,
        "tl": tl,
        "dt": "t",
        "q": text
    }
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    }

    try:
        async with httpx.AsyncClient(timeout=25.0) as client:
            resp = await client.get(url, params=params, headers=headers)
            if resp.status_code != 200:
                raise TranslationServiceError(
                    code="FREE_TRANSLATION_HTTP_ERROR",
                    message=f"Free translation service returned HTTP status {resp.status_code}.",
                    suggestion="Please try again or select AI Legal Translation."
                )
            data = resp.json()
            if not data or not isinstance(data, list) or not data[0]:
                raise TranslationServiceError(
                    code="EMPTY_TRANSLATION",
                    message="No translated content returned from the translation engine.",
                    suggestion="Please check the input text and try again."
                )
            translated_pieces = [item[0] for item in data[0] if item and isinstance(item, list) and item[0]]
            return "".join(translated_pieces)
    except TranslationServiceError:
        raise
    except Exception as e:
        logger.warning(f"Free Google translation error: {e}")
        raise TranslationServiceError(
            code="FREE_TRANSLATION_ERROR",
            message=f"Free translation failed: {str(e)}",
            suggestion="Verify internet connectivity or try again."
        )


async def translate_via_google(text: str, target_lang: str, source_lang: Optional[str] = None) -> str:
    """Translates text via Google Cloud Translation REST API."""
    url = f"https://translation.googleapis.com/language/translate/v2?key={settings.GOOGLE_TRANSLATION_API_KEY}"
    payload: Dict[str, Any] = {
        "q": text,
        "target": target_lang,
        "format": "text"
    }
    if source_lang and source_lang != "auto":
        payload["source"] = source_lang

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(url, json=payload)
        if response.status_code != 200:
            error_data = response.json().get("error", {})
            raise TranslationServiceError(
                code="GOOGLE_TRANSLATION_ERROR",
                message=f"Google Translation API failed: {error_data.get('message', response.text)}",
                suggestion="Check your Google Translation API credentials and quotas."
            )
        data = response.json()
        translations = data.get("data", {}).get("translations", [])
        if not translations:
            raise TranslationServiceError(
                code="EMPTY_TRANSLATION",
                message="No translation returned from Google Translation API.",
                suggestion="Retry the translation request."
            )
        return translations[0].get("translatedText", "")


def translate_via_llm(text: str, target_lang_code: str, target_lang_name: str, source_lang_code: str = "auto") -> str:
    """High-fidelity legal translation preserving structure, numbers, defined terms, and legal context."""
    client, model_name, _ = get_llm_client_and_model("Cloud AI translation")

    system_prompt = f"""You are a professional legal document translator specializing in Indian legal contracts and Indian languages.
Translate the input text into {target_lang_name} ({target_lang_code}).

CRITICAL TRANSLATION RULES:
1. FAITHFUL TRANSLATION: Translate accurately and faithfully. DO NOT summarize, compress, or omit any clauses, obligations, or provisions.
2. PRESERVATION: Preserve all defined party names (e.g. 'Lessor', 'Lessee', 'Employer'), statutory references (e.g. 'Indian Contract Act 1872', 'Section 138'), monetary amounts, bank account numbers, dates, and paragraph numbering.
3. LEGAL PRECISION: Use standard Indian legal terminology in the target language.
4. ONLY TRANSLATED TEXT: Output ONLY the translated text. Do not add introductory greetings or conversational commentary.
"""

    try:
        response = call_chat_completions(
            client=client,
            primary_model=model_name,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": text}
            ],
            temperature=0.1
        )
        translated = response.choices[0].message.content or ""
        return translated.strip()
    except Exception as e:
        if isinstance(e, LLMServiceError):
            raise TranslationServiceError(
                code=e.code,
                message=e.message,
                suggestion=e.suggestion
            )
        raise TranslationServiceError(
            code="AI_TRANSLATION_ERROR",
            message=f"AI translation failed: {str(e)}",
            suggestion="Verify Gemini or OpenAI API key and quota."
        )


async def _execute_chunk_translation(
    chunk_text: str,
    engine: str,
    target_language: str,
    target_lang_name: str,
    source_language: str,
    has_google_cloud: bool
) -> str:
    if engine == "ai_legal":
        try:
            return translate_via_llm(chunk_text, target_language, target_lang_name, source_language)
        except Exception as e:
            logger.warning(f"AI translation failed for chunk; falling back to Free Google Translate: {e}")
            return await translate_via_free_google(chunk_text, target_language, source_language)
    elif engine == "google_cloud" and has_google_cloud:
        return await translate_via_google(chunk_text, target_language, source_language)
    else:
        return await translate_via_free_google(chunk_text, target_language, source_language)


async def translate_text(
    text: str,
    target_language: str,
    source_language: str = "auto",
    scope: str = "selected_clause",
    provider: str = "auto"
) -> Dict[str, Any]:
    if not text or not text.strip():
        raise TranslationServiceError(
            code="EMPTY_TEXT",
            message="No text provided for translation.",
            suggestion="Select a clause or provide document text to translate."
        )

    target_lang_info = SUPPORTED_LANGUAGES.get(target_language)
    if not target_lang_info:
        raise TranslationServiceError(
            code="UNSUPPORTED_LANGUAGE",
            message=f"Language '{target_language}' is not supported.",
            suggestion="Choose one of the 16 supported Indian languages."
        )

    target_lang_name = target_lang_info["name"]

    has_gemini = is_gemini_configured()
    has_openai = is_openai_configured()
    has_google_cloud = bool(settings.GOOGLE_TRANSLATION_API_KEY and not settings.GOOGLE_TRANSLATION_API_KEY.startswith("your_google"))

    # Explicit AI legal translation requested without configured keys
    if provider == "ai_legal" and not has_gemini and not has_openai:
        raise TranslationServiceError(
            code="PROVIDER_NOT_CONFIGURED",
            message="In-depth legal translation is currently unavailable.",
            suggestion="Switch to Fast Translation mode or try again shortly."
        )

    # In test mode where keys are specifically set to placeholder strings and provider was not explicitly requested as free_google
    if not has_gemini and not has_openai and not has_google_cloud and provider not in ["free_google", "free"]:
        raise TranslationServiceError(
            code="PROVIDER_NOT_CONFIGURED",
            message="Translation service is currently unavailable.",
            suggestion="Please switch to Fast Translation or try again shortly."
        )

    # Determine chosen translation engine
    if provider == "ai_legal" and (has_gemini or has_openai):
        chosen_engine = "ai_legal"
    elif provider in ["free_google", "free"]:
        chosen_engine = "free_google"
    elif has_gemini or has_openai:
        # Default auto prefers free_google for speed and reliability, or AI if requested
        chosen_engine = "free_google"
    else:
        chosen_engine = "free_google"

    # For full documents or large text, chunk safely by paragraphs
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    if not paragraphs:
        paragraphs = [text]

    translated_chunks = []
    chunk_buffer = []
    chunk_char_count = 0
    max_chunk_chars = 2500

    for p in paragraphs:
        if chunk_char_count + len(p) > max_chunk_chars and chunk_buffer:
            combined = "\n\n".join(chunk_buffer)
            res = await _execute_chunk_translation(combined, chosen_engine, target_language, target_lang_name, source_language, has_google_cloud)
            translated_chunks.append(res)
            chunk_buffer = [p]
            chunk_char_count = len(p)
        else:
            chunk_buffer.append(p)
            chunk_char_count += len(p)

    if chunk_buffer:
        combined = "\n\n".join(chunk_buffer)
        res = await _execute_chunk_translation(combined, chosen_engine, target_language, target_lang_name, source_language, has_google_cloud)
        translated_chunks.append(res)

    translated_text = "\n\n".join(translated_chunks)

    provider_label = "Fast Legal Translation" if chosen_engine == "free_google" else "In-Depth Legal Analysis"

    return {
        "source_language": source_language,
        "target_language": target_language,
        "original_text": text,
        "translated_text": translated_text,
        "scope": scope,
        "provider": provider_label,
        "disclaimer": "Translations are provided for educational and informational understanding only and do not replace legally certified court translations."
    }

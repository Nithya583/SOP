from typing import Dict, Any, List

SUPPORTED_LANGUAGES: Dict[str, Dict[str, Any]] = {
    "en": {
        "code": "en",
        "name": "English",
        "native_name": "English",
        "direction": "ltr",
        "script": "Latin",
        "capabilities": {
            "analysis": True,
            "translation": True,
            "stt_whisper": True,
            "stt_browser": True,
            "tts_provider": True,
            "tts_browser": True,
            "notes": "Full support across all AI and voice providers."
        }
    },
    "hi": {
        "code": "hi",
        "name": "Hindi",
        "native_name": "हिन्दी",
        "direction": "ltr",
        "script": "Devanagari",
        "capabilities": {
            "analysis": True,
            "translation": True,
            "stt_whisper": True,
            "stt_browser": True,
            "tts_provider": True,
            "tts_browser": True,
            "notes": "Comprehensive support in document analysis, translation, and speech."
        }
    },
    "ta": {
        "code": "ta",
        "name": "Tamil",
        "native_name": "தமிழ்",
        "direction": "ltr",
        "script": "Tamil",
        "capabilities": {
            "analysis": True,
            "translation": True,
            "stt_whisper": True,
            "stt_browser": True,
            "tts_provider": True,
            "tts_browser": True,
            "notes": "Supported for analysis, translation, and speech synthesis."
        }
    },
    "te": {
        "code": "te",
        "name": "Telugu",
        "native_name": "తెలుగు",
        "direction": "ltr",
        "script": "Telugu",
        "capabilities": {
            "analysis": True,
            "translation": True,
            "stt_whisper": True,
            "stt_browser": True,
            "tts_provider": True,
            "tts_browser": True,
            "notes": "Supported for analysis, translation, and speech recognition."
        }
    },
    "ml": {
        "code": "ml",
        "name": "Malayalam",
        "native_name": "മലയാളം",
        "direction": "ltr",
        "script": "Malayalam",
        "capabilities": {
            "analysis": True,
            "translation": True,
            "stt_whisper": True,
            "stt_browser": True,
            "tts_provider": True,
            "tts_browser": True,
            "notes": "Supported for analysis, translation, and speech processing."
        }
    },
    "kn": {
        "code": "kn",
        "name": "Kannada",
        "native_name": "ಕನ್ನಡ",
        "direction": "ltr",
        "script": "Kannada",
        "capabilities": {
            "analysis": True,
            "translation": True,
            "stt_whisper": True,
            "stt_browser": True,
            "tts_provider": True,
            "tts_browser": True,
            "notes": "Supported for analysis, translation, and speech processing."
        }
    },
    "bn": {
        "code": "bn",
        "name": "Bengali",
        "native_name": "বাংলা",
        "direction": "ltr",
        "script": "Bengali",
        "capabilities": {
            "analysis": True,
            "translation": True,
            "stt_whisper": True,
            "stt_browser": True,
            "tts_provider": True,
            "tts_browser": True,
            "notes": "Supported across analysis, translation, and speech synthesis."
        }
    },
    "mr": {
        "code": "mr",
        "name": "Marathi",
        "native_name": "मराठी",
        "direction": "ltr",
        "script": "Devanagari",
        "capabilities": {
            "analysis": True,
            "translation": True,
            "stt_whisper": True,
            "stt_browser": True,
            "tts_provider": True,
            "tts_browser": True,
            "notes": "Supported for analysis, translation, and speech processing."
        }
    },
    "gu": {
        "code": "gu",
        "name": "Gujarati",
        "native_name": "ગુજરાતી",
        "direction": "ltr",
        "script": "Gujarati",
        "capabilities": {
            "analysis": True,
            "translation": True,
            "stt_whisper": True,
            "stt_browser": True,
            "tts_provider": True,
            "tts_browser": True,
            "notes": "Supported for analysis, translation, and speech processing."
        }
    },
    "pa": {
        "code": "pa",
        "name": "Punjabi",
        "native_name": "ਪੰਜਾਬੀ",
        "direction": "ltr",
        "script": "Gurmukhi",
        "capabilities": {
            "analysis": True,
            "translation": True,
            "stt_whisper": True,
            "stt_browser": True,
            "tts_provider": True,
            "tts_browser": True,
            "notes": "Supported for analysis, translation, and speech."
        }
    },
    "or": {
        "code": "or",
        "name": "Odia",
        "native_name": "ଓଡ଼ିଆ",
        "direction": "ltr",
        "script": "Odia",
        "capabilities": {
            "analysis": True,
            "translation": True,
            "stt_whisper": False,
            "stt_browser": False,
            "tts_provider": False,
            "tts_browser": False,
            "notes": "Analysis and translation supported. Voice features have limited support for this dialect."
        }
    },
    "as": {
        "code": "as",
        "name": "Assamese",
        "native_name": "অসমীয়া",
        "direction": "ltr",
        "script": "Bengali-Assamese",
        "capabilities": {
            "analysis": True,
            "translation": True,
            "stt_whisper": False,
            "stt_browser": False,
            "tts_provider": False,
            "tts_browser": False,
            "notes": "Analysis and translation supported. Voice features have limited support for this dialect."
        }
    },
    "ur": {
        "code": "ur",
        "name": "Urdu",
        "native_name": "اردو",
        "direction": "rtl",
        "script": "Arabic-Nastaliq",
        "capabilities": {
            "analysis": True,
            "translation": True,
            "stt_whisper": True,
            "stt_browser": True,
            "tts_provider": True,
            "tts_browser": True,
            "notes": "RTL rendering supported. Supported for analysis, translation, and speech."
        }
    },
    "sa": {
        "code": "sa",
        "name": "Sanskrit",
        "native_name": "संस्कृतम्",
        "direction": "ltr",
        "script": "Devanagari",
        "capabilities": {
            "analysis": True,
            "translation": True,
            "stt_whisper": False,
            "stt_browser": False,
            "tts_provider": False,
            "tts_browser": False,
            "notes": "Supported for textual analysis and translation. Standardized speech models are currently unavailable for this dialect."
        }
    },
    "ne": {
        "code": "ne",
        "name": "Nepali",
        "native_name": "नेपाली",
        "direction": "ltr",
        "script": "Devanagari",
        "capabilities": {
            "analysis": True,
            "translation": True,
            "stt_whisper": True,
            "stt_browser": True,
            "tts_provider": True,
            "tts_browser": True,
            "notes": "Supported across analysis, translation, and speech."
        }
    },
    "kok": {
        "code": "kok",
        "name": "Konkani",
        "native_name": "कोंकणी",
        "direction": "ltr",
        "script": "Devanagari",
        "capabilities": {
            "analysis": True,
            "translation": True,
            "stt_whisper": False,
            "stt_browser": False,
            "tts_provider": False,
            "tts_browser": False,
            "notes": "Textual analysis and translation supported. Voice features are currently unavailable for this dialect."
        }
    }
}


def get_all_languages() -> List[Dict[str, Any]]:
    return list(SUPPORTED_LANGUAGES.values())


def is_language_supported(lang_code: str) -> bool:
    return lang_code in SUPPORTED_LANGUAGES


def get_language_capabilities(lang_code: str) -> Dict[str, Any]:
    lang = SUPPORTED_LANGUAGES.get(lang_code)
    if not lang:
        return {
            "supported": False,
            "message": f"Language '{lang_code}' is not supported."
        }
    return {
        "code": lang["code"],
        "name": lang["name"],
        "native_name": lang["native_name"],
        "direction": lang["direction"],
        "capabilities": lang["capabilities"]
    }

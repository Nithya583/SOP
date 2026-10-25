from fastapi import APIRouter
from app.utils.languages import SUPPORTED_LANGUAGES, get_all_languages

router = APIRouter()


@router.get("/languages")
def list_languages():
    return {
        "count": len(SUPPORTED_LANGUAGES),
        "languages": get_all_languages()
    }


@router.get("/languages/capabilities")
def get_capabilities():
    return {
        "supported_count": len(SUPPORTED_LANGUAGES),
        "matrix": SUPPORTED_LANGUAGES
    }

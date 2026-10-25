from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict, Any


class RiskClause(BaseModel):
    id: str = Field(..., description="Unique identifier for the risk item")
    clause_title: str = Field(..., description="Short descriptive title of the clause")
    original_text: str = Field(..., description="The verbatim or excerpted text of the clause from the document")
    risk_level: Literal["low", "medium", "high"] = Field(..., description="Assessed risk level")
    reason: str = Field(..., description="Clear explanation of why this clause is concerning")
    potential_consequences: str = Field(..., description="Practical and legal consequences for the citizen")
    suggested_precautions: str = Field(..., description="Actionable precautions or renegotiation points")
    section_reference: Optional[str] = Field(None, description="Section or clause number if identifiable")


class DocumentAnalysis(BaseModel):
    document_title: str = Field(..., description="Detected title or descriptive name of the document")
    document_type: str = Field(..., description="Type of document (e.g., Rental Agreement, Employment Contract, Legal Notice)")
    detected_language: str = Field(..., description="Primary language of the document")
    summary: str = Field(..., description="Plain-language comprehensive summary of the document")
    key_obligations: List[str] = Field(default_factory=list, description="Explicit duties and responsibilities placed on the citizen")
    important_dates: List[str] = Field(default_factory=list, description="Deadlines, notice periods, commencement, and expiration dates")
    financial_terms: List[str] = Field(default_factory=list, description="Payment schedules, deposits, penalties, interest, and deductions")
    risks: List[RiskClause] = Field(default_factory=list, description="Identified clauses posing legal, financial, or operational risks")
    precautions: List[str] = Field(default_factory=list, description="General safety steps and precautions before signing/acting")
    questions_for_lawyer: List[str] = Field(default_factory=list, description="Targeted questions the citizen should ask an advocate/lawyer")
    limitations: str = Field(..., description="Explicit limitations and uncertainties identified in the AI analysis")


class DocumentMetadata(BaseModel):
    document_id: str
    filename: str
    file_size: int
    content_type: str
    upload_timestamp: float
    character_count: int
    analysis_status: Literal["pending", "analyzing", "completed", "failed"] = "pending"


class AnalysisResponse(BaseModel):
    document_id: str
    filename: str
    analysis: DocumentAnalysis
    disclaimer: str


class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    document_id: Optional[str] = None
    message: str = Field(..., min_length=1, max_length=2000)
    language: str = "en"


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str
    timestamp: float
    citations: Optional[List[str]] = None


class ChatResponse(BaseModel):
    session_id: str
    response: str
    citations: Optional[List[str]] = None
    is_general_legal_info: bool = False
    disclaimer: str


class TranslateRequest(BaseModel):
    session_id: Optional[str] = None
    document_id: Optional[str] = None
    text: Optional[str] = None
    source_language: str = "auto"
    target_language: str
    scope: Literal["full_document", "selected_clause", "clause"] = "selected_clause"
    provider: Optional[Literal["auto", "free_google", "ai_legal"]] = "auto"


class TranslateResponse(BaseModel):
    source_language: str
    target_language: str
    original_text: str
    translated_text: str
    scope: str
    provider: Optional[str] = "Fast Legal Translation"
    disclaimer: str


class SpeechSynthesizeRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=4000)
    language: str = "en"


class SpeechTranscriptionResponse(BaseModel):
    text: str
    detected_language: Optional[str] = None
    duration_seconds: Optional[float] = None
    provider: str


class ErrorDetail(BaseModel):
    code: str
    message: str
    suggestion: Optional[str] = None


class ErrorResponse(BaseModel):
    error: ErrorDetail


class SessionClearResponse(BaseModel):
    success: bool
    cleared_items: Dict[str, Any]
    message: str

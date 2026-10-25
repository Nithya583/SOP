export type RiskLevel = 'low' | 'medium' | 'high';

export interface RiskClause {
  id: string;
  clause_title: string;
  original_text: string;
  risk_level: RiskLevel;
  reason: string;
  potential_consequences: string;
  suggested_precautions: string;
  section_reference?: string | null;
}

export interface DocumentAnalysis {
  document_title: string;
  document_type: string;
  detected_language: string;
  summary: string;
  key_obligations: string[];
  important_dates: string[];
  financial_terms: string[];
  risks: RiskClause[];
  precautions: string[];
  questions_for_lawyer: string[];
  limitations: string;
}

export interface DocumentItem {
  document_id: string;
  filename: string;
  file_size: number;
  character_count?: number;
  analysis?: DocumentAnalysis;
  analysis_status: 'pending' | 'analyzing' | 'completed' | 'failed';
  error_message?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  is_general_legal_info?: boolean;
}

export interface LanguageCapabilities {
  analysis: boolean;
  translation: boolean;
  stt_whisper: boolean;
  stt_browser: boolean;
  tts_provider: boolean;
  tts_browser: boolean;
  notes: string;
}

export interface LanguageConfig {
  code: string;
  name: string;
  native_name: string;
  direction: 'ltr' | 'rtl';
  script: string;
  fontClass: string;
  capabilities: LanguageCapabilities;
}

export interface ApiError {
  code: string;
  message: string;
  suggestion?: string;
}

import type { DocumentAnalysis, ApiError } from '../types';

export class ApiException extends Error {
  code: string;
  suggestion?: string;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'ApiException';
    this.code = error.code;
    this.suggestion = error.suggestion;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errData: any;
    try {
      errData = await res.json();
    } catch {
      throw new ApiException({
        code: `HTTP_${res.status}`,
        message: `Server returned an error (${res.status} ${res.statusText})`,
        suggestion: 'Please verify backend server status.'
      });
    }

    if (errData && errData.error) {
      throw new ApiException(errData.error);
    }

    throw new ApiException({
      code: `HTTP_${res.status}`,
      message: errData.detail || 'An unexpected error occurred.',
      suggestion: 'Please check your input or retry.'
    });
  }
  return res.json();
}

export const api = {
  async getHealth() {
    const res = await fetch('/api/health');
    return handleResponse<any>(res);
  },

  async getLanguages() {
    const res = await fetch('/api/languages');
    return handleResponse<{ count: number; languages: any[] }>(res);
  },

  async getCapabilities() {
    const res = await fetch('/api/languages/capabilities');
    return handleResponse<{ supported_count: number; matrix: Record<string, any> }>(res);
  },

  async analyzeDocument(file: File, language: string, sessionId?: string): Promise<{
    session_id: string;
    document_id: string;
    filename: string;
    file_size: number;
    character_count: number;
    analysis: DocumentAnalysis;
    disclaimer: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language);
    if (sessionId) {
      formData.append('session_id', sessionId);
    }

    const res = await fetch('/api/analyze', {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },

  async translateText(params: {
    text?: string;
    document_id?: string;
    source_language?: string;
    target_language: string;
    scope?: 'full_document' | 'selected_clause';
    provider?: 'free_google' | 'ai_legal' | 'auto';
    session_id?: string;
  }): Promise<{
    source_language: string;
    target_language: string;
    original_text: string;
    translated_text: string;
    scope: string;
    provider?: string;
    disclaimer: string;
  }> {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return handleResponse(res);
  },

  async chat(params: {
    message: string;
    document_id?: string;
    session_id?: string;
    language: string;
  }): Promise<{
    session_id: string;
    response: string;
    is_general_legal_info: boolean;
    disclaimer: string;
  }> {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return handleResponse(res);
  },

  async transcribeAudio(audioBlob: Blob, language?: string): Promise<{
    text: string;
    detected_language?: string;
    duration_seconds?: number;
    provider: string;
  }> {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    if (language) {
      formData.append('language', language);
    }

    const res = await fetch('/api/speech/transcribe', {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },

  async synthesizeSpeech(text: string, language: string): Promise<Blob> {
    const res = await fetch('/api/speech/synthesize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new ApiException(
        errData.error || {
          code: `HTTP_${res.status}`,
          message: 'Speech synthesis request failed.',
        }
      );
    }

    return res.blob();
  },

  async deleteDocument(documentId: string, sessionId?: string): Promise<{
    success: boolean;
    document_id: string;
    message: string;
  }> {
    const url = sessionId
      ? `/api/documents/${documentId}?session_id=${encodeURIComponent(sessionId)}`
      : `/api/documents/${documentId}`;
    const res = await fetch(url, { method: 'DELETE' });
    return handleResponse(res);
  },

  async clearSession(sessionId?: string): Promise<{
    success: boolean;
    cleared_items: any;
    message: string;
  }> {
    const res = await fetch('/api/session/clear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId }),
    });
    return handleResponse(res);
  }
};

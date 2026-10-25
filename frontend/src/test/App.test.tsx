/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import { RiskCard } from '../components/analysis/RiskCard';
import { DocumentUploader } from '../components/upload/DocumentUploader';
import { DocumentTranslator } from '../components/translator/DocumentTranslator';
import { VoiceAssistant } from '../components/voice/VoiceAssistant';
import type { RiskClause } from '../types';
import '../i18n';

describe('AI Legal Guardian Frontend Test Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders Homepage with hero title, statutory disclaimer, and trust badges', () => {
    render(<App />);
    expect(screen.getByText(/Understand Your Legal Documents/i)).toBeInTheDocument();
    expect(screen.getByText(/MANDATORY STATUTORY DISCLAIMER/i)).toBeInTheDocument();
    expect(screen.getByText(/No Account Required/i)).toBeInTheDocument();
    expect(screen.getAllByText(/16 Indian Languages/i).length).toBeGreaterThan(0);
  });

  it('renders upload area with format and size limit guidelines', () => {
    render(<App />);
    expect(screen.getByText(/Supported formats: PDF, DOCX, TXT/i)).toBeInTheDocument();
    expect(screen.getByText(/Maximum file size: 10 MB/i)).toBeInTheDocument();
  });

  it('rejects unsupported file extensions in DocumentUploader', async () => {
    const handleAnalyze = vi.fn();
    render(<DocumentUploader onAnalyze={handleAnalyze} isAnalyzing={false} selectedLanguage="en" />);

    const file = new File(['binary content'], 'script.exe', { type: 'application/x-msdownload' });
    const input = document.getElementById('document-upload-input') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/Unsupported file format/i)).toBeInTheDocument();
    });
    expect(handleAnalyze).not.toHaveBeenCalled();
  });

  it('renders RiskCard with proper risk level badge and expandable text', () => {
    const sampleClause: RiskClause = {
      id: 'risk-1',
      clause_title: 'Unilateral Rent Escalation',
      original_text: 'The Landlord reserves the absolute right to increase rent by 30% at any time without notice.',
      risk_level: 'high',
      reason: 'Permits arbitrary rent spikes with zero advance notice.',
      potential_consequences: 'Tenant may face sudden unaffordable rent hikes.',
      suggested_precautions: 'Cap rent escalation to 5-10% annually with 60 days notice.',
      section_reference: 'Section 4(b)'
    };

    render(
      <RiskCard
        clause={sampleClause}
        onTranslateClause={vi.fn()}
        onAskAboutClause={vi.fn()}
      />
    );

    expect(screen.getByText('Unilateral Rent Escalation')).toBeInTheDocument();
    expect(screen.getByText(/High Risk/i)).toBeInTheDocument();
    expect(screen.getByText(/Section 4\(b\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Permits arbitrary rent spikes/i)).toBeInTheDocument();

    // Click to expand original text
    const expandBtn = screen.getByRole('button', { name: /Original Clause Text/i });
    fireEvent.click(expandBtn);
    expect(screen.getByText(/The Landlord reserves the absolute right to increase rent/i)).toBeInTheDocument();
  });

  it('renders DocumentTranslator and supports language selection', () => {
    render(<DocumentTranslator currentLanguage="hi" />);
    expect(screen.getByText(/Document & Clause Translator/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Translate Text/i })).toBeInTheDocument();
  });

  it('truthfully reports voice capability limitations for unsupported languages', async () => {
    // Odia (or) is marked as unsupported for cloud speech in capability matrix
    render(<VoiceAssistant currentLanguage="or" />);
    const recordBtn = screen.getByRole('button', { name: /Start Speaking/i });
    fireEvent.click(recordBtn);

    await waitFor(() => {
      expect(screen.getByText(/Voice recognition is currently unavailable for this dialect/i)).toBeInTheDocument();
    });
  });

  it('navigates to Privacy controls and can open modal', () => {
    render(<App />);
    const privacyBtn = screen.getByRole('button', { name: /Privacy Controls/i });
    fireEvent.click(privacyBtn);
    expect(screen.getByText(/How AI Legal Guardian Protects Your Privacy/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Zero persistent storage/i).length).toBeGreaterThan(0);
  });
});

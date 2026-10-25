import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText, Calendar, DollarSign, CheckCircle2, HelpCircle,
  ShieldAlert, ArrowRight, Printer, Sparkles, AlertCircle
} from 'lucide-react';
import type { DocumentAnalysis, RiskLevel } from '../../types';
import { RiskCard } from './RiskCard';

interface AnalysisDashboardProps {
  analysis: DocumentAnalysis;
  filename: string;
  onNavigateToTranslate: (clauseText?: string) => void;
  onNavigateToChat: (question?: string) => void;
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({
  analysis,
  filename,
  onNavigateToTranslate,
  onNavigateToChat,
}) => {
  const { t } = useTranslation();
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<'all' | RiskLevel>('all');

  const filteredRisks = analysis.risks.filter(risk => {
    if (selectedRiskFilter === 'all') return true;
    return risk.risk_level === selectedRiskFilter;
  });

  const highRiskCount = analysis.risks.filter(r => r.risk_level === 'high').length;
  const medRiskCount = analysis.risks.filter(r => r.risk_level === 'medium').length;
  const lowRiskCount = analysis.risks.filter(r => r.risk_level === 'low').length;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Banner: Document Overview */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#2B8C87]/10 text-[#2B8C87]">
                {analysis.document_type || 'Legal Document'}
              </span>
              <span className="text-xs text-gray-500 font-medium">
                Detected: {analysis.detected_language}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142D4E] tracking-tight">
              {analysis.document_title || filename}
            </h1>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" />
              <span>Original File: <strong>{filename}</strong></span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigateToTranslate()}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors shadow-sm"
            >
              <span>{t('translator.fullDocTab')} {t('nav.translate')}</span>
              <ArrowRight className="w-4 h-4 text-[#2B8C87]" />
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm flex items-center gap-1.5 transition-colors"
              title="Print or Save PDF of Analysis"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>

        {/* Plain Language Summary */}
        <div>
          <h2 className="text-base font-bold text-[#142D4E] mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#2B8C87]" />
            {t('dashboard.plainSummary')}
          </h2>
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed bg-[#F7F9FC] p-4 rounded-xl border border-gray-100">
            {analysis.summary}
          </p>
        </div>
      </div>

      {/* Grid: Key Obligations & Important Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Obligations */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col">
          <h3 className="text-base font-bold text-[#142D4E] mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#2B8C87]" />
            {t('dashboard.keyObligations')}
          </h3>
          <ul className="space-y-2.5 flex-1 text-sm text-gray-700">
            {analysis.key_obligations.length > 0 ? (
              analysis.key_obligations.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 bg-gray-50/70 p-3 rounded-lg border border-gray-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2B8C87] mt-2 shrink-0"></span>
                  <span className="leading-snug">{item}</span>
                </li>
              ))
            ) : (
              <li className="text-xs text-gray-500 italic p-4">No explicit obligations identified.</li>
            )}
          </ul>
        </div>

        {/* Important Dates & Financial Terms */}
        <div className="space-y-6">
          {/* Important Dates */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-base font-bold text-[#142D4E] mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              {t('dashboard.importantDates')}
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              {analysis.important_dates.length > 0 ? (
                analysis.important_dates.map((dateItem, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100/50">
                    <span className="text-indigo-600 font-bold text-xs mt-0.5">•</span>
                    <span className="leading-snug">{dateItem}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs text-gray-500 italic">No specific deadlines or dates found in document.</li>
              )}
            </ul>
          </div>

          {/* Financial Terms */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-base font-bold text-[#142D4E] mb-3 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              {t('dashboard.financialTerms')}
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              {analysis.financial_terms.length > 0 ? (
                analysis.financial_terms.map((term, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100/50">
                    <span className="text-emerald-600 font-bold text-xs mt-0.5">•</span>
                    <span className="leading-snug">{term}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs text-gray-500 italic">No explicit payment or penalty terms identified.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Risk Overview & Filter Section */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-[#142D4E] flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              {t('dashboard.riskOverview')}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {t('dashboard.riskDisclaimer')}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-lg text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setSelectedRiskFilter('all')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                selectedRiskFilter === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('dashboard.allRisks')} ({analysis.risks.length})
            </button>
            <button
              onClick={() => setSelectedRiskFilter('high')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1 ${
                selectedRiskFilter === 'high'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-red-700 hover:bg-red-50'
              }`}
            >
              <span>{t('dashboard.highRisks')}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-red-100 text-red-800 text-[10px]">
                {highRiskCount}
              </span>
            </button>
            <button
              onClick={() => setSelectedRiskFilter('medium')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1 ${
                selectedRiskFilter === 'medium'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              <span>{t('dashboard.mediumRisks')}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px]">
                {medRiskCount}
              </span>
            </button>
            <button
              onClick={() => setSelectedRiskFilter('low')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1 ${
                selectedRiskFilter === 'low'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <span>{t('dashboard.lowRisks')}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
                {lowRiskCount}
              </span>
            </button>
          </div>
        </div>

        {/* Risk Cards List */}
        <div className="space-y-4">
          {filteredRisks.length > 0 ? (
            filteredRisks.map((risk) => (
              <RiskCard
                key={risk.id}
                clause={risk}
                onTranslateClause={(clauseText) => onNavigateToTranslate(clauseText)}
                onAskAboutClause={(question) => onNavigateToChat(question)}
              />
            ))
          ) : (
            <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500 text-sm">
              {t('dashboard.noRisksFound')}
            </div>
          )}
        </div>
      </div>

      {/* Precautions & Questions to Ask a Lawyer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Signing Precautions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-base font-bold text-[#142D4E] mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#2B8C87]" />
            {t('dashboard.precautions')}
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            {analysis.precautions.map((p, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-[#E7F5F2]/40 p-2.5 rounded-lg border border-[#2B8C87]/20">
                <span className="text-[#2B8C87] font-bold text-xs mt-0.5">✓</span>
                <span className="leading-snug">{p}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Questions for Lawyer */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-base font-bold text-[#142D4E] mb-3 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            {t('dashboard.questionsForLawyer')}
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            {analysis.questions_for_lawyer.map((q, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                <span className="text-blue-600 font-bold text-xs mt-0.5">?</span>
                <span className="leading-snug">{q}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Limitations Box */}
      {analysis.limitations && (
        <div className="p-5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-1">{t('dashboard.limitations')}</span>
            <p>{analysis.limitations}</p>
          </div>
        </div>
      )}
    </div>
  );
};

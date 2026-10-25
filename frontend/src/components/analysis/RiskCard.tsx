import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, ShieldAlert, CheckCircle, ChevronDown, ChevronUp, Languages, MessageSquare, Quote } from 'lucide-react';
import type { RiskClause } from '../../types';

interface RiskCardProps {
  clause: RiskClause;
  onTranslateClause: (clauseText: string) => void;
  onAskAboutClause: (clauseText: string) => void;
}

export const RiskCard: React.FC<RiskCardProps> = ({
  clause,
  onTranslateClause,
  onAskAboutClause,
}) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const badgeConfig = {
    high: {
      bg: 'bg-red-50 text-red-700 border-red-200',
      dot: 'bg-red-500',
      icon: <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />,
      border: 'border-l-4 border-l-red-500',
      label: t('riskLevels.high')
    },
    medium: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
      icon: <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />,
      border: 'border-l-4 border-l-amber-500',
      label: t('riskLevels.medium')
    },
    low: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
      icon: <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />,
      border: 'border-l-4 border-l-emerald-500',
      label: t('riskLevels.low')
    }
  }[clause.risk_level];

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all ${badgeConfig.border}`}>
      <div className="p-5">
        {/* Header: Title, Section, Risk Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            {badgeConfig.icon}
            <h4 className="font-bold text-[#142D4E] text-base truncate">
              {clause.clause_title}
            </h4>
            {clause.section_reference && (
              <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-mono">
                {clause.section_reference}
              </span>
            )}
          </div>

          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeConfig.bg}`}>
            <span className={`w-2 h-2 rounded-full ${badgeConfig.dot}`}></span>
            <span>{badgeConfig.label}</span>
          </span>
        </div>

        {/* Reason / Why concerning */}
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
            {t('dashboard.whyConcerning')}
          </p>
          <p className="text-sm text-gray-800 leading-relaxed">
            {clause.reason}
          </p>
        </div>

        {/* Potential Consequences & Precautions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
            <span className="text-xs font-semibold text-gray-700 block mb-1">
              ⚠️ {t('dashboard.potentialConsequences')}
            </span>
            <p className="text-xs text-gray-600 leading-relaxed">
              {clause.potential_consequences}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[#E7F5F2]/50 border border-[#2B8C87]/20">
            <span className="text-xs font-semibold text-[#142D4E] block mb-1">
              🛡️ {t('dashboard.suggestedPrecautions')}
            </span>
            <p className="text-xs text-gray-700 leading-relaxed">
              {clause.suggested_precautions}
            </p>
          </div>
        </div>

        {/* Collapsible Original Text */}
        <div className="border-t border-gray-100 pt-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-between w-full text-xs font-medium text-gray-500 hover:text-gray-800 py-1 transition-colors"
            aria-expanded={expanded}
          >
            <span className="flex items-center gap-1.5">
              <Quote className="w-3.5 h-3.5 text-gray-400" />
              {t('dashboard.originalText')}
            </span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expanded && (
            <div className="mt-2 p-3 rounded-md bg-gray-50 text-xs text-gray-700 font-mono leading-relaxed border border-gray-200 select-text whitespace-pre-wrap">
              "{clause.original_text}"
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-end gap-2 text-xs">
          <button
            onClick={() => onTranslateClause(clause.original_text)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
          >
            <Languages className="w-3.5 h-3.5 text-[#2B8C87]" />
            <span>{t('dashboard.translateThisClause')}</span>
          </button>

          <button
            onClick={() => onAskAboutClause(`Explain this clause and what it means for me: "${clause.original_text}"`)}
            className="px-3 py-1.5 rounded-lg bg-[#142D4E] hover:bg-[#0B1F35] text-white flex items-center gap-1.5 font-medium transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#2B8C87]" />
            <span>{t('dashboard.askInChat')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

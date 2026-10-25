import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ArrowLeftRight, Copy, Check, Loader2, FileText, Sparkles } from 'lucide-react';
import { SUPPORTED_LANGUAGES, getLanguageByCode } from '../../constants/languages';
import { api, ApiException } from '../../services/api';
import { Alert } from '../ui/Alert';

interface DocumentTranslatorProps {
  initialText?: string;
  documentId?: string;
  activeDocFilename?: string;
  currentLanguage: string;
}

export const DocumentTranslator: React.FC<DocumentTranslatorProps> = ({
  initialText = '',
  documentId,
  activeDocFilename,
  currentLanguage,
}) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'clause' | 'full_document'>(initialText ? 'clause' : 'clause');
  const [sourceText, setSourceText] = useState(initialText);
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState(currentLanguage || 'hi');
  const [provider, setProvider] = useState<'free_google' | 'ai_legal'>('free_google');
  const [usedProvider, setUsedProvider] = useState<string>('Fast Legal Translation');
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<{ message: string; suggestion?: string } | null>(null);
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedTranslated, setCopiedTranslated] = useState(false);

  const targetLangConfig = getLanguageByCode(targetLang);

  const handleTranslate = async () => {
    setError(null);
    if (mode === 'clause' && (!sourceText || !sourceText.trim())) {
      setError({
        message: 'Please provide or paste text to translate.',
        suggestion: 'Type or paste a legal clause or paragraph.'
      });
      return;
    }

    setIsTranslating(true);
    try {
      const payload: any = {
        target_language: targetLang,
        source_language: sourceLang,
        scope: mode === 'full_document' ? 'full_document' : 'selected_clause',
        provider: provider,
      };

      if (mode === 'full_document' && documentId) {
        payload.document_id = documentId;
      } else {
        payload.text = sourceText;
      }

      const res = await api.translateText(payload);
      setTranslatedText(res.translated_text);
      setUsedProvider(res.provider || (provider === 'free_google' ? 'Fast Translation' : 'In-Depth Legal Context'));
      if (mode === 'full_document' && res.original_text && !sourceText) {
        setSourceText(res.original_text);
      }
    } catch (err: any) {
      if (err instanceof ApiException) {
        setError({ message: err.message, suggestion: err.suggestion });
      } else {
        setError({
          message: 'Translation failed unexpectedly.',
          suggestion: 'Ensure the backend server is reachable and configured.'
        });
      }
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = (text: string, isOriginal: boolean) => {
    navigator.clipboard.writeText(text);
    if (isOriginal) {
      setCopiedOriginal(true);
      setTimeout(() => setCopiedOriginal(false), 2000);
    } else {
      setCopiedTranslated(true);
      setTimeout(() => setCopiedTranslated(false), 2000);
    }
  };

  const handleSwap = () => {
    if (sourceLang === 'auto') {
      setSourceLang(targetLang);
      setTargetLang('en');
    } else {
      const temp = sourceLang;
      setSourceLang(targetLang);
      setTargetLang(temp);
    }
    const tempText = sourceText;
    setSourceText(translatedText);
    setTranslatedText(tempText);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title & Mode Switcher */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#142D4E] flex items-center gap-2">
              <Globe className="w-6 h-6 text-[#2B8C87]" />
              {t('translator.title')}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {t('translator.subtitle')}
            </p>
          </div>

          {/* Mode Selector Tabs */}
          <div className="inline-flex rounded-lg bg-gray-100 p-1 self-start sm:self-auto text-xs font-semibold">
            <button
              onClick={() => setMode('clause')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                mode === 'clause'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('translator.clauseTab')}
            </button>
            <button
              onClick={() => setMode('full_document')}
              disabled={!documentId}
              className={`px-3 py-1.5 rounded-md transition-all ${
                mode === 'full_document'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : !documentId
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title={!documentId ? 'Upload a document first to use full document translation' : ''}
            >
              {t('translator.fullDocTab')}
            </button>
          </div>
        </div>

        {activeDocFilename && (
          <div className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#2B8C87]" />
            <span>Active Document Context: <strong>{activeDocFilename}</strong></span>
          </div>
        )}

        {/* Language Controls Bar */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            {/* Source Lang */}
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500 font-medium">{t('translator.sourceLang')}:</span>
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-800 text-xs font-medium focus:ring-1 focus:ring-[#2B8C87]"
              >
                <option value="auto">Auto Detect</option>
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.native_name} ({l.name})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSwap}
              disabled={sourceLang === 'auto'}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-colors"
              title="Swap Languages"
              aria-label="Swap source and target language"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </button>

            {/* Target Lang */}
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500 font-medium">{t('translator.targetLang')}:</span>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-[#2B8C87] bg-white text-[#142D4E] text-xs font-semibold focus:ring-1 focus:ring-[#2B8C87]"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.native_name} ({l.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleTranslate}
            disabled={isTranslating}
            className="px-5 py-2 rounded-lg bg-[#2B8C87] hover:bg-[#257672] text-white text-xs font-bold shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {isTranslating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{t('translator.translating')}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('translator.translateBtn')}</span>
              </>
            )}
          </button>
        </div>

        {/* Translation Mode Selector */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-semibold">Mode:</span>
            <div className="inline-flex p-0.5 bg-gray-100 rounded-lg">
              <button
                type="button"
                onClick={() => setProvider('free_google')}
                className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 font-medium ${
                  provider === 'free_google'
                    ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>⚡ Fast Translation</span>
              </button>
              <button
                type="button"
                onClick={() => setProvider('ai_legal')}
                className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 font-medium ${
                  provider === 'ai_legal'
                    ? 'bg-white text-[#2B8C87] shadow-xs font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Sparkles className="w-3 h-3 text-[#2B8C87]" />
                <span>🧠 In-Depth Legal Context</span>
              </button>
            </div>
          </div>
          <span className="text-[11px] text-gray-500 italic">
            {provider === 'free_google' ? 'High-speed translation across all 16 Indian languages' : 'Deep clause comprehension preserving legal definitions'}
          </span>
        </div>
      </div>

      {error && (
        <Alert
          type="error"
          message={error.message}
          suggestion={error.suggestion}
          onClose={() => setError(null)}
        />
      )}

      {/* Side-by-side Translation Interface */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source Box */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-96">
          <div className="p-3 bg-gray-50 border-b border-gray-100 rounded-t-2xl flex items-center justify-between text-xs font-semibold text-gray-700">
            <span>{t('translator.originalLabel')}</span>
            {sourceText && (
              <button
                onClick={() => handleCopy(sourceText, true)}
                className="flex items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors"
                title="Copy original"
              >
                {copiedOriginal ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedOriginal ? t('translator.copied') : t('translator.copy')}</span>
              </button>
            )}
          </div>
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder={
              mode === 'full_document' && !sourceText
                ? 'Click "Translate Text" above to extract and translate the entire active document.'
                : t('translator.selectClausePrompt')
            }
            className="w-full flex-1 p-4 rounded-b-2xl resize-none text-sm leading-relaxed text-gray-800 focus:outline-none placeholder:text-gray-400"
          />
        </div>

        {/* Target Translation Box */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-96">
          <div className="p-3 bg-[#E7F5F2] border-b border-[#2B8C87]/20 rounded-t-2xl flex items-center justify-between text-xs font-semibold text-[#142D4E]">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span>{t('translator.translatedLabel')}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/80 text-[#2B8C87]">
                {targetLangConfig.native_name}
              </span>
              {usedProvider && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                  {usedProvider}
                </span>
              )}
            </div>
            {translatedText && (
              <button
                onClick={() => handleCopy(translatedText, false)}
                className="flex items-center gap-1 text-[#2B8C87] hover:text-[#142D4E] transition-colors"
                title="Copy translation"
              >
                {copiedTranslated ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedTranslated ? t('translator.copied') : t('translator.copy')}</span>
              </button>
            )}
          </div>
          <div
            dir={targetLangConfig.direction}
            className={`w-full flex-1 p-4 rounded-b-2xl overflow-y-auto text-sm leading-relaxed text-gray-800 ${
              targetLangConfig.direction === 'rtl' ? 'font-urdu text-base' : targetLangConfig.fontClass
            } select-text whitespace-pre-wrap`}
          >
            {isTranslating ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#2B8C87]" />
                <span className="text-xs font-medium">{t('translator.translating')}</span>
              </div>
            ) : translatedText ? (
              translatedText
            ) : (
              <span className="text-gray-400 text-xs italic">
                Translation will appear here upon clicking Translate.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Legal Translation Disclaimer */}
      <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-500 leading-relaxed text-center">
        {t('translator.disclaimer')}
      </div>
    </div>
  );
};

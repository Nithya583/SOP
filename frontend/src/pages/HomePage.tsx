import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, FileText, ArrowRight, Trash2 } from 'lucide-react';
import { HeroSection } from '../components/home/HeroSection';
import { DocumentUploader } from '../components/upload/DocumentUploader';
import type { DocumentItem } from '../types';

interface HomePageProps {
  onAnalyze: (file: File) => Promise<void>;
  isAnalyzing: boolean;
  selectedLanguage: string;
  activeDocuments: DocumentItem[];
  onViewAnalysis: (docId: string) => void;
  onTranslateDoc: (docId: string) => void;
  onDeleteDoc: (docId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onAnalyze,
  isAnalyzing,
  selectedLanguage,
  activeDocuments,
  onViewAnalysis,
  onTranslateDoc,
  onDeleteDoc,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <HeroSection
        onStartAnalysis={() => {
          const uploadEl = document.getElementById('uploader-anchor');
          uploadEl?.scrollIntoView({ behavior: 'smooth' });
        }}
        onExploreFeatures={() => {
          const featuresEl = document.getElementById('features-section');
          featuresEl?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Mandatory Prominent Statutory Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm leading-relaxed flex items-start gap-3 shadow-2xs">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-0.5">Important Legal Disclaimer:</span>
          {t('disclaimer.bannerText')}
        </div>
      </div>

      {/* Uploader Section */}
      <div id="uploader-anchor" className="pt-2">
        <DocumentUploader
          onAnalyze={onAnalyze}
          isAnalyzing={isAnalyzing}
          selectedLanguage={selectedLanguage}
        />
      </div>

      {/* Active Session Document Library (Current Session) */}
      {activeDocuments.length > 0 && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-xl font-bold text-[#142D4E]">
                {t('sessionDocs.title')}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {t('sessionDocs.activeDocsCount', { count: activeDocuments.length })} • Kept strictly in temporary memory
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeDocuments.map((doc) => (
              <div
                key={doc.document_id}
                className="p-5 rounded-xl border border-gray-200 bg-gray-50/70 hover:bg-gray-50 transition-colors flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#2B8C87]/10 text-[#2B8C87] flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <h4 className="font-bold text-[#142D4E] text-sm truncate">
                      {doc.filename}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Status: <span className="font-semibold capitalize text-emerald-600">{doc.analysis_status}</span>
                      {doc.character_count ? ` • ${doc.character_count.toLocaleString()} chars` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewAnalysis(doc.document_id)}
                      className="px-3 py-1.5 rounded-lg bg-[#142D4E] hover:bg-[#0B1F35] text-white font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <span>{t('sessionDocs.viewAnalysis')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onTranslateDoc(doc.document_id)}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium transition-colors"
                    >
                      {t('sessionDocs.translateDoc')}
                    </button>
                  </div>

                  <button
                    onClick={() => onDeleteDoc(doc.document_id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title={t('sessionDocs.deleteDoc')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

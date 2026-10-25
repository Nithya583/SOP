import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText, ShieldCheck, Languages, Lock, Sparkles,
  ArrowRight, MessageSquare, ShieldAlert
} from 'lucide-react';

interface HeroSectionProps {
  onStartAnalysis: () => void;
  onExploreFeatures: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartAnalysis,
  onExploreFeatures,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-12">
      {/* Hero Header Area */}
      <div className="text-center max-w-3xl mx-auto pt-6 sm:pt-10">
        {/* Trust Badges Row */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E7F5F2] text-[#2B8C87] border border-[#2B8C87]/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t('hero.badgeNoAccount')}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Lock className="w-3.5 h-3.5" />
            <span>{t('hero.badgePrivacy')}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Languages className="w-3.5 h-3.5" />
            <span>{t('hero.badgeLanguages')}</span>
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-[#142D4E] tracking-tight leading-tight sm:leading-tight mb-6">
          {t('hero.title')}
        </h1>

        <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-8">
          {t('hero.subtitle')}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onStartAnalysis}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#142D4E] hover:bg-[#0B1F35] text-white font-bold text-base shadow-md flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            <Sparkles className="w-5 h-5 text-[#2B8C87]" />
            <span>{t('hero.analyzeBtn')}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          <button
            onClick={onExploreFeatures}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-base transition-colors"
          >
            {t('hero.exploreFeaturesBtn')}
          </button>
        </div>
      </div>

      {/* Feature Value Cards Grid */}
      <div id="features-section" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-[#E7F5F2] text-[#2B8C87] flex items-center justify-center mb-4">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-[#142D4E] text-base mb-2">
            {t('hero.card1Title')}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            {t('hero.card1Desc')}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-[#142D4E] text-base mb-2">
            {t('hero.card2Title')}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            {t('hero.card2Desc')}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
            <Languages className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-[#142D4E] text-base mb-2">
            {t('hero.card3Title')}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            {t('hero.card3Desc')}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-[#142D4E] text-base mb-2">
            {t('hero.card4Title')}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            {t('hero.card4Desc')}
          </p>
        </div>
      </div>
    </div>
  );
};

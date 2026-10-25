import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Scale, ShieldCheck, Languages, Menu, X, Trash2, Mic, MessageSquare, FileText, Globe } from 'lucide-react';
import { SUPPORTED_LANGUAGES, getLanguageByCode } from '../../constants/languages';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  documentCount: number;
  onOpenPrivacyModal: () => void;
  onClearSession: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  documentCount,
  onOpenPrivacyModal,
  onClearSession,
}) => {
  const { t, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const currentLang = getLanguageByCode(i18n.language);

  const navItems = [
    { id: 'home', label: t('nav.home'), icon: Scale },
    { id: 'analyze', label: t('nav.analyze'), icon: FileText },
    { id: 'translate', label: t('nav.translate'), icon: Globe },
    { id: 'chat', label: t('nav.chat'), icon: MessageSquare },
    { id: 'voice', label: t('nav.voice'), icon: Mic },
  ];

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    setLangDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#142D4E] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') setActiveTab('home'); }}
            aria-label="AI Legal Guardian Home"
          >
            <div className="w-10 h-10 rounded-lg bg-[#2B8C87] flex items-center justify-center shadow-inner group-hover:bg-[#257672] transition-colors">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight block text-white leading-tight">
                AI Legal Guardian
              </span>
              <span className="text-[10px] text-[#2B8C87] uppercase tracking-wider font-semibold block">
                Empowering Citizens
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${
                    isActive
                      ? 'bg-[#0B1F35] text-white shadow-sm border-b-2 border-[#2B8C87]'
                      : 'text-gray-200 hover:text-white hover:bg-white/10'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#2B8C87]' : 'text-gray-300'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Actions: Language Selector & Privacy */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Active Session Badge */}
            {documentCount > 0 && (
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#2B8C87]/20 text-[#E7F5F2] border border-[#2B8C87]/40"
                title={`${documentCount} document(s) in active temporary memory`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{documentCount} Active Doc</span>
              </span>
            )}

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm bg-white/10 hover:bg-white/15 text-white transition-colors border border-white/10"
                aria-haspopup="true"
                aria-expanded={langDropdownOpen}
                aria-label="Select Language"
              >
                <Languages className="w-4 h-4 text-[#2B8C87]" />
                <span className="font-medium">{currentLang.native_name}</span>
                <span className="text-xs text-gray-300">({currentLang.code.toUpperCase()})</span>
              </button>

              {langDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-white text-gray-800 rounded-lg shadow-xl py-2 z-50 border border-gray-100 max-h-96 overflow-y-auto"
                  role="menu"
                >
                  <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    16 Supported Languages
                  </div>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-[#E7F5F2] transition-colors ${
                        i18n.language === lang.code ? 'bg-[#E7F5F2] text-[#142D4E] font-bold' : 'text-gray-700'
                      }`}
                      role="menuitem"
                    >
                      <div>
                        <span className="block font-medium">{lang.native_name}</span>
                        <span className="text-xs text-gray-500">{lang.name}</span>
                      </div>
                      {i18n.language === lang.code && (
                        <span className="w-2 h-2 rounded-full bg-[#2B8C87]"></span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Privacy Controls Modal Button */}
            <button
              onClick={onOpenPrivacyModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm bg-white/10 hover:bg-white/15 text-white transition-colors border border-white/10"
              title="Privacy Controls & Data Deletion"
              aria-label="Privacy Controls"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{t('nav.privacy')}</span>
            </button>

            {/* Clear Session Quick Action */}
            {documentCount > 0 && (
              <button
                onClick={onClearSession}
                className="p-1.5 rounded-md text-red-300 hover:text-white hover:bg-red-900/50 transition-colors"
                title="End Session & Purge All Memory"
                aria-label="End Session & Purge Data"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10"
              aria-label="Select Language"
            >
              <Languages className="w-5 h-5 text-[#2B8C87]" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0B1F35] border-t border-white/10 px-4 pt-3 pb-6 space-y-3">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-base font-medium ${
                    isActive ? 'bg-[#2B8C87] text-white' : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            <button
              onClick={() => {
                onOpenPrivacyModal();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm bg-white/10 text-white"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{t('nav.privacy')}</span>
            </button>

            {documentCount > 0 && (
              <button
                onClick={() => {
                  onClearSession();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm bg-red-900/40 text-red-200"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
                <span>{t('nav.clearSession')}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

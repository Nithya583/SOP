import React from 'react';
import { ShieldAlert, Scale, Heart } from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

export const Footer: React.FC = () => {

  return (
    <footer className="bg-[#0B1F35] text-gray-300 border-t border-gray-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded bg-[#2B8C87] flex items-center justify-center">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white text-lg">AI Legal Guardian</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Empowering Indian citizens with plain-language comprehension of contracts, notices, and agreements across 16 Indian languages.
            </p>
          </div>

          {/* Privacy Architecture Notice */}
          <div>
            <h4 className="text-white font-semibold mb-3 flex items-center gap-1.5 text-sm">
              <ShieldAlert className="w-4 h-4 text-[#2B8C87]" />
              Zero Persistent Storage
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              We do not use accounts, passwords, or persistent databases. Uploaded documents and chats exist strictly in temporary RAM during your session and expire after 30 minutes of inactivity.
            </p>
          </div>

          {/* Educational Scope */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">
              Jurisdiction & Legal Notice
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Designed for contracts and legal documents governed under the laws of the Republic of India. AI analysis is educational and does not constitute statutory legal representation.
            </p>
          </div>
        </div>

        {/* Prominent Legal Disclaimer Banner (Mandatory per Prompt) */}
        <div className="p-4 rounded-lg bg-gray-900/80 border border-amber-500/30 text-amber-200/90 text-xs leading-relaxed mb-8 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-300 block mb-1">MANDATORY STATUTORY DISCLAIMER</span>
            AI Legal Guardian provides general legal information and AI-generated explanations for educational purposes only. It is not a law firm and does not provide legal representation or a substitute for advice from a qualified lawyer in India. AI analysis may be incomplete or inaccurate. Always verify important legal matters with a licensed advocate before signing a document or taking legal action.
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <p>© {CURRENT_YEAR} AI Legal Guardian. Built for Indian Citizens.</p>
          <div className="flex items-center gap-4">
            <span>No Cookies Tracked</span>
            <span>•</span>
            <span>No Database Stored</span>
            <span>•</span>
            <span className="flex items-center gap-1">Made with <Heart className="w-3 h-3 text-red-400 fill-current" /> for India</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

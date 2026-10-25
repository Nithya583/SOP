import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Trash2, Clock, ServerOff, CheckCircle, X, ShieldAlert } from 'lucide-react';
import type { DocumentItem } from '../../types';

interface PrivacyControlsProps {
  isOpen: boolean;
  onClose: () => void;
  activeDocuments: DocumentItem[];
  onDeleteDocument: (docId: string) => Promise<void>;
  onClearSession: () => Promise<void>;
}

export const PrivacyControls: React.FC<PrivacyControlsProps> = ({
  isOpen,
  onClose,
  activeDocuments,
  onDeleteDocument,
  onClearSession,
}) => {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);
  const [clearedNotice, setClearedNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClearAll = async () => {
    if (window.confirm(t('privacy.confirmClear'))) {
      setIsDeleting(true);
      try {
        await onClearSession();
        setClearedNotice(t('privacy.dataClearedSuccess'));
        setTimeout(() => {
          setClearedNotice(null);
          onClose();
        }, 1500);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleDeleteSingleDoc = async (docId: string) => {
    if (window.confirm(t('sessionDocs.confirmDelete'))) {
      setIsDeleting(true);
      try {
        await onDeleteDocument(docId);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-6 bg-[#0B1F35] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#2B8C87] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">
                {t('privacy.modalTitle')}
              </h3>
              <p className="text-xs text-gray-300">
                Guaranteed zero persistent storage & user-controlled deletion
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {clearedNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>{clearedNotice}</span>
            </div>
          )}

          {/* Privacy Architecture Points */}
          <div>
            <h4 className="font-bold text-sm text-[#142D4E] mb-3">
              {t('privacy.modelExplanationTitle')}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-2.5">
                <ServerOff className="w-4 h-4 text-[#2B8C87] shrink-0 mt-0.5" />
                <span className="text-gray-700">{t('privacy.rule1')}</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#2B8C87] shrink-0 mt-0.5" />
                <span className="text-gray-700">{t('privacy.rule2')}</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#2B8C87] shrink-0 mt-0.5" />
                <span className="text-gray-700">{t('privacy.rule3')}</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-2.5">
                <Trash2 className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span className="text-gray-700">{t('privacy.rule4')}</span>
              </div>
            </div>
          </div>

          {/* Active Session Documents */}
          <div className="border-t border-gray-100 pt-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-sm text-[#142D4E]">
                Active Memory Documents ({activeDocuments.length})
              </h4>
              <span className="text-[11px] text-gray-500">
                Purged immediately upon deletion
              </span>
            </div>

            {activeDocuments.length > 0 ? (
              <div className="space-y-2">
                {activeDocuments.map((doc) => (
                  <div
                    key={doc.document_id}
                    className="p-3 rounded-lg border border-gray-200 bg-gray-50/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="truncate">
                      <span className="font-semibold text-gray-800 block truncate">
                        {doc.filename}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        ID: {doc.document_id.substring(0, 8)}... • Status: {doc.analysis_status}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteSingleDoc(doc.document_id)}
                      disabled={isDeleting}
                      className="px-2.5 py-1.5 rounded bg-red-50 hover:bg-red-100 text-red-700 font-semibold border border-red-200 flex items-center gap-1 transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t('sessionDocs.deleteDoc')}</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic p-3 bg-gray-50 rounded-lg text-center">
                {t('sessionDocs.noDocs')}
              </p>
            )}
          </div>

          {/* Transparent Provider Retention Policy Notice */}
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-1">External AI Provider Transparency:</span>
              {t('privacy.providerRetentionNotice')}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handleClearAll}
            disabled={isDeleting}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t('privacy.endSessionBtn')}</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-semibold transition-colors"
          >
            {t('privacy.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

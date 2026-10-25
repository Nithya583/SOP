import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { UploadCloud, FileText, X, Loader2, Sparkles } from 'lucide-react';
import { Alert } from '../ui/Alert';

interface DocumentUploaderProps {
  onAnalyze: (file: File) => Promise<void>;
  isAnalyzing: boolean;
  selectedLanguage: string;
}

const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt'];

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onAnalyze,
  isAnalyzing,
  selectedLanguage,
}) => {
  const { t } = useTranslation();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<{ message: string; suggestion?: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (file: File) => {
    setValidationError(null);

    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setValidationError({
        message: t('upload.unsupportedType'),
        suggestion: 'Please upload a PDF (.pdf), Microsoft Word (.docx), or plain text (.txt) file.'
      });
      return false;
    }

    if (file.size <= 0) {
      setValidationError({
        message: 'The selected file is empty (0 bytes).',
        suggestion: 'Please select a document that contains readable text.'
      });
      return false;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setValidationError({
        message: t('upload.fileTooLarge'),
        suggestion: `Please compress or trim your document so it is under ${MAX_SIZE_MB} MB.`
      });
      return false;
    }

    setSelectedFile(file);
    return true;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setValidationError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setValidationError({
        message: t('upload.selectFileFirst'),
        suggestion: 'Drag and drop or browse for a document.'
      });
      return;
    }
    await onAnalyze(selectedFile);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Upload Box */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#142D4E] tracking-tight">
              {t('upload.title')}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Supports rental agreements, employment contracts, notices, and legal paperwork
            </p>
          </div>

          {validationError && (
            <div className="mb-6">
              <Alert
                type="error"
                message={validationError.message}
                suggestion={validationError.suggestion}
                onClose={() => setValidationError(null)}
              />
            </div>
          )}

          {/* Drag & Drop Zone */}
          {!selectedFile ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-[#2B8C87] bg-[#E7F5F2]/50 scale-[1.01]'
                  : 'border-gray-300 hover:border-[#2B8C87] hover:bg-gray-50/80'
              }`}
              tabIndex={0}
              role="button"
              aria-label="Upload document dropzone"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  inputRef.current?.click();
                }
              }}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleChange}
                className="hidden"
                id="document-upload-input"
              />
              <div className="w-16 h-16 rounded-full bg-[#E7F5F2] flex items-center justify-center mx-auto mb-4 text-[#2B8C87]">
                <UploadCloud className="w-8 h-8" />
              </div>
              <p className="text-base font-semibold text-gray-700">
                {t('upload.dropzoneText')}{' '}
                <span className="text-[#2B8C87] underline font-bold">
                  {t('upload.browseBtn')}
                </span>
              </p>
              <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-500 font-medium">
                <span>{t('upload.supportedFormats')}</span>
                <span>•</span>
                <span>{t('upload.sizeLimit')}</span>
              </div>
            </div>
          ) : (
            /* Selected File State */
            <div className="p-4 sm:p-6 rounded-xl border border-gray-200 bg-gray-50/70 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-lg bg-[#2B8C87]/10 flex items-center justify-center text-[#2B8C87] shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="truncate">
                    <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(selectedFile.size)} • Ready for analysis
                    </p>
                  </div>
                </div>

                {!isAnalyzing && (
                  <button
                    onClick={handleRemove}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title={t('upload.remove')}
                    aria-label="Remove selected document"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Progress / Status Indicator */}
              {isAnalyzing && (
                <div className="pt-2">
                  <div className="flex items-center gap-3 text-sm text-[#2B8C87] font-medium">
                    <Loader2 className="w-5 h-5 animate-spin text-[#2B8C87]" />
                    <span>{t('upload.processing')}</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-[#2B8C87] h-full rounded-full animate-pulse w-3/4"></div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {!isAnalyzing && (
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    {t('upload.remove')}
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#142D4E] hover:bg-[#0B1F35] text-white text-sm font-semibold shadow-sm flex items-center justify-center gap-2 transition-all hover:shadow"
                  >
                    <Sparkles className="w-4 h-4 text-[#2B8C87]" />
                    <span>{t('upload.analyzeAction')}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Informational Sub-banner */}
        <div className="px-6 py-3 bg-[#E7F5F2]/40 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Target Output Language: <strong>{selectedLanguage.toUpperCase()}</strong></span>
          </div>
          <span>Temporary In-Memory Processing Only</span>
        </div>
      </div>
    </div>
  );
};

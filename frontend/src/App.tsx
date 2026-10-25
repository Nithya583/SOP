import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { AnalysisDashboard } from './components/analysis/AnalysisDashboard';
import { DocumentUploader } from './components/upload/DocumentUploader';
import { DocumentTranslator } from './components/translator/DocumentTranslator';
import { LegalChatbot } from './components/chat/LegalChatbot';
import { VoiceAssistant } from './components/voice/VoiceAssistant';
import { PrivacyControls } from './components/privacy/PrivacyControls';
import { Alert } from './components/ui/Alert';
import type { DocumentItem, DocumentAnalysis } from './types';
import { api, ApiException } from './services/api';
import './i18n';

export const App: React.FC = () => {
  const { i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>('home');
  const [sessionId, setSessionId] = useState<string>('');
  const [activeDocuments, setActiveDocuments] = useState<DocumentItem[]>([]);
  const [currentDocumentId, setCurrentDocumentId] = useState<string | undefined>(undefined);
  const [currentAnalysis, setCurrentAnalysis] = useState<DocumentAnalysis | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<{ message: string; suggestion?: string } | null>(null);
  const [privacyModalOpen, setPrivacyModalOpen] = useState<boolean>(false);

  // Cross-component forwarding states
  const [translatorInitialText, setTranslatorInitialText] = useState<string>('');
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string>('');

  // Best-effort cleanup on window unload per Section 10
  useEffect(() => {
    const handleUnload = () => {
      if (sessionId) {
        navigator.sendBeacon('/api/session/clear', JSON.stringify({ session_id: sessionId }));
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [sessionId]);

  const activeDoc = activeDocuments.find((d) => d.document_id === currentDocumentId);

  const handleAnalyze = async (file: File) => {
    setIsAnalyzing(true);
    setGlobalError(null);

    try {
      const res = await api.analyzeDocument(file, i18n.language, sessionId);
      setSessionId(res.session_id);
      setCurrentDocumentId(res.document_id);
      setCurrentAnalysis(res.analysis);

      const newDoc: DocumentItem = {
        document_id: res.document_id,
        filename: res.filename,
        file_size: res.file_size,
        character_count: res.character_count,
        analysis: res.analysis,
        analysis_status: 'completed',
      };

      setActiveDocuments((prev) => [newDoc, ...prev.filter((d) => d.document_id !== res.document_id)]);
      setActiveTab('analyze');
    } catch (err: any) {
      if (err instanceof ApiException) {
        setGlobalError({
          message: err.message,
          suggestion: err.suggestion,
        });
      } else {
        setGlobalError({
          message: 'Failed to analyze document.',
          suggestion: 'Ensure the backend service is running and reachable.',
        });
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      await api.deleteDocument(docId, sessionId);
      setActiveDocuments((prev) => prev.filter((d) => d.document_id !== docId));
      if (currentDocumentId === docId) {
        setCurrentDocumentId(undefined);
        setCurrentAnalysis(null);
        if (activeTab === 'analyze') {
          setActiveTab('home');
        }
      }
    } catch (err: any) {
      setGlobalError({
        message: `Failed to delete document: ${err.message}`,
        suggestion: 'The document may have already been purged from memory.',
      });
    }
  };

  const handleClearSession = async () => {
    try {
      await api.clearSession(sessionId);
      setActiveDocuments([]);
      setCurrentDocumentId(undefined);
      setCurrentAnalysis(null);
      setTranslatorInitialText('');
      setChatInitialPrompt('');
      setActiveTab('home');
    } catch (err: any) {
      setGlobalError({
        message: `Session termination error: ${err.message}`,
        suggestion: 'Server memory cleanup failed or session was already closed.',
      });
    }
  };

  const handleNavigateToTranslate = (clauseText?: string) => {
    if (clauseText) {
      setTranslatorInitialText(clauseText);
    }
    setActiveTab('translate');
  };

  const handleNavigateToChat = (question?: string) => {
    if (question) {
      setChatInitialPrompt(question);
    }
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC] text-[#1D2939]">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        documentCount={activeDocuments.length}
        onOpenPrivacyModal={() => setPrivacyModalOpen(true)}
        onClearSession={handleClearSession}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Global Error Banner */}
        {globalError && (
          <div className="mb-8">
            <Alert
              type="error"
              title="System Notice"
              message={globalError.message}
              suggestion={globalError.suggestion}
              onClose={() => setGlobalError(null)}
            />
          </div>
        )}

        {/* Tab 1: Home */}
        {activeTab === 'home' && (
          <HomePage
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            selectedLanguage={i18n.language}
            activeDocuments={activeDocuments}
            onViewAnalysis={(docId) => {
              const doc = activeDocuments.find((d) => d.document_id === docId);
              if (doc && doc.analysis) {
                setCurrentDocumentId(docId);
                setCurrentAnalysis(doc.analysis);
                setActiveTab('analyze');
              }
            }}
            onTranslateDoc={(docId) => {
              setCurrentDocumentId(docId);
              setActiveTab('translate');
            }}
            onDeleteDoc={handleDeleteDocument}
          />
        )}

        {/* Tab 2: Document Analysis Dashboard */}
        {activeTab === 'analyze' && (
          <div className="space-y-6">
            {currentAnalysis && activeDoc ? (
              <AnalysisDashboard
                analysis={currentAnalysis}
                filename={activeDoc.filename}
                onNavigateToTranslate={handleNavigateToTranslate}
                onNavigateToChat={handleNavigateToChat}
              />
            ) : (
              <div className="py-8">
                <DocumentUploader
                  onAnalyze={handleAnalyze}
                  isAnalyzing={isAnalyzing}
                  selectedLanguage={i18n.language}
                />
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Document & Clause Translator */}
        {activeTab === 'translate' && (
          <DocumentTranslator
            initialText={translatorInitialText}
            documentId={currentDocumentId}
            activeDocFilename={activeDoc?.filename}
            currentLanguage={i18n.language}
          />
        )}

        {/* Tab 4: Legal Assistant Chatbot */}
        {activeTab === 'chat' && (
          <LegalChatbot
            documentId={currentDocumentId}
            activeDocFilename={activeDoc?.filename}
            sessionId={sessionId}
            currentLanguage={i18n.language}
            initialPrompt={chatInitialPrompt}
          />
        )}

        {/* Tab 5: Voice Assistant */}
        {activeTab === 'voice' && (
          <VoiceAssistant
            currentLanguage={i18n.language}
            onSendToChat={(text) => {
              setChatInitialPrompt(text);
              setActiveTab('chat');
            }}
            onSendToTranslate={(text) => {
              setTranslatorInitialText(text);
              setActiveTab('translate');
            }}
          />
        )}
      </main>

      {/* Privacy Modal */}
      <PrivacyControls
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
        activeDocuments={activeDocuments}
        onDeleteDocument={handleDeleteDocument}
        onClearSession={handleClearSession}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;

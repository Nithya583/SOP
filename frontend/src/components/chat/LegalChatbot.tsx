import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MessageSquare, Send, Trash2, Bot, User, Loader2, Sparkles
} from 'lucide-react';
import type { ChatMessage } from '../../types';
import { api, ApiException } from '../../services/api';
import { Alert } from '../ui/Alert';

interface LegalChatbotProps {
  documentId?: string;
  activeDocFilename?: string;
  sessionId?: string;
  currentLanguage: string;
  initialPrompt?: string;
}

export const LegalChatbot: React.FC<LegalChatbotProps> = ({
  documentId,
  activeDocFilename,
  sessionId,
  currentLanguage,
  initialPrompt = '',
}) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState(initialPrompt);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ message: string; suggestion?: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPrompt) {
      setInput(initialPrompt);
    }
  }, [initialPrompt]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (messageToSend?: string) => {
    const text = (messageToSend || input).trim();
    if (!text || isLoading) return;

    setError(null);
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.chat({
        message: text,
        document_id: documentId,
        session_id: sessionId,
        language: currentLanguage,
      });

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: res.response,
        timestamp: Date.now(),
        is_general_legal_info: res.is_general_legal_info,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      if (err instanceof ApiException) {
        setError({ message: err.message, suggestion: err.suggestion });
      } else {
        setError({
          message: 'Chat service failed to respond.',
          suggestion: 'Ensure backend server is running and AI key is configured.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setError(null);
  };

  const suggestedChips = [
    t('chat.chipObligations'),
    t('chat.chipRisks'),
    t('chat.chipTermination'),
    t('chat.chipPenalties'),
    t('chat.chipBeforeSigning'),
  ];

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[700px]">
      {/* Header */}
      <div className="p-4 sm:p-5 bg-[#142D4E] text-white flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#2B8C87] flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-base sm:text-lg leading-tight">
              {t('chat.title')}
            </h2>
            <p className="text-xs text-gray-300">
              {documentId && activeDocFilename
                ? t('chat.docContextActive', { filename: activeDocFilename })
                : t('chat.noDocContext')}
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('chat.clearChat')}</span>
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-[#F7F9FC]">
        {/* Welcome Empty State */}
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto py-8">
            <div className="w-16 h-16 rounded-full bg-[#E7F5F2] flex items-center justify-center text-[#2B8C87] mb-4 shadow-sm">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-1">
              Ask Any Question About Your Legal Paperwork
            </h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              {documentId
                ? 'Your uploaded contract is loaded into temporary memory. Ask about ambiguous obligations, penalties, or risks.'
                : 'No document uploaded yet. You can still ask general legal terminology and concept questions under Indian law.'}
            </p>

            {/* Suggested Chips */}
            <div className="w-full space-y-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                {t('chat.suggestedTitle')}
              </span>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestedChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(chip)}
                    className="px-3 py-1.5 rounded-full text-xs bg-white hover:bg-[#E7F5F2] text-gray-700 hover:text-[#142D4E] border border-gray-200 hover:border-[#2B8C87] transition-all shadow-2xs font-medium"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message Bubble List */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-[#142D4E] text-[#2B8C87] flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs ${
                msg.role === 'user'
                  ? 'bg-[#142D4E] text-white rounded-tr-none'
                  : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
              }`}
            >
              {msg.is_general_legal_info && (
                <div className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 mb-2 inline-block">
                  General Indian Legal Concept (No Document Uploaded)
                </div>
              )}
              <div className="whitespace-pre-wrap select-text">{msg.content}</div>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#142D4E] text-[#2B8C87] flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-200 flex items-center gap-2 text-xs text-gray-500 shadow-xs">
              <Loader2 className="w-4 h-4 animate-spin text-[#2B8C87]" />
              <span>Analyzing document and generating grounded response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error alert if any */}
      {error && (
        <div className="p-3 bg-red-50 border-t border-red-200">
          <Alert
            type="error"
            message={error.message}
            suggestion={error.suggestion}
            onClose={() => setError(null)}
          />
        </div>
      )}

      {/* Input Controls */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('chat.placeholder')}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2B8C87] focus:border-transparent"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-5 py-2.5 rounded-xl bg-[#2B8C87] hover:bg-[#257672] text-white text-sm font-semibold shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">{t('chat.send')}</span>
          </button>
        </form>

        <p className="text-[10px] text-gray-400 mt-2 text-center">
          AI Legal Guardian answers strictly from your document. Always verify critical terms with a licensed advocate.
        </p>
      </div>
    </div>
  );
};

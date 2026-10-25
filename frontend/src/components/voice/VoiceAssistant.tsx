import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Mic, Volume2, Square, Loader2, Upload, Copy, Check, Play, Pause, Sparkles
} from 'lucide-react';
import { getLanguageByCode } from '../../constants/languages';
import { api, ApiException } from '../../services/api';
import { Alert } from '../ui/Alert';

interface VoiceAssistantProps {
  currentLanguage: string;
  onSendToChat?: (text: string) => void;
  onSendToTranslate?: (text: string) => void;
}

const BROWSER_SPEECH_TAGS: Record<string, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  bn: 'bn-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
  pa: 'pa-IN',
  ur: 'ur-IN',
  ne: 'ne-NP',
};

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  currentLanguage,
  onSendToChat,
  onSendToTranslate,
}) => {
  const { t } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [transcriptionSource, setTranscriptionSource] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<{ message: string; suggestion?: string } | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const lastRecordedBlobRef = useRef<Blob | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const recordingAudioElRef = useRef<HTMLAudioElement | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const browserTranscriptRef = useRef<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const langConfig = getLanguageByCode(currentLanguage);

  useEffect(() => {
    return () => {
      // Clean up audio tracks on unmount
      const mediaRecorder = mediaRecorderRef.current;
      const audioEl = audioElementRef.current;
      const speechRec = speechRecognitionRef.current;
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
      if (speechRec) {
        try { speechRec.stop(); } catch (e) {}
      }
      if (audioEl) {
        audioEl.pause();
        audioEl.src = '';
      }
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
    };
  }, [recordedAudioUrl]);

  const [speechMode, setSpeechMode] = useState<'cloud_ai' | 'browser'>('cloud_ai');

  const startRecording = async () => {
    setError(null);
    browserTranscriptRef.current = '';
    setTranscriptionSource(null);

    // Truthful capability check
    if (!langConfig.capabilities.stt_whisper && !langConfig.capabilities.stt_browser) {
      setError({
        message: t('voice.unsupportedVoiceNote'),
        suggestion: 'Please type your legal query or switch to a supported language like Hindi or English.'
      });
      return;
    }

    // Initialize browser speech recognition for real-time live preview while speaking
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = BROWSER_SPEECH_TAGS[currentLanguage] || `${currentLanguage}-IN`;
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          let interim = '';
          let finalized = '';
          for (let i = 0; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalized += event.results[i][0].transcript + ' ';
            } else {
              interim += event.results[i][0].transcript;
            }
          }
          const combined = (finalized + interim).trim();
          if (combined) {
            browserTranscriptRef.current = combined;
            // Provide live streaming feedback while recording
            if (isRecording) {
              setTranscript(combined);
              setTranscriptionSource('Live Listening Preview...');
            }
          }
        };

        recognition.onerror = (e: any) => {
          console.warn('Browser SpeechRecognition event warning:', e);
        };

        recognition.start();
        speechRecognitionRef.current = recognition;
      } catch (e) {
        console.warn('Browser SpeechRecognition init failed:', e);
      }
    }

    try {
      // High-precision audio capture with noise suppression and echo cancellation
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 48000,
        }
      });
      audioChunksRef.current = [];

      let mimeType = 'audio/webm';
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (audioBlob.size > 0) {
          lastRecordedBlobRef.current = audioBlob;
          if (recordedAudioUrl) {
            URL.revokeObjectURL(recordedAudioUrl);
          }
          const newUrl = URL.createObjectURL(audioBlob);
          setRecordedAudioUrl(newUrl);

          if (speechMode === 'browser' && browserTranscriptRef.current.trim()) {
            setTranscript(browserTranscriptRef.current.trim());
            setTranscriptionSource('Browser Speech Recognition');
          } else {
            // Priority: High-precision acoustic speech-to-text for highest legal accuracy
            await transcribeBlob(audioBlob);
          }
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch (err: any) {
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.stop(); } catch (e) {}
      }
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError({
          message: t('voice.micPermissionDenied'),
          suggestion: 'Click the camera/microphone lock icon in your browser address bar to allow microphone access.'
        });
      } else {
        setError({
          message: `Microphone access error: ${err.message}`,
          suggestion: 'Ensure a working microphone is connected to your device.'
        });
      }
    }
  };

  const stopRecording = () => {
    if (speechRecognitionRef.current) {
      try { speechRecognitionRef.current.stop(); } catch (e) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeBlob = async (blob: Blob) => {
    setIsTranscribing(true);
    setError(null);
    try {
      const result = await api.transcribeAudio(blob, currentLanguage);
      if (result.text && result.text.trim()) {
        setTranscript(result.text.trim());
        setTranscriptionSource(result.provider || 'High-Precision Voice Recognition');
      } else {
        const fallbackText = browserTranscriptRef.current.trim();
        if (fallbackText) {
          setTranscript(fallbackText);
          setTranscriptionSource('Live Voice Typing (Fallback)');
        } else {
          setError({
            message: 'No clear speech detected in recording.',
            suggestion: 'Please speak louder or closer to the microphone and try again.'
          });
        }
      }
    } catch (err: any) {
      const fallbackText = browserTranscriptRef.current.trim();
      if (fallbackText) {
        setTranscript(fallbackText);
        setTranscriptionSource('Live Voice Typing (Offline)');
        return;
      }

      if (err instanceof ApiException) {
        setError({ message: err.message, suggestion: err.suggestion });
      } else {
        setError({
          message: 'Voice transcription failed.',
          suggestion: 'Please try speaking again or use browser speech typing.'
        });
      }
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
    }
    const newUrl = URL.createObjectURL(file);
    setRecordedAudioUrl(newUrl);
    lastRecordedBlobRef.current = file;

    await transcribeBlob(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCopyTranscript = async () => {
    if (!transcript) return;
    try {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Failed to copy text', err);
    }
  };

  const handleTogglePlayRecording = () => {
    if (!recordingAudioElRef.current || !recordedAudioUrl) return;
    if (isPlayingRecording) {
      recordingAudioElRef.current.pause();
      setIsPlayingRecording(false);
    } else {
      recordingAudioElRef.current.play();
      setIsPlayingRecording(true);
    }
  };

  const handleSpeakAloud = async () => {
    if (!transcript.trim()) {
      setError({
        message: 'No transcript available to read aloud.',
        suggestion: 'Speak or type text into the transcript area.'
      });
      return;
    }

    setError(null);
    setIsSynthesizing(true);

    // If cloud provider is supported, try cloud TTS endpoint
    if (langConfig.capabilities.tts_provider) {
      try {
        const audioBlob = await api.synthesizeSpeech(transcript, currentLanguage);
        const audioUrl = URL.createObjectURL(audioBlob);

        if (audioElementRef.current) {
          audioElementRef.current.src = audioUrl;
          audioElementRef.current.play();
          setIsPlayingAudio(true);
          audioElementRef.current.onended = () => setIsPlayingAudio(false);
        }
        setIsSynthesizing(false);
        return;
      } catch (err) {
        console.warn('Cloud TTS failed, attempting browser Web Speech fallback', err);
      }
    }

    // Browser Web Speech API fallback
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(transcript);
      utterance.lang = BROWSER_SPEECH_TAGS[currentLanguage] || currentLanguage;
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => {
        setIsPlayingAudio(false);
        setError({
          message: 'Browser speech synthesis could not play this text.',
          suggestion: 'Your device may lack voice data for this Indian language.'
        });
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setError({
        message: 'Speech synthesis is not supported on this browser/language.',
        suggestion: 'Please try Chrome or Edge with language voice packs installed.'
      });
    }
    setIsSynthesizing(false);
  };

  const handleStopAudio = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <audio ref={audioElementRef} className="hidden" />
      {recordedAudioUrl && (
        <audio
          ref={recordingAudioElRef}
          src={recordedAudioUrl}
          className="hidden"
          onEnded={() => setIsPlayingRecording(false)}
        />
      )}

      {/* Main Voice Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-[#142D4E] mb-2 flex items-center justify-center gap-2">
          <Mic className="w-6 h-6 text-[#2B8C87]" />
          {t('voice.title')}
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mb-6">
          {t('voice.subtitle')}
        </p>

        {/* Language & Capability Truthfulness Notice */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-xs text-gray-700 font-medium mb-6">
          <span>Active Voice Language: <strong>{langConfig.native_name} ({langConfig.name})</strong></span>
          <span>•</span>
          <span className={langConfig.capabilities.stt_whisper || langConfig.capabilities.stt_browser ? 'text-emerald-700' : 'text-amber-700'}>
            {langConfig.capabilities.stt_whisper || langConfig.capabilities.stt_browser
              ? 'Real-Time Speech Supported'
              : 'Experimental / Text Preferred'}
          </span>
        </div>

        {/* Transcription Mode Selector */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-6 text-xs">
          <span className="text-gray-500 font-semibold">Input Mode:</span>
          <div className="inline-flex p-0.5 bg-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => setSpeechMode('cloud_ai')}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 font-medium ${
                speechMode === 'cloud_ai'
                  ? 'bg-white text-[#2B8C87] shadow-xs font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#2B8C87]" />
              <span>✨ High-Precision AI (Accurate)</span>
            </button>
            <button
              type="button"
              onClick={() => setSpeechMode('browser')}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 font-medium ${
                speechMode === 'browser'
                  ? 'bg-white text-gray-800 shadow-xs font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-gray-600" />
              <span>🎙️ Real-Time Voice Typing</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 text-left">
            <Alert
              type="error"
              message={error.message}
              suggestion={error.suggestion}
              onClose={() => setError(null)}
            />
          </div>
        )}

        {/* Large Recording Toggle Button */}
        <div className="flex flex-col items-center justify-center my-6">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-lg focus:outline-none focus:ring-4 ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse focus:ring-red-300'
                : 'bg-[#2B8C87] hover:bg-[#257672] text-white focus:ring-[#2B8C87]/40 hover:scale-105'
            }`}
            aria-label={isRecording ? t('voice.stopRecording') : t('voice.startRecording')}
          >
            {isRecording ? <Square className="w-8 h-8 fill-current" /> : <Mic className="w-10 h-10" />}
          </button>

          <p className="mt-4 text-sm font-semibold text-gray-700">
            {isRecording ? (
              <span className="flex items-center gap-2 text-red-600">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping inline-block" />
                Listening & Transcribing in Real-Time ({langConfig.name})...
              </span>
            ) : (
              t('voice.startRecording')
            )}
          </p>

          {isTranscribing && (
            <div className="mt-3 flex items-center gap-2 text-xs text-[#2B8C87] font-semibold bg-teal-50 px-3 py-1.5 rounded-full border border-teal-200">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing and transcribing spoken audio...</span>
            </div>
          )}

          {/* Secondary Controls: Upload File / Audio Player */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-gray-500">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="audio/*,.wav,.mp3,.webm,.m4a,.ogg"
              className="hidden"
              id="voice-audio-file-upload"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isRecording || isTranscribing}
              className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5 text-gray-500" />
              Upload Audio File
            </button>

            {recordedAudioUrl && (
              <button
                onClick={handleTogglePlayRecording}
                className="px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 hover:bg-teal-100 text-[#2B8C87] font-semibold flex items-center gap-1.5 transition-colors"
              >
                {isPlayingRecording ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    Pause Recording
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Listen to Recording
                  </>
                )}
              </button>
            )}

            {lastRecordedBlobRef.current && !isRecording && (
              <button
                onClick={() => lastRecordedBlobRef.current && transcribeBlob(lastRecordedBlobRef.current)}
                disabled={isTranscribing}
                className="px-3 py-1.5 rounded-lg border border-teal-200 text-teal-800 hover:bg-teal-50 font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
                title="Re-run speech transcription on the recording"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                Re-transcribe Audio
              </button>
            )}
          </div>
        </div>

        {/* Editable Transcript Area */}
        <div className="text-left mt-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                {t('voice.transcriptLabel')}
              </label>
              {transcriptionSource && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {transcriptionSource === 'browser'
                    ? `✓ Real-Time (${langConfig.name})`
                    : `✓ ${transcriptionSource}`}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {transcript && (
                <>
                  <button
                    onClick={handleCopyTranscript}
                    className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={() => {
                      setTranscript('');
                      setTranscriptionSource(null);
                    }}
                    className="text-xs text-gray-400 hover:text-red-600 transition-colors"
                  >
                    {t('voice.clear')}
                  </button>
                </>
              )}
            </div>
          </div>

          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder={isRecording ? 'Listening... Speak now and watch your words appear in real-time...' : t('voice.transcriptPlaceholder')}
            rows={4}
            className="w-full p-4 rounded-xl border border-gray-300 text-sm leading-relaxed text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2B8C87]"
          />

          {/* Action Row */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {!isPlayingAudio ? (
                <button
                  onClick={handleSpeakAloud}
                  disabled={!transcript.trim() || isSynthesizing}
                  className="px-4 py-2 rounded-lg bg-[#142D4E] hover:bg-[#0B1F35] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-40"
                >
                  {isSynthesizing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2B8C87]" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 text-[#2B8C87]" />
                  )}
                  <span>{t('voice.synthesizeBtn')}</span>
                </button>
              ) : (
                <button
                  onClick={handleStopAudio}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>{t('voice.stopAudio')}</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs">
              {onSendToChat && transcript && (
                <button
                  onClick={() => onSendToChat(transcript)}
                  className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Ask in Legal Chat →
                </button>
              )}
              {onSendToTranslate && transcript && (
                <button
                  onClick={() => onSendToTranslate(transcript)}
                  className="px-3 py-2 rounded-lg border border-[#2B8C87] text-[#2B8C87] hover:bg-[#E7F5F2] font-semibold transition-colors"
                >
                  Translate This →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Capabilities Explanation */}
      <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-500 leading-relaxed space-y-1">
        <p>
          • <strong>Voice Recognition:</strong> High-precision acoustic speech-to-text with noise suppression. Transcribes verbatim without modifying or altering your spoken words.
        </p>
        <p>
          • <strong>Speech Synthesis:</strong> Speaks legal summaries and clause explanations aloud in your selected language.
        </p>
      </div>
    </div>
  );
};

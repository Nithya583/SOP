import type { LanguageConfig } from '../types';

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    code: 'en',
    name: 'English',
    native_name: 'English',
    direction: 'ltr',
    script: 'Latin',
    fontClass: '',
    capabilities: {
      analysis: true,
      translation: true,
      stt_whisper: true,
      stt_browser: true,
      tts_provider: true,
      tts_browser: true,
      notes: 'Full support across all features.'
    }
  },
  {
    code: 'hi',
    name: 'Hindi',
    native_name: 'हिन्दी',
    direction: 'ltr',
    script: 'Devanagari',
    fontClass: 'font-devanagari',
    capabilities: {
      analysis: true,
      translation: true,
      stt_whisper: true,
      stt_browser: true,
      tts_provider: true,
      tts_browser: true,
      notes: 'Comprehensive support in document analysis, translation, and speech.'
    }
  },
  {
    code: 'ta',
    name: 'Tamil',
    native_name: 'தமிழ்',
    direction: 'ltr',
    script: 'Tamil',
    fontClass: 'font-tamil',
    capabilities: {
      analysis: true,
      translation: true,
      stt_whisper: true,
      stt_browser: true,
      tts_provider: true,
      tts_browser: true,
      notes: 'Supported for analysis, translation, and speech recognition.'
    }
  },
  {
    code: 'te',
    name: 'Telugu',
    native_name: 'తెలుగు',
    direction: 'ltr',
    script: 'Telugu',
    fontClass: 'font-telugu',
    capabilities: {
      analysis: true,
      translation: true,
      stt_whisper: true,
      stt_browser: true,
      tts_provider: true,
      tts_browser: true,
      notes: 'Supported for analysis, translation, and speech synthesis.'
    }
  },
  {
    code: 'ml',
    name: 'Malayalam',
    native_name: 'മലയാളം',
    direction: 'ltr',
    script: 'Malayalam',
    fontClass: 'font-malayalam',
    capabilities: {
      analysis: true,
      translation: true,
      stt_whisper: true,
      stt_browser: true,
      tts_provider: true,
      tts_browser: true,
      notes: 'Supported for analysis, translation, and speech.'
    }
  },
  {
    code: 'kn',
    name: 'Kannada',
    native_name: 'ಕನ್ನಡ',
    direction: 'ltr',
    script: 'Kannada',
    fontClass: 'font-kannada',
    capabilities: {
      analysis: true,
      translation: true,
      stt_whisper: true,
      stt_browser: true,
      tts_provider: true,
      tts_browser: true,
      notes: 'Supported for analysis, translation, and speech.'
    }
  },
  {
    code: 'bn',
    name: 'Bengali',
    native_name: 'বাংলা',
    direction: 'ltr',
    script: 'Bengali',
    fontClass: 'font-bengali',
    capabilities: {
      analysis: true,
      translation: true,
      stt_whisper: true,
      stt_browser: true,
      tts_provider: true,
      tts_browser: true,
      notes: 'Supported across analysis, translation, and speech synthesis.'
    }
  },
  {
    code: 'mr',
    name: 'Marathi',
    native_name: 'मराठी',
    direction: 'ltr',
    script: 'Devanagari',
    fontClass: 'font-devanagari',
    capabilities: {
      analysis: true,
      translation: true,
      stt_whisper: true,
      stt_browser: true,
      tts_provider: true,
      tts_browser: true,
      notes: 'Supported for analysis, translation, and speech processing.'
    }
  },
  {
    code: 'gu',
    name: 'Gujarati',
    native_name: 'ગુજરાતી',
    direction: 'ltr',
    script: 'Gujarati',
    fontClass: 'font-gujarati',
    capabilities: {
      analysis: true,
      translation: true,
      stt_whisper: true,
      stt_browser: true,
      tts_provider: true,
      tts_browser: true,
      notes: 'Supported for analysis, translation, and speech processing.'
    }
  },
  {
    code: 'pa',
    name: 'Punjabi',
    native_name: 'ਪੰਜਾਬੀ',
    direction: 'ltr',
    script: 'Gurmukhi',
    fontClass: 'font-gurmukhi',
    capabilities: {
      analysis: true,
      translation: true,
      stt_whisper: true,
      stt_browser: true,
      tts_provider: true,
      tts_browser: true,
      notes: 'Supported for analysis, translation, and speech.'
    }
  },
  {
    code: 'or',
    name: 'Odia',
    native_name: 'ଓଡ଼ିଆ',
    direction: 'ltr',
    script: 'Odia',
    fontClass: 'font-oriya',
    capabilities: {
      analysis: true,
      translation: true,
      stt_whisper: false,
      stt_browser: false,
      tts_provider: false,
      tts_browser: false,
      notes: 'Textual analysis and translation supported. Cloud voice STT/TTS is limited.'
    }
  },
  {
    code: 'as',
    name: 'Assamese',
    native_name: 'অসমীয়া',
    direction: 'ltr',
    script: 'Bengali-Assamese',
    fontClass: 'font-bengali',
    capabilities: {
      analysis: true,
      translation: true,
      stt_whisper: false,
      stt_browser: false,
      tts_provider: false,
      tts_browser: false,
      notes: 'Textual analysis and translation supported. Voice features have limited support for this dialect.'
    }
  },
  {
    code: 'ur',
    name: 'Urdu',
    native_name: 'اردو',
    direction: 'rtl',
    script: 'Arabic-Nastaliq',
    fontClass: 'font-urdu',
    capabilities: {
      analysis: true,
      translation: true,
      stt_whisper: true,
      stt_browser: true,
      tts_provider: true,
      tts_browser: true,
      notes: 'RTL rendering supported. Supported for analysis, translation, and speech.'
    }
  },
  {
    code: 'sa',
    name: 'Sanskrit',
    native_name: 'संस्कृतम्',
    direction: 'ltr',
    script: 'Devanagari',
    fontClass: 'font-devanagari',
    capabilities: {
      analysis: true,
      translation: true,
      stt_whisper: false,
      stt_browser: false,
      tts_provider: false,
      tts_browser: false,
      notes: 'Textual analysis and translation supported. Standardized voice models are unavailable for this dialect.'
    }
  },
  {
    code: 'ne',
    name: 'Nepali',
    native_name: 'नेपाली',
    direction: 'ltr',
    script: 'Devanagari',
    fontClass: 'font-devanagari',
    capabilities: {
      analysis: true,
      translation: true,
      stt_whisper: true,
      stt_browser: true,
      tts_provider: true,
      tts_browser: true,
      notes: 'Supported across analysis, translation, and speech.'
    }
  },
  {
    code: 'kok',
    name: 'Konkani',
    native_name: 'कोंकणी',
    direction: 'ltr',
    script: 'Devanagari',
    fontClass: 'font-devanagari',
    capabilities: {
      analysis: true,
      translation: true,
      stt_whisper: false,
      stt_browser: false,
      tts_provider: false,
      tts_browser: false,
      notes: 'Textual analysis and translation supported. Dedicated voice models are unavailable.'
    }
  }
];

export const getLanguageByCode = (code: string): LanguageConfig => {
  return SUPPORTED_LANGUAGES.find(l => l.code === code) || SUPPORTED_LANGUAGES[0];
};

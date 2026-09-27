import en from './en'
import hi from './hi'
import kn from './kn'

const translations = { en, hi, kn }

export function getTranslation(lang, key) {
  const keys = key.split('.')
  let result = translations[lang] || translations.en
  for (const k of keys) {
    result = result?.[k]
  }
  return result || key 
}

export const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' }
]

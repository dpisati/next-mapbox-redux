import { useEffect } from 'react';
import { useRouter } from 'next/router';

const isServer = typeof window === 'undefined';

export const googleLangCode = {
  es_MX: 'es',
  en: 'en',
  zh: 'zh-CH',
  pt_BR: 'pt',
  fr: 'fr',
  id: 'id',
};

export const getGoogleLangCode = (lang) => googleLangCode[lang || 'en'];

export const momentLangCode = {
  es_MX: 'es',
  en: 'en',
  zh: 'zh-cn',
  pt_BR: 'pt-br',
  fr: 'fr',
  id: 'id',
};

export const getMomentLangCode = (lang) => momentLangCode[lang || 'en'];

export const languages = [
  {
    label: 'English',
    value: 'en',
  },
  {
    label: '中文',
    value: 'zh',
  },
  {
    label: 'Français',
    value: 'fr',
  },
  {
    label: 'Bahasa Indonesia',
    value: 'id',
  },
  {
    label: 'Português (Brasil)',
    value: 'pt_BR',
  },
  {
    label: 'Español (Mexico)',
    value: 'es_MX',
  },
];

export function translateText(str, params) {
  if (!str || typeof str !== 'string') {
    return str;
  }

  if (typeof window !== 'undefined') {
    const { Transifex } = window;
    if (!isServer) {
      return Transifex.live.translateText(str, params);
    }
  }

  return str;
}

export const useSetLanguage = (lang) => {
  const { query } = useRouter();
  const langCode = lang || query?.lang;
  const canSetLanguage = !isServer && langCode && window?.Transifex;

  useEffect(
    () => canSetLanguage && window?.Transifex?.live.translateTo(langCode),
    []
  );
};

export const selectActiveLang = (state) =>
  !isServer &&
  (state?.location?.query?.lang ||
    JSON.parse(localStorage.getItem('txlive:selectedlang')) ||
    'en');

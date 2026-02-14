'use client';

import { setLanguage } from '@/src/app/actions/set-language';
import { useState } from 'react';

export default function LanguageSwitcher() {
  const [isPending, setIsPending] = useState(false);

  const toggleLanguage = async (newLang: string) => {
    setIsPending(true);
    await setLanguage(newLang);
    window.location.reload();
    setIsPending(false);
  };

  return (
    <div className="flex gap-2">
      <div className="flex gap-4 items-center">
        <button
          disabled={isPending}
          onClick={() => toggleLanguage('pt')}
          className={`
            transition-all duration-200 hover:scale-110 active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed
            cursor-pointer
            rounded-md overflow-hidden shadow-sm border border-gray-200
          `}
          title="Mudar para Português"
        >
          <img
            src="https://flagcdn.com/br.svg"
            alt="Bandeira do Brasil"
            className="w-8 h-6 object-cover"
          />
        </button>

        <button
          disabled={isPending}
          onClick={() => toggleLanguage('en')}
          className={`
            transition-all duration-200 hover:scale-110 active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed
            cursor-pointer
            rounded-md overflow-hidden shadow-sm border border-gray-200
          `}
          title="Switch to English"
        >
          <img
            src="https://flagcdn.com/us.svg"
            alt="USA Flag"
            className="w-8 h-6 object-cover"
          />
        </button>
      </div>
    </div>
  );
}
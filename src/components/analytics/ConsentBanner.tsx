'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const STORAGE_KEY = 'corpicia-consent-v1';

type ConsentChoice = 'granted' | 'denied';

function updateConsent(choice: ConsentChoice) {
  window.dataLayer = window.dataLayer || [];
  const gtag = window.gtag || function (...args: unknown[]) {
    window.dataLayer.push(args);
  };
  window.gtag = gtag;

  gtag('consent', 'update', {
    analytics_storage: choice,
    ad_storage: choice,
    ad_user_data: choice,
    ad_personalization: choice,
  });
}

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as ConsentChoice | null;
    if (saved === 'granted' || saved === 'denied') {
      updateConsent(saved);
      return;
    }
    setVisible(true);
  }, []);

  const choose = (choice: ConsentChoice) => {
    window.localStorage.setItem(STORAGE_KEY, choice);
    updateConsent(choice);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl sm:p-5" role="dialog" aria-live="polite" aria-label="Preferencias de privacidad">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-gray-700">
          Usamos analítica para entender el uso del sitio y mejorar la experiencia. También podemos usar medición publicitaria para saber qué campañas generan consultas.
        </p>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => choose('denied')} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2">
            Rechazar
          </button>
          <button type="button" onClick={() => choose('granted')} className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2">
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}

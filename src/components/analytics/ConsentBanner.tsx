'use client';

import { useEffect, useState } from 'react';

type ConsentValue = 'granted' | 'denied';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const STORAGE_KEY = 'corpicia-consent-v2';

function updateGoogleConsent(value: ConsentValue) {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };

  window.gtag('consent', 'update', {
    analytics_storage: value,
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: value,
  });

  window.dataLayer.push({ event: 'consent_update', consent_state: value });
}

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as ConsentValue | null;
    if (saved === 'granted' || saved === 'denied') {
      updateGoogleConsent(saved);
      return;
    }
    setVisible(true);
  }, []);

  const choose = (value: ConsentValue) => {
    window.localStorage.setItem(STORAGE_KEY, value);
    updateGoogleConsent(value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl sm:p-5" role="dialog" aria-label="Preferencias de privacidad">
      <p className="text-sm font-semibold text-gray-900">Privacidad y medición</p>
      <p className="mt-1 text-sm leading-6 text-gray-600">
        Usamos medición para entender el rendimiento del sitio y de nuestras campañas. Podés aceptar o rechazar las cookies de analítica y publicidad.
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={() => choose('denied')} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Rechazar
        </button>
        <button type="button" onClick={() => choose('granted')} className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800">
          Aceptar
        </button>
      </div>
    </div>
  );
}

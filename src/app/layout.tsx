import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { Suspense } from 'react';
import { InternalPageTracker } from '@/components/analytics/InternalPageTracker';
import { PageEngagementTracker } from '@/components/analytics/PageEngagementTracker';
import { ConsentBanner } from '@/components/analytics/ConsentBanner';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.corpicia.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Césped Natural, Riego & Jardinería en Paraguay | Corpicia', template: '%s | Corpicia' },
  description: 'Venta e instalación de césped natural en Paraguay. Riego automático, paisajismo y asesoría experta. Presupuesto por WhatsApp. Envíos a todo el país.',
  keywords: ['césped natural Paraguay', 'jardinería Asunción', 'riego automático', 'paisajismo', 'césped Esmeralda', 'césped Kavaju', 'instalación césped', 'productos jardín'],
  authors: [{ name: 'Corpicia', url: siteUrl }],
  creator: 'Corpicia',
  publisher: 'Corpicia',
  category: 'Ecommerce - Jardinería y Paisajismo',
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/android-chrome-192x192.png', type: 'image/png', sizes: '192x192' },
      { url: '/android-chrome-512x512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'Césped Natural, Riego y Jardinería en Paraguay | Corpicia',
    description: 'Especialistas en césped natural, riego automático y paisajismo. Envíos a todo Paraguay. Solicitá tu presupuesto.',
    type: 'website',
    locale: 'es_PY',
    url: siteUrl,
    siteName: 'Corpicia',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Corpicia - Césped Natural Premium en Paraguay' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Corpicia | Césped Natural y Jardinería',
    description: 'Especialistas en césped natural y riego automático en Paraguay.',
    images: ['/og-image.jpg'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#166534',
  colorScheme: 'light',
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${siteUrl}/#organization`,
  name: 'Corpicia',
  alternateName: 'Corpicia Jardinería',
  url: siteUrl,
  logo: { '@type': 'ImageObject', url: `${siteUrl}/logo-corpicia.png` },
  image: `${siteUrl}/og-image.jpg`,
  description: 'Especialistas en césped natural, riego automático y paisajismo en Paraguay.',
  sameAs: ['https://www.facebook.com/corpicia', 'https://www.instagram.com/corpicia'],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+595-992-588-770',
    contactType: 'customer service',
    availableLanguage: 'Spanish',
    areaServed: 'PY',
  },
};

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${siteUrl}/#localbusiness`,
  name: 'Corpicia',
  image: `${siteUrl}/og-image.jpg`,
  url: siteUrl,
  telephone: '+595-992-588-770',
  email: 'info@corpicia.com',
  priceRange: '$$',
  currenciesAccepted: 'PYG',
  paymentAccepted: 'Efectivo, Transferencia',
  areaServed: { '@type': 'Country', name: 'Paraguay' },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${siteUrl}/#website`,
  name: 'Corpicia',
  url: siteUrl,
  inLanguage: 'es-PY',
};

const webPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${siteUrl}/#webpage`,
  url: siteUrl,
  name: 'Corpicia | Césped Natural y Jardinería en Paraguay',
  description: 'Venta e instalación de césped natural, riego automático y paisajismo en Paraguay.',
  isPartOf: { '@id': `${siteUrl}/#website` },
  about: { '@id': `${siteUrl}/#organization` },
  primaryImageOfPage: { '@type': 'ImageObject', url: `${siteUrl}/og-image.jpg` },
  inLanguage: 'es-PY',
};

function WhatsAppIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.009-.371-.011-.57-.011-.198 0-.52.074-.792.371-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.028 6.988 2.895a9.825 9.825 0 0 1 2.9 6.988c-.002 5.45-4.437 9.884-9.892 9.884m8.413-18.297A11.815 11.815 0 0 0 12.055 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.14 1.588 5.945L.057 24l6.305-1.654a11.88 11.88 0 0 0 5.689 1.448h.005c6.557 0 11.892-5.335 11.895-11.893a11.821 11.821 0 0 0-3.487-8.413Z" />
    </svg>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID || 'G-9FBEL0RKMY';
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const gadsId = process.env.NEXT_PUBLIC_GADS_ID;

  return (
    <html lang="es-PY">
      <body className="font-sans antialiased bg-white text-gray-950">
        <Script id="google-consent-default" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = window.gtag || gtag;
            gtag('consent', 'default', {
              analytics_storage: 'denied',
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
              wait_for_update: 500
            });
          `}
        </Script>

        {gtmId ? (
          <>
            <noscript>
              <iframe src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`} height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} />
            </noscript>
            <Script id="gtm-script" strategy="afterInteractive">
              {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtM.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
            </Script>
          </>
        ) : (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = window.gtag || gtag;
                gtag('js', new Date());
                gtag('config', '${gaId}', { send_page_view: true });
                ${gadsId ? `gtag('config', '${gadsId}');` : ''}
              `}
            </Script>
          </>
        )}

        <Script id="schema-organization" type="application/ld+json" strategy="afterInteractive">{JSON.stringify(organizationSchema)}</Script>
        <Script id="schema-localbusiness" type="application/ld+json" strategy="afterInteractive">{JSON.stringify(localBusinessSchema)}</Script>
        <Script id="schema-website" type="application/ld+json" strategy="afterInteractive">{JSON.stringify(websiteSchema)}</Script>
        <Script id="schema-webpage" type="application/ld+json" strategy="afterInteractive">{JSON.stringify(webPageSchema)}</Script>

        <Suspense fallback={null}>
          <InternalPageTracker />
          <PageEngagementTracker />
        </Suspense>

        <div className="bg-[#075b25] text-white text-xs sm:text-sm">
          <div className="container mx-auto px-4 py-2 flex flex-wrap items-center justify-center sm:justify-between gap-2">
            <span>Asesoría experta por WhatsApp</span>
            <span className="hidden sm:inline">Envíos a todo Paraguay · Instalación profesional</span>
          </div>
        </div>

        <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
          <div className="container mx-auto px-4 min-h-[82px] flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center shrink-0" aria-label="Corpicia - Inicio">
              <Image src="/logo-corpicia.png" alt="Corpicia" width={260} height={86} priority className="h-16 w-auto object-contain sm:h-[72px]" />
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
              <Link href="/">Inicio</Link>
              <Link href="/productos">Productos</Link>
              <Link href="/servicios">Servicios</Link>
              <Link href="/nosotros">Nosotros</Link>
              <Link href="/contacto">Contacto</Link>
            </nav>
            <a href="https://wa.me/595992588770" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center rounded-lg bg-[#1f7a32] px-4 py-2 text-sm font-semibold text-white">Cotizar proyecto</a>
          </div>
        </header>

        <main className="min-h-screen">{children}</main>

        <a href="https://wa.me/595992588770?text=Hola%20Corpicia%2C%20quiero%20hacer%20una%20consulta." target="_blank" rel="noopener noreferrer" aria-label="Contactar a Corpicia por WhatsApp" className="fixed bottom-20 right-4 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 hover:bg-[#1fbd5b] sm:bottom-6 sm:right-6 sm:h-16 sm:w-16">
          <WhatsAppIcon className="h-7 w-7 sm:h-8 sm:w-8" />
        </a>

        <footer className="border-t bg-[#062b17] text-white">
          <div className="container mx-auto px-4 py-8 grid gap-7 md:grid-cols-3 md:items-start">
            <div>
              <div className="inline-flex rounded-xl bg-white p-2.5 shadow-sm">
                <Image src="/logo-corpicia.png" alt="Corpicia" width={220} height={74} className="h-14 w-auto object-contain sm:h-16" />
              </div>
              <p className="mt-3 max-w-sm text-sm text-white/70">Césped natural, riego automático y paisajismo en Paraguay.</p>
            </div>
            <div>
              <p className="font-semibold">Navegación</p>
              <div className="mt-2 flex flex-col gap-1 text-sm text-white/70">
                <Link href="/productos">Productos</Link>
                <Link href="/servicios">Servicios</Link>
                <Link href="/nosotros">Nosotros</Link>
              </div>
            </div>
            <div>
              <p className="font-semibold">Contacto</p>
              <p className="mt-2 text-sm text-white/70">WhatsApp: +595 992 588 770</p>
            </div>
          </div>
          <div className="border-t border-white/10">
            <div className="container mx-auto px-4 py-4 flex flex-col items-center justify-between gap-2 text-center text-xs text-white/60 sm:flex-row sm:text-left">
              <span>© 2026 Corpicia. Todos los derechos reservados.</span>
              <a href="https://equantum.com.py" target="_blank" rel="noopener noreferrer" className="font-semibold text-white/80 transition hover:text-white">Desarrollado por eQuantum</a>
            </div>
          </div>
        </footer>

        <ConsentBanner />

        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "xq2h9x94gc");`}
        </Script>
      </body>
    </html>
  );
}

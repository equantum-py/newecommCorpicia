import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Suspense } from 'react';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { TopBarAnnouncement } from '@/components/TopBarAnnouncement';
import PromotionalPopup from '@/components/PromotionalPopup';
import { Footer } from '@/components/Footer';
import { WhatsAppFloatingButton } from '@/components/WhatsAppButton';
import { BudgetDrawer } from '@/components/BudgetDrawer';
import { CommercialAssistant } from '@/components/commercial-assistant/CommercialAssistant';
import { InternalPageTracker } from '@/components/analytics/InternalPageTracker';
import { PageEngagementTracker } from '@/components/analytics/PageEngagementTracker';
import { ConsentBanner } from '@/components/analytics/ConsentBanner';

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
    googleBot: { index: true, follow: true, noimageindex: false, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
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
    type: 'website', locale: 'es_PY', url: siteUrl, siteName: 'Corpicia',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Corpicia - Césped Natural Premium en Paraguay' }],
  },
  twitter: { card: 'summary_large_image', title: 'Corpicia | Césped Natural y Jardinería', description: 'Especialistas en césped natural y riego automático en Paraguay.', images: ['/og-image.jpg'] },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, maximumScale: 5, themeColor: '#16a34a', colorScheme: 'light' };

const organizationSchema = {
  '@context': 'https://schema.org', '@type': 'Organization', '@id': `${siteUrl}/#organization`, name: 'Corpicia', alternateName: 'Corpicia Jardinería', url: siteUrl,
  logo: { '@type': 'ImageObject', url: `${siteUrl}/icon-512.png`, width: 512, height: 512 }, image: `${siteUrl}/og-image.jpg`,
  description: 'Especialistas en césped natural, riego automático y paisajismo en Paraguay.',
  sameAs: ['https://www.facebook.com/corpicia', 'https://www.instagram.com/corpicia'],
  contactPoint: { '@type': 'ContactPoint', telephone: '+595-992-588-770', contactType: 'customer service', availableLanguage: 'Spanish', areaServed: 'PY' },
};
const localBusinessSchema = { '@context': 'https://schema.org', '@type': 'LocalBusiness', '@id': `${siteUrl}/#localbusiness`, name: 'Corpicia', image: `${siteUrl}/og-image.jpg`, url: siteUrl, telephone: '+595-992-588-770', email: 'info@corpicia.com', priceRange: '$$', currenciesAccepted: 'PYG', paymentAccepted: 'Efectivo, Transferencia', areaServed: { '@type': 'Country', name: 'Paraguay' } };
const websiteSchema = { '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${siteUrl}/#website`, name: 'Corpicia', url: siteUrl, inLanguage: 'es-PY' };
const webPageSchema = { '@context': 'https://schema.org', '@type': 'WebPage', '@id': `${siteUrl}/#webpage`, url: siteUrl, name: 'Corpicia | Césped Natural y Jardinería en Paraguay', description: 'Venta e instalación de césped natural, riego automático y paisajismo en Paraguay.', isPartOf: { '@id': `${siteUrl}/#website` }, about: { '@id': `${siteUrl}/#organization` }, primaryImageOfPage: { '@type': 'ImageObject', url: `${siteUrl}/og-image.jpg` }, inLanguage: 'es-PY' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID || 'G-9FBEL0RKMY';
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const gadsId = process.env.NEXT_PUBLIC_GADS_ID;

  return (
    <html lang="es-PY">
      <body className="font-sans antialiased">
        <Script id="google-consent-default" strategy="beforeInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = window.gtag || gtag;
          gtag('consent', 'default', { analytics_storage:'denied', ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied', wait_for_update:500 });
        `}</Script>

        {gtmId ? (
          <>
            <noscript><iframe src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`} height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} title="Google Tag Manager" /></noscript>
            <Script id="gtm-script" strategy="afterInteractive">{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}</Script>
          </>
        ) : (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="gtag-init" strategy="afterInteractive">{`
              window.dataLayer=window.dataLayer||[]; function gtag(){dataLayer.push(arguments);} window.gtag=window.gtag||gtag;
              gtag('js',new Date()); gtag('config','${gaId}',{send_page_view:true}); ${gadsId ? `gtag('config','${gadsId}');` : ''}
            `}</Script>
          </>
        )}

        <script id="schema-organization" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <script id="schema-localbusiness" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
        <script id="schema-website" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        <script id="schema-webpage" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />

        <Suspense fallback={null}><InternalPageTracker /><PageEngagementTracker /></Suspense>
        <TopBarAnnouncement />
        <Navbar />
        <PromotionalPopup />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <WhatsAppFloatingButton />
        <BudgetDrawer />
        <CommercialAssistant />
        <ConsentBanner />

        <Script id="microsoft-clarity" strategy="lazyOnload">{`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","xq2h9x94gc");`}</Script>
      </body>
    </html>
  );
}

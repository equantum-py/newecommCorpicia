import Script from 'next/script';

interface GoogleMeasurementProps {
  gaId?: string;
  gtmId?: string;
  gadsId?: string;
}

export function GoogleMeasurement({ gaId, gtmId, gadsId }: GoogleMeasurementProps) {
  const effectiveGaId = gaId || 'G-9FBEL0RKMY';

  // GTM and direct gtag are intentionally mutually exclusive.
  // When GTM is configured, GA4/Google Ads tags must be managed in the GTM container.
  if (gtmId) {
    return (
      <>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
            title="Google Tag Manager"
          />
        </noscript>
        <Script id="gtm-script" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){
              w[l]=w[l]||[];
              w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
              var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
              j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
              f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `}
        </Script>
      </>
    );
  }

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${effectiveGaId}`} strategy="afterInteractive" />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${effectiveGaId}', {
            send_page_view: true,
            allow_google_signals: true,
            allow_ad_personalization_signals: true
          });
          ${gadsId ? `gtag('config', '${gadsId}');` : ''}
        `}
      </Script>
    </>
  );
}

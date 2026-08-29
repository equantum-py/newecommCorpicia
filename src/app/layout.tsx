import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import './globals.css';

const siteUrl = 'https://www.corpicia.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Césped Natural, Riego & Jardinería en Paraguay | Corpicia', template: '%s | Corpicia' },
  description: 'Venta e instalación de césped natural en Paraguay. Riego automático, paisajismo y asesoría experta.',
  robots: { index: false, follow: false },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#166534',
  colorScheme: 'light',
};

function WhatsAppIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.009-.371-.011-.57-.011-.198 0-.52.074-.792.371-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.028 6.988 2.895a9.825 9.825 0 0 1 2.9 6.988c-.002 5.45-4.437 9.884-9.892 9.884m8.413-18.297A11.815 11.815 0 0 0 12.055 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.14 1.588 5.945L.057 24l6.305-1.654a11.88 11.88 0 0 0 5.689 1.448h.005c6.557 0 11.892-5.335 11.895-11.893a11.821 11.821 0 0 0-3.487-8.413Z" />
    </svg>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-PY">
      <body className="font-sans antialiased bg-white text-gray-950">
        <div className="bg-[#075b25] text-white text-xs sm:text-sm">
          <div className="container mx-auto px-4 py-2 flex flex-wrap items-center justify-center sm:justify-between gap-2">
            <span>Asesoría experta por WhatsApp</span>
            <span className="hidden sm:inline">Envíos a todo Paraguay · Instalación profesional</span>
            <span>Preview de rediseño</span>
          </div>
        </div>

        <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
          <div className="container mx-auto px-4 min-h-[82px] flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center shrink-0" aria-label="Corpicia - Inicio">
              <Image
                src="/logo-corpicia.png"
                alt="Corpicia"
                width={260}
                height={86}
                priority
                className="h-16 w-auto object-contain sm:h-[72px]"
              />
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
              <Link href="/">Inicio</Link>
              <Link href="/productos">Productos</Link>
              <Link href="/servicios">Servicios</Link>
              <Link href="/nosotros">Nosotros</Link>
              <Link href="/contacto">Contacto</Link>
            </nav>
            <a href="https://wa.me/595992588770" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center rounded-lg bg-[#1f7a32] px-4 py-2 text-sm font-semibold text-white">
              Cotizar proyecto
            </a>
          </div>
        </header>

        <main className="min-h-screen">{children}</main>

        <a
          href="https://wa.me/595992588770?text=Hola%20Corpicia%2C%20quiero%20hacer%20una%20consulta."
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contactar a Corpicia por WhatsApp"
          className="fixed bottom-5 right-4 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 hover:bg-[#1fbd5b] sm:bottom-6 sm:right-6 sm:h-16 sm:w-16"
        >
          <WhatsAppIcon className="h-7 w-7 sm:h-8 sm:w-8" />
        </a>

        <footer className="border-t bg-[#062b17] text-white">
          <div className="container mx-auto px-4 py-8 grid gap-7 md:grid-cols-3 md:items-start">
            <div>
              <Image
                src="/logo-corpicia.png"
                alt="Corpicia"
                width={220}
                height={74}
                className="h-16 w-auto object-contain brightness-0 invert"
              />
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
              <a
                href="https://equantum.com.py"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-white/80 transition hover:text-white"
              >
                Desarrollado por eQuantum
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

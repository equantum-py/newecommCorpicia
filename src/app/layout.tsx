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

        <footer className="border-t bg-[#062b17] text-white">
          <div className="container mx-auto px-4 py-8 grid gap-6 md:grid-cols-3">
            <div><p className="font-bold text-lg">Corpicia</p><p className="mt-2 text-sm text-white/70">Césped natural, riego automático y paisajismo en Paraguay.</p></div>
            <div><p className="font-semibold">Navegación</p><div className="mt-2 flex flex-col gap-1 text-sm text-white/70"><Link href="/productos">Productos</Link><Link href="/servicios">Servicios</Link><Link href="/nosotros">Nosotros</Link></div></div>
            <div><p className="font-semibold">Contacto</p><p className="mt-2 text-sm text-white/70">WhatsApp: +595 992 588 770</p></div>
          </div>
        </footer>
      </body>
    </html>
  );
}

# Corpicia Ecommerce

Ecommerce moderno para Corpicia - especialistas en césped natural y jardinería en Paraguay.

## 🚀 Tecnologías

- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utilitarios
- **Supabase** - Base de datos y storage
- **Zustand** - Estado global

## 📦 Funcionalidades

- ✅ Catálogo de productos con cálculo por m²
- ✅ Sistema de presupuesto (sin checkout tradicional)
- ✅ Integración con WhatsApp
- ✅ SEO optimizado (sitemap, robots, meta tags)
- ✅ Diseño responsive mobile-first
- ✅ Panel administrativo básico

## 🛠️ Instalación

1. Clonar repositorio:
```bash
git clone https://github.com/tuusuario/corpicia.git
cd corpicia
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env.local
# Editar .env.local con tus credenciales
```

4. Iniciar servidor de desarrollo:
```bash
npm run dev
```

## 📁 Estructura del Proyecto

```
corpicia/
├── src/
│   ├── app/              # Rutas de Next.js App Router
│   ├── components/       # Componentes React
│   ├── lib/             # Utilidades y configuración
│   ├── store/           # Estado global (Zustand)
│   └── types/           # Tipos TypeScript
├── public/              # Archivos estáticos
└── ...
```

## 🌐 Variables de Entorno

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima de Supabase |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número de WhatsApp para presupuestos |
| `NEXT_PUBLIC_SITE_URL` | URL del sitio |

## 🚀 Deploy

### Vercel (Recomendado)

1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Deploy automático en cada push

```bash
npm i -g vercel
vercel
```

## 📄 Licencia

MIT - Corpicia 2024

<!-- preview redeploy trigger: 2026-08-29 11:04 PY -->

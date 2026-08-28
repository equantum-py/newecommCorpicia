'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, Image as ImageIcon, Save, Type } from 'lucide-react';

type HeroMode = 'text' | 'banner';

export default function AdminConfiguracionPage() {
  const [mode, setMode] = useState<HeroMode>('text');
  const [active, setActive] = useState(true);
  const [showTexts, setShowTexts] = useState(true);
  const [desktopImage, setDesktopImage] = useState('');
  const [mobileImage, setMobileImage] = useState('');

  const previewFile = (file: File | undefined, setter: (value: string) => void) => {
    if (!file) return;
    setter(URL.createObjectURL(file));
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Portada de la Home</h1>
          <p className="mt-1 text-sm text-gray-500">Elegí cómo querés mostrar la primera sección del sitio.</p>
        </div>
        <a href="/" target="_blank" className="inline-flex w-fit items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-bold text-gray-700">
          <Eye className="h-4 w-4" /> Ver Home
        </a>
      </div>

      <Card>
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
            <div>
              <p className="font-bold text-gray-950">Mostrar portada</p>
              <p className="text-xs text-gray-500">Apaga toda esta sección sin borrarla.</p>
            </div>
            <button type="button" onClick={() => setActive(!active)} className={`relative h-7 w-12 rounded-full transition ${active ? 'bg-corpicia-green' : 'bg-gray-300'}`} aria-pressed={active}>
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${active ? 'left-6' : 'left-1'}`} />
            </button>
          </div>

          <div>
            <Label className="mb-3 block text-base font-bold">¿Qué querés mostrar?</Label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setMode('text')} className={`rounded-xl border-2 p-4 text-left transition ${mode === 'text' ? 'border-corpicia-green bg-green-50' : 'border-gray-200 bg-white'}`}>
                <Type className="mb-3 h-6 w-6 text-corpicia-green" />
                <p className="font-bold">Texto</p>
                <p className="mt-1 text-xs text-gray-500">Portada verde con título y botones.</p>
              </button>
              <button type="button" onClick={() => setMode('banner')} className={`rounded-xl border-2 p-4 text-left transition ${mode === 'banner' ? 'border-corpicia-green bg-green-50' : 'border-gray-200 bg-white'}`}>
                <ImageIcon className="mb-3 h-6 w-6 text-corpicia-green" />
                <p className="font-bold">Banner</p>
                <p className="mt-1 text-xs text-gray-500">Usar una imagen como portada.</p>
              </button>
            </div>
          </div>

          {mode === 'text' ? (
            <div className="space-y-4 border-t pt-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold">Mostrar textos</p>
                  <p className="text-xs text-gray-500">Ocultalos sin perder el contenido.</p>
                </div>
                <button type="button" onClick={() => setShowTexts(!showTexts)} className={`relative h-7 w-12 rounded-full transition ${showTexts ? 'bg-corpicia-green' : 'bg-gray-300'}`} aria-pressed={showTexts}>
                  <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${showTexts ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
              {showTexts && <>
                <div><Label>Texto pequeño</Label><Input className="mt-1.5" defaultValue="Especialistas en espacios verdes en Paraguay" /></div>
                <div><Label>Título principal</Label><Input className="mt-1.5" defaultValue="Césped natural, paisajismo y riego automático" /></div>
                <div><Label>Descripción</Label><Input className="mt-1.5" defaultValue="Venta, instalación y asesoramiento profesional para hogares, empresas y proyectos." /></div>
                <div className="grid gap-4 sm:grid-cols-2"><div><Label>Botón principal</Label><Input className="mt-1.5" defaultValue="Cotizar proyecto" /></div><div><Label>Segundo botón</Label><Input className="mt-1.5" defaultValue="Ver productos" /></div></div>
              </>}
            </div>
          ) : (
            <div className="space-y-5 border-t pt-5">
              <div>
                <p className="font-bold">Banner Desktop</p>
                <p className="mb-2 text-xs text-gray-500">Recomendado: 1920 × 650 px · JPG, PNG o WebP</p>
                <label className="flex min-h-36 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-green-400">
                  {desktopImage ? <img src={desktopImage} alt="Vista previa desktop" className="h-44 w-full object-cover" /> : <span className="text-center text-sm font-semibold text-gray-600"><ImageIcon className="mx-auto mb-2 h-7 w-7" />Seleccionar imagen desktop</span>}
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => previewFile(e.target.files?.[0], setDesktopImage)} />
                </label>
              </div>
              <div>
                <p className="font-bold">Banner Mobile</p>
                <p className="mb-2 text-xs text-gray-500">Recomendado: 1080 × 1350 px · JPG, PNG o WebP</p>
                <label className="flex min-h-36 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-green-400">
                  {mobileImage ? <img src={mobileImage} alt="Vista previa mobile" className="h-56 w-full object-contain" /> : <span className="text-center text-sm font-semibold text-gray-600"><ImageIcon className="mx-auto mb-2 h-7 w-7" />Seleccionar imagen mobile</span>}
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => previewFile(e.target.files?.[0], setMobileImage)} />
                </label>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-xl bg-green-50 p-4">
                <div><p className="font-bold">Mostrar textos sobre el banner</p><p className="text-xs text-gray-500">Podés usar solo la imagen o combinarla con el título.</p></div>
                <button type="button" onClick={() => setShowTexts(!showTexts)} className={`relative h-7 w-12 shrink-0 rounded-full transition ${showTexts ? 'bg-corpicia-green' : 'bg-gray-300'}`} aria-pressed={showTexts}>
                  <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${showTexts ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            </div>
          )}

          <Button className="w-full min-h-12 text-base font-bold">
            <Save className="mr-2 h-4 w-4" /> Guardar portada
          </Button>
          <p className="text-center text-xs text-amber-700">Vista administrativa preparada. La persistencia y publicación se conectan con el almacenamiento/configuración del sitio en la siguiente integración.</p>
        </CardContent>
      </Card>
    </div>
  );
}

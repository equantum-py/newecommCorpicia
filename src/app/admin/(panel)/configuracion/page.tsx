'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, Image as ImageIcon, Save, Type, UploadCloud } from 'lucide-react';
import { saveHomeHeroSettings, uploadHomeHeroImage } from '@/lib/actions/admin-home-hero';
import { DEFAULT_HOME_HERO, type HomeHeroSettings } from '@/lib/repositories/home-hero';

export default function AdminConfiguracionPage() {
  const [data, setData] = useState<HomeHeroSettings>(DEFAULT_HOME_HERO);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<'desktop'|'mobile'|null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/home-hero', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(v => setData({ ...DEFAULT_HOME_HERO, ...v }))
      .catch(() => setError('No se pudo cargar la configuración actual.'))
      .finally(() => setLoading(false));
  }, []);

  const patch = (values: Partial<HomeHeroSettings>) => setData(v => ({ ...v, ...values }));

  const upload = async (file: File | undefined, target: 'desktop'|'mobile') => {
    if (!file) return;
    setError(''); setMessage(''); setUploading(target);
    const fd = new FormData(); fd.append('file', file); fd.append('target', target);
    const result = await uploadHomeHeroImage(fd);
    setUploading(null);
    if (!result.success || !result.publicUrl) return setError(result.error || 'No se pudo subir la imagen.');
    patch(target === 'desktop' ? { desktopImage: result.publicUrl } : { mobileImage: result.publicUrl });
    setMessage('Imagen cargada. Presioná Guardar portada para publicar el cambio.');
  };

  const save = async () => {
    setSaving(true); setError(''); setMessage('');
    const result = await saveHomeHeroSettings(data);
    setSaving(false);
    if (!result.success) return setError(result.error || 'No se pudo guardar.');
    setMessage('Portada guardada y publicada correctamente.');
  };

  if (loading) return <div className="p-8 text-sm text-gray-500">Cargando configuración...</div>;

  return <div className="mx-auto max-w-5xl space-y-5 pb-12">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-2xl font-bold tracking-tight">Portada de la Home</h1><p className="mt-1 text-sm text-gray-500">Configurá y publicá la primera sección del sitio.</p></div><a href="/" target="_blank" className="inline-flex w-fit items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-bold text-gray-700"><Eye className="h-4 w-4"/> Ver Home</a></div>
    <Card><CardContent className="space-y-6 pt-6">
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}
      {message && <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-800">{message}</div>}
      <div className="flex items-center justify-between gap-4 rounded-xl border p-4"><div><p className="font-bold">Mostrar portada</p><p className="text-xs text-gray-500">Apaga toda esta sección sin borrar su contenido.</p></div><button type="button" onClick={()=>patch({active:!data.active})} className={`relative h-7 w-12 rounded-full ${data.active?'bg-corpicia-green':'bg-gray-300'}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${data.active?'left-6':'left-1'}`}/></button></div>
      <div><Label className="mb-3 block text-base font-bold">¿Qué querés mostrar?</Label><div className="grid grid-cols-2 gap-3"><button type="button" onClick={()=>patch({mode:'text'})} className={`rounded-xl border-2 p-4 text-left ${data.mode==='text'?'border-corpicia-green bg-green-50':'border-gray-200'}`}><Type className="mb-3 h-6 w-6 text-corpicia-green"/><p className="font-bold">Texto</p><p className="mt-1 text-xs text-gray-500">Portada verde con título y botones.</p></button><button type="button" onClick={()=>patch({mode:'banner'})} className={`rounded-xl border-2 p-4 text-left ${data.mode==='banner'?'border-corpicia-green bg-green-50':'border-gray-200'}`}><ImageIcon className="mb-3 h-6 w-6 text-corpicia-green"/><p className="font-bold">Banner</p><p className="mt-1 text-xs text-gray-500">Imagen desktop/mobile como portada.</p></button></div></div>
      <div className="flex items-center justify-between gap-4 border-t pt-5"><div><p className="font-bold">Mostrar textos</p><p className="text-xs text-gray-500">Ocultalos sin perder el contenido.</p></div><button type="button" onClick={()=>patch({showTexts:!data.showTexts})} className={`relative h-7 w-12 rounded-full ${data.showTexts?'bg-corpicia-green':'bg-gray-300'}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${data.showTexts?'left-6':'left-1'}`}/></button></div>
      {data.showTexts && <div className="space-y-4"><div><Label>Texto pequeño</Label><Input className="mt-1.5" value={data.eyebrow} onChange={e=>patch({eyebrow:e.target.value})}/></div><div><Label>Título principal</Label><Input className="mt-1.5" value={data.title} onChange={e=>patch({title:e.target.value})}/></div><div><Label>Descripción</Label><Input className="mt-1.5" value={data.description} onChange={e=>patch({description:e.target.value})}/></div><div className="grid gap-4 sm:grid-cols-2"><div><Label>Botón principal</Label><Input className="mt-1.5" value={data.primaryButton} onChange={e=>patch({primaryButton:e.target.value})}/></div><div><Label>Segundo botón</Label><Input className="mt-1.5" value={data.secondaryButton} onChange={e=>patch({secondaryButton:e.target.value})}/></div></div></div>}
      {data.mode==='banner' && <div className="grid gap-5 border-t pt-5 sm:grid-cols-2">{(['desktop','mobile'] as const).map(target=>{const image=data[target==='desktop'?'desktopImage':'mobileImage'];return <div key={target}><p className="font-bold">Banner {target==='desktop'?'Desktop':'Mobile'}</p><p className="mb-2 text-xs text-gray-500">{target==='desktop'?'1920 × 650 px':'1080 × 1350 px'} · JPG, PNG o WebP · máx. 5 MB</p><label className={`relative flex cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed bg-gray-50 ${target==='desktop'?'aspect-[1920/650]':'aspect-[1080/1350] max-h-[420px]'}`}>{image?<img src={image} alt={`Vista previa banner ${target}`} className="absolute inset-0 h-full w-full object-contain"/>:<span className="text-center text-sm font-semibold text-gray-600"><UploadCloud className="mx-auto mb-2 h-7 w-7"/>{uploading===target?'Subiendo...':'Seleccionar imagen'}</span>}<input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" disabled={!!uploading} onChange={e=>upload(e.target.files?.[0],target)}/></label></div>})}</div>}
      <Button type="button" onClick={save} disabled={saving||!!uploading} className="min-h-12 w-full text-base font-bold"><Save className="mr-2 h-4 w-4"/>{saving?'Guardando y publicando...':'Guardar portada'}</Button>
      <p className="text-center text-xs text-gray-500">Los cambios se guardan en Supabase y actualizan la Home.</p>
    </CardContent></Card>
  </div>;
}

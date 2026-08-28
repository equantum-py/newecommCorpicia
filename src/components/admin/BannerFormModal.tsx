'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createBanner, updateBanner } from '@/lib/actions/admin-banners';
import { supabase } from '@/lib/supabase';
import { X, Save, UploadCloud, CheckCircle2 } from 'lucide-react';

type BannerFormModalProps = { isOpen: boolean; onClose: () => void; banner?: any };
type UploadBoxProps = {
  label: string; value: string; onChange: (value: string) => void;
  desktop?: boolean; required?: boolean;
};

function UploadBox({ label, value, onChange, desktop, required }: UploadBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const upload = async (file?: File) => {
    if (!file) return;
    setError('');
    if (!['image/webp', 'image/jpeg', 'image/png'].includes(file.type)) return setError('Usá una imagen WebP, JPG o PNG.');
    if (file.size > 5 * 1024 * 1024) return setError('La imagen no puede superar 5 MB.');
    if (!supabase) return setError('Supabase no está configurado en este entorno.');
    setUploading(true);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'webp';
    const path = `banners/${desktop ? 'desktop' : 'mobile'}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('media').upload(path, file, { cacheControl: '3600', upsert: false });
    if (uploadError) {
      setError(`No se pudo subir: ${uploadError.message}`);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from('media').getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-900">{label}{required && <span className="text-red-500"> *</span>}</label>
      <input ref={inputRef} type="file" accept="image/webp,image/jpeg,image/png" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
      <button type="button" disabled={uploading} onClick={() => inputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); upload(e.dataTransfer.files?.[0]); }} className="flex min-h-[118px] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 px-4 text-center transition hover:border-corpicia-green hover:bg-green-50/40">
        {value ? <CheckCircle2 className="mb-2 h-7 w-7 text-corpicia-green" /> : <UploadCloud className="mb-2 h-8 w-8 text-gray-400" />}
        <span className="text-sm font-semibold text-gray-800">{uploading ? 'Subiendo imagen...' : value ? 'Imagen cargada · cambiar imagen' : 'Arrastrá y soltá tu imagen aquí'}</span>
        <span className="mt-1 text-xs text-gray-500">o hacé clic para seleccionar · WebP, JPG, PNG · máx. 5 MB</span>
      </button>
      <div className="mt-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-900">
        <strong>{desktop ? 'Desktop recomendado: 1920 × 800 px (2.4:1)' : 'Mobile recomendado: 750 × 1334 px (9:16)'}</strong>
        <span className="mt-0.5 block">{desktop ? 'Para pantallas grandes y notebooks.' : 'Para celulares en formato vertical.'}</span>
      </div>
      {value && <p className="mt-2 truncate text-[11px] text-gray-400">{value}</p>}
      {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

export function BannerFormModal({ isOpen, onClose, banner }: BannerFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [type, setType] = useState('hero');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageDesktop, setImageDesktop] = useState('');
  const [imageMobile, setImageMobile] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaLink, setCtaLink] = useState('');
  const [orderIndex, setOrderIndex] = useState(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    setType(banner?.type || 'hero'); setTitle(banner?.title || ''); setSubtitle(banner?.subtitle || '');
    setImageDesktop(banner?.image_desktop || ''); setImageMobile(banner?.image_mobile || '');
    setCtaText(banner?.cta_text || ''); setCtaLink(banner?.cta_link || '');
    setOrderIndex(banner?.order_index || 0); setIsActive(banner?.is_active ?? true); setErrorMsg('');
  }, [banner, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErrorMsg('');
    if (!imageDesktop) return setErrorMsg('Cargá la imagen para Desktop.');
    setIsSubmitting(true);
    const formData = new FormData();
    if (banner?.id) formData.append('id', banner.id);
    Object.entries({ type, title, subtitle, image_desktop: imageDesktop, image_mobile: imageMobile, cta_text: ctaText, cta_link: ctaLink, order_index: orderIndex.toString(), is_active: isActive.toString() }).forEach(([k, v]) => formData.append(k, v));
    const result = banner?.id ? await updateBanner(null, formData) : await createBanner(null, formData);
    if (result.success) onClose(); else setErrorMsg(result.message || 'Error al guardar el banner');
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/45">
      <div className="flex h-full w-full max-w-[620px] flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-5"><h2 className="text-xl font-bold">{banner ? 'Editar Banner' : 'Nuevo Banner'}</h2><button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100"><X className="h-5 w-5 text-gray-500" /></button></div>
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            {errorMsg && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errorMsg}</div>}
            <section><h3 className="font-bold">1. Tipo / Ubicación</h3><p className="mb-2 text-xs text-gray-500">Elegí dónde se mostrará este banner.</p><select value={type} onChange={(e) => setType(e.target.value)} className="h-11 w-full rounded-lg border px-3 text-sm"><option value="hero">Hero (Principal arriba)</option><option value="secondary">Secundario (Entre secciones)</option></select></section>
            <section className="border-t pt-5"><h3 className="font-bold">2. Estado</h3><p className="mb-2 text-xs text-gray-500">¿Está visible en el sitio web?</p><label className="inline-flex cursor-pointer items-center gap-3"><input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-5 w-5 accent-green-700"/><span className="text-sm font-semibold">{isActive ? 'Activo (Visible)' : 'Inactivo (Oculto)'}</span></label></section>
            <section className="space-y-5 border-t pt-5"><div><h3 className="font-bold">3. Imágenes</h3><p className="text-xs text-gray-500">Subí una versión para computadora y otra optimizada para celular.</p></div><UploadBox label="Imagen para Desktop" value={imageDesktop} onChange={setImageDesktop} desktop required /><UploadBox label="Imagen para Mobile" value={imageMobile} onChange={setImageMobile} /></section>
            <details className="rounded-xl border bg-gray-50 p-4"><summary className="cursor-pointer text-sm font-bold">Opciones avanzadas</summary><div className="mt-4 space-y-4"><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título opcional"/><Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Subtítulo opcional"/><div className="grid gap-3 sm:grid-cols-2"><Input value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="Texto del botón"/><Input value={ctaLink} onChange={(e) => setCtaLink(e.target.value)} placeholder="Enlace del botón"/></div><div><label className="mb-1 block text-xs font-semibold">Orden</label><Input type="number" value={orderIndex} onChange={(e) => setOrderIndex(parseInt(e.target.value) || 0)} min="0" className="w-28"/></div></div></details>
          </div>
          <div className="flex justify-end gap-3 border-t bg-white p-5"><Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button><Button type="submit" disabled={isSubmitting} className="bg-corpicia-green hover:bg-green-700">{isSubmitting ? 'Guardando...' : <><Save className="mr-2 h-4 w-4"/>Guardar Banner</>}</Button></div>
        </form>
      </div>
    </div>
  );
}

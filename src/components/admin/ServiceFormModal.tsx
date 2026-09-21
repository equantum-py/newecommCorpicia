'use client';

import Image from 'next/image';
import { ChangeEvent, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createServiceAction, updateServiceAction, uploadServiceImageAction } from '@/lib/actions/admin-services';
import { ImagePlus, Loader2, Trash2, Upload, X } from 'lucide-react';

type ServiceFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  service?: any;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function sanitizeFileName(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase() || 'webp';
  const baseName = fileName
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${baseName || 'servicio'}-${Date.now()}.${extension}`;
}

export function ServiceFormModal({ isOpen, onClose, service }: ServiceFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [imageUrl, setImageUrl] = useState(service?.image_url || '');
  const inputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const generateSlug = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const handleTitleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slugInput = document.getElementById('slug') as HTMLInputElement;
    if (title && slugInput && !slugInput.value) {
      slugInput.value = generateSlug(title);
    }
  };

  const handleImageSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMsg('La imagen debe ser JPG, PNG o WebP.');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrorMsg('La imagen supera el máximo permitido de 5 MB.');
      event.target.value = '';
      return;
    }

    setUploadingImage(true);
    setErrorMsg('');

    try {
      const uploadData = new FormData();
      uploadData.set('file', file);
      const result = await uploadServiceImageAction(uploadData);

      if (!result.success || !result.url) {
        throw new Error(result.error || 'No se pudo subir la imagen.');
      }

      setImageUrl(result.url);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'No se pudo subir la imagen.');
    } finally {
      setUploadingImage(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const formData = new FormData(e.currentTarget);
    formData.set('image_url', imageUrl);
    formData.set('is_active', formData.has('is_active') ? 'true' : 'false');

    try {
      const result = service?.id
        ? await updateServiceAction(service.id, formData)
        : await createServiceAction(formData);

      if (result.success) {
        onClose();
      } else {
        setErrorMsg(result.error || 'Error al guardar el servicio');
      }
    } catch {
      setErrorMsg('Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-y-auto rounded-xl bg-white shadow-lg">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-bold">{service ? 'Editar Servicio' : 'Nuevo Servicio'}</h2>
          <button onClick={onClose} className="rounded-full p-1 transition-colors hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {errorMsg && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Título / Nombre *</Label>
              <Input id="title" name="title" defaultValue={service?.title} onBlur={handleTitleBlur} required placeholder="Ej: Instalación de Césped" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL) *</Label>
              <Input id="slug" name="slug" defaultValue={service?.slug} required placeholder="ej: instalacion-de-cesped" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <textarea
              id="description"
              name="description"
              defaultValue={service?.description}
              rows={4}
              placeholder="Descripción del servicio que se mostrará al público"
              className="flex min-h-[80px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-corpicia-green"
            />
          </div>

          <div className="space-y-3">
            <Label>Imagen del servicio</Label>
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageSelect} />

            {imageUrl ? (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="relative aspect-[16/9] w-full bg-gray-100">
                  <Image src={imageUrl} alt="Vista previa del servicio" fill className="object-cover" sizes="640px" />
                </div>
                <div className="flex flex-wrap items-center gap-2 p-3">
                  <Button type="button" variant="outline" disabled={uploadingImage} onClick={() => inputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" /> Cambiar imagen
                  </Button>
                  <Button type="button" variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setImageUrl('')}>
                    <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                disabled={uploadingImage}
                onClick={() => inputRef.current?.click()}
                className="flex min-h-40 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-green-300 bg-green-50 px-6 py-8 text-center transition hover:border-green-500 hover:bg-green-100 disabled:opacity-60"
              >
                {uploadingImage ? <Loader2 className="mb-3 h-9 w-9 animate-spin text-green-700" /> : <ImagePlus className="mb-3 h-10 w-10 text-green-700" />}
                <span className="font-medium text-gray-900">{uploadingImage ? 'Subiendo imagen...' : 'Adjuntar imagen'}</span>
                <span className="mt-1 text-sm text-gray-500">JPG, PNG o WebP · máximo 5 MB</span>
              </button>
            )}

            <input type="hidden" name="image_url" value={imageUrl} readOnly />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="order_index">Orden</Label>
              <Input id="order_index" name="order_index" type="number" min="0" defaultValue={service?.order_index || 0} />
            </div>
            <div className="flex flex-col justify-center space-y-2">
              <Label htmlFor="is_active">Activo (Visible)</Label>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="is_active" name="is_active" defaultChecked={service ? service.is_active : true} className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-corpicia-green focus:ring-corpicia-green" />
                <span className="text-sm text-gray-500">Visible al público</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading || uploadingImage} className="bg-corpicia-green text-white hover:bg-green-700">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {service ? 'Guardar Cambios' : 'Crear Servicio'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

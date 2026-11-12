'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { BannerFormModal } from './BannerFormModal';
import { deleteBanner, toggleBannerStatus } from '@/lib/actions/admin-banners';
import { useRouter } from 'next/navigation';

export function BannerListClient({ banners }: { banners: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const router = useRouter();
  const [location, setLocation] = useState<'hero' | 'secondary'>('hero');
  const [actionError, setActionError] = useState('');

  const heroBanners = banners.filter(b => b.type === 'hero').sort((a, b) => a.order_index - b.order_index);
  const secondaryBanners = banners.filter(b => b.type === 'secondary').sort((a, b) => a.order_index - b.order_index);

  const currentHero = heroBanners.find(b => b.is_active && (b.image_desktop || b.image_mobile));

  const handleNew = () => {
    setEditingBanner(null);
    setIsModalOpen(true);
  };

  const handleEdit = (banner: any) => {
    setEditingBanner(banner);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este banner? Esta acción no se puede deshacer.')) {
      setIsDeleting(id);
      const result = await deleteBanner(id);
      setActionError(result.success ? '' : result.message);
      if (result.success) router.refresh();
      setIsDeleting(null);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const result = await toggleBannerStatus(id, currentStatus);
    setActionError(result.success ? '' : result.message);
    if (result.success) router.refresh();
  };

  const renderBannerRow = (banner: any) => (
    <div key={banner.id} className={`flex items-center gap-4 p-4 hover:bg-gray-50/50 transition-colors ${!banner.is_active ? 'opacity-60' : ''}`}>

      
      <div className="w-24 h-16 sm:w-32 sm:h-20 rounded bg-gray-100 flex-shrink-0 relative overflow-hidden border">
        {banner.image_desktop ? (
          <Image src={banner.image_desktop} alt={banner.title || 'Banner'} fill className="object-cover" />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-400">
            <ImageIcon className="w-6 h-6" />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate">{banner.title || <span className="italic text-gray-400">Sin título</span>}</h3>
        <p className="text-sm text-gray-500 truncate">{banner.subtitle || <span className="italic text-gray-400">Sin subtítulo</span>}</p>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <button 
            onClick={() => handleToggleStatus(banner.id, banner.is_active)}
            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium transition-colors hover:opacity-80 ${banner.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
          >
            {banner.is_active ? 'Activo' : 'Inactivo'}
          </button>
          <span className="text-xs font-mono text-gray-400 bg-gray-50 px-1 rounded">Orden: {banner.order_index}</span>
          {banner.type === 'hero' && banner.id === currentHero?.id && (
            <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">En portada</span>
          )}
          {banner.cta_text && (
            <span className="text-xs text-blue-600 bg-blue-50 px-1 rounded truncate max-w-[120px]">CTA: {banner.cta_text}</span>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-end gap-1 sm:gap-2 border-l pl-2 sm:pl-4">
        <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(banner.id, banner.is_active)} className="text-xs hidden md:flex">
          {banner.is_active ? 'Desactivar' : 'Activar'}
        </Button>
        <Button aria-label={`Editar ${banner.title || 'banner'}`} variant="ghost" size="icon" onClick={() => handleEdit(banner)} className="h-8 w-8 text-gray-500 hover:text-corpicia-green hover:bg-green-50">
          <Edit className="w-4 h-4" />
        </Button>
        <Button aria-label={`Eliminar ${banner.title || 'banner'}`} variant="ghost" size="icon" onClick={() => handleDelete(banner.id)} disabled={isDeleting === banner.id} className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Banners</h1>
          <p className="text-gray-500">Administrá cada banner según su ubicación en la Home.</p>
          <p className="text-sm text-gray-500 mt-1">Elegí una ubicación para crear o editar sus imágenes.</p>
        </div>
        <Button onClick={handleNew} className="w-full sm:w-auto gap-2 bg-corpicia-green hover:bg-green-700">
          <Plus className="w-4 h-4" /> {location === 'hero' ? 'Nuevo banner principal' : 'Nuevo banner del medio'}
        </Button>
      </div>

      {actionError && <p role="alert" className="mb-4 text-sm text-red-600">{actionError}</p>}
      <div aria-label="Ubicación del banner" className="mb-5 grid gap-3 sm:grid-cols-2">
        {([
          { value: 'hero', title: 'Banner principal', description: 'Arriba de la Home, debajo del menú.', count: heroBanners.length },
          { value: 'secondary', title: 'Banners del medio', description: 'En Soluciones destacadas, después de los productos.', count: secondaryBanners.length },
        ] as const).map(item => (
          <button key={item.value} type="button" aria-pressed={location === item.value} onClick={() => setLocation(item.value)} className={`rounded-xl border-2 p-4 text-left transition-colors ${location === item.value ? 'border-corpicia-green bg-green-50' : 'border-gray-200 bg-white hover:border-green-300'}`}>
            <span className="flex items-center justify-between font-semibold">{item.title}<span className="rounded-full bg-white px-2 py-0.5 text-xs text-gray-600">{item.count}</span></span>
            <span className="mt-1 block text-sm text-gray-600">{item.description}</span>
          </button>
        ))}
      </div>
      <section aria-label={location === 'hero' ? 'Banner principal' : 'Banners del medio'}>
        <h2 className="text-lg font-semibold">{location === 'hero' ? 'Banner principal · Inicio de la Home' : 'Banners del medio · Soluciones destacadas'}</h2>
        <p className="mb-4 mt-1 text-sm text-gray-600">{location === 'hero'
          ? 'Se muestra el primer banner activo según el orden. La etiqueta En portada indica cuál está visible.'
          : 'Se muestran hasta 3 banners activos según el orden. Estos banners aparecen únicamente en el medio de la Home.'}</p>
        {(location === 'hero' ? heroBanners : secondaryBanners).length > 0 ? (
          <div className="divide-y overflow-hidden rounded-xl border bg-white shadow-sm">
            {(location === 'hero' ? heroBanners : secondaryBanners).map(renderBannerRow)}
          </div>
        ) : (
          <div className="rounded-xl border bg-white p-8 text-center">
            <ImageIcon className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="font-semibold">Todavía no hay banners en esta ubicación.</p>
            <Button onClick={handleNew} className="mt-4 bg-corpicia-green hover:bg-green-700"><Plus className="mr-2 h-4 w-4" /> Agregar banner</Button>
          </div>
        )}
        <p className="mt-3 text-xs text-gray-500">Para mover un banner, editá su ubicación y guardá los cambios.</p>
      </section>

      <BannerFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        banner={editingBanner}
        defaultType={location}
        onSaved={() => router.refresh()} 
      />
    </>
  );
}

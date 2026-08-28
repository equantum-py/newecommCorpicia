'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Copy, Image as ImageIcon } from 'lucide-react';
import { MediaFormModal } from './MediaFormModal';
import { deleteMediaAssetAction } from '@/lib/actions/admin-media';

type MediaGridProps = { assets: any[] };

export function MediaGrid({ assets }: MediaGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<any>(null);

  const filteredAssets = assets.filter(asset =>
    asset.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (asset.alt_text && asset.alt_text.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleNew = () => { setEditingAsset(null); setIsModalOpen(true); };
  const handleEdit = (asset: any) => { setEditingAsset(asset); setIsModalOpen(true); };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este recurso? Esta acción no se puede deshacer.')) {
      const result = await deleteMediaAssetAction(id);
      if (!result.success) alert(result.error || 'Error al eliminar');
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
      .then(() => alert('URL copiada al portapapeles'))
      .catch(() => alert('Error al copiar URL'));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Multimedia</h1>
          <p className="text-gray-500">Gestioná imágenes y recursos visuales reutilizables para la web.</p>
        </div>
        <button onClick={handleNew} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-corpicia-green disabled:opacity-50 bg-corpicia-green text-white hover:bg-green-700 h-10 px-4 py-2 gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Nuevo recurso
        </button>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <input placeholder="Buscar recurso..." className="flex h-10 w-full rounded-md border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-corpicia-green focus-visible:border-transparent" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {filteredAssets.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 flex flex-col items-center justify-center text-center space-y-4 shadow-sm">
          <ImageIcon className="w-12 h-12 text-gray-300" />
          <p className="text-gray-500">{searchTerm ? 'No se encontraron resultados.' : 'No hay recursos multimedia cargados todavía.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredAssets.map((asset) => (
            <div key={asset.id} className="bg-white rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
              <div className="relative aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                {asset.url ? (
                  <Image
                    src={asset.url}
                    alt={asset.alt_text || asset.file_name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover"
                  />
                ) : (
                  <ImageIcon className="w-10 h-10 text-gray-300" />
                )}

                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => handleCopyUrl(asset.url)} className="p-2 bg-white text-gray-900 rounded-full hover:bg-gray-100" title="Copiar URL"><Copy className="w-4 h-4" /></button>
                  <button onClick={() => handleEdit(asset)} className="p-2 bg-white text-gray-900 rounded-full hover:bg-gray-100" title="Editar"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(asset.id)} className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-medium text-gray-900 line-clamp-1" title={asset.file_name}>{asset.file_name}</h3>
                <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                  <span className="uppercase tracking-wider">{asset.file_type}</span>
                  <span>{new Date(asset.created_at).toLocaleDateString('es-PY')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <MediaFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} asset={editingAsset} />
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ClipboardCheck,
  Plus,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  Copy,
  FileSpreadsheet,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { PRODUCT_IMAGE_FALLBACKS } from '@/lib/product-image-fallbacks';
import { deleteProduct, duplicateProduct, toggleProductStatus, updateHomeProductOrder } from '@/lib/actions/admin-products';

function getAdminProductImage(product: any) {
  const dbImage =
    product.product_images?.find((img: any) => img.order_index === 0)?.image_url ||
    product.product_images?.[0]?.image_url;

  return dbImage || PRODUCT_IMAGE_FALLBACKS[product.slug] || '/og-image.jpg';
}


export default function ProductsTable({ products }: { products: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const initialHomeProducts = useMemo(() => products.filter((p: any) => p.home_order_index != null).sort((a: any,b: any) => a.home_order_index-b.home_order_index).map((p:any)=>p.id), [products]);
  const [homeProductIds, setHomeProductIds] = useState<string[]>(initialHomeProducts);
  const [savingHomeOrder, setSavingHomeOrder] = useState(false);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleHomeProduct = (id: string) => {
    setHomeProductIds((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current, id].slice(0, 12));
  };

  const moveHomeProduct = (id: string, direction: -1 | 1) => {
    setHomeProductIds((current) => {
      const index = current.indexOf(id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  };

  const saveHomeOrder = async () => {
    setSavingHomeOrder(true);
    try {
      const res = await updateHomeProductOrder(homeProductIds);
      alert(res.success ? 'Orden del Home guardado.' : 'Error: ' + res.message);
    } finally {
      setSavingHomeOrder(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;
    setLoading(true);
    try {
      const res = await deleteProduct(id);
      if (!res.success) {
        alert(`Error: ${res.message}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    setLoading(true);
    try {
      const res = await duplicateProduct(id);
      if (!res.success) {
        alert(`Error: ${res.message}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setLoading(true);
    try {
      const res = await toggleProductStatus(id, !currentStatus);
      if (!res.success) {
        alert(`Error: ${res.message}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Productos</h1>
          <p className="text-gray-500">Catálogo actual de {products.length} productos.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/admin/productos/auditoria">
            <Button variant="outline" className="w-full sm:w-auto gap-2">
              <ClipboardCheck className="w-4 h-4" />
              Auditar catálogo
            </Button>
          </Link>

          <Link href="/admin/productos/importar">
            <Button variant="outline" className="w-full sm:w-auto gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Importar productos
            </Button>
          </Link>

          <Link href="/admin/productos/nuevo">
            <Button className="w-full sm:w-auto gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Producto
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white border rounded-xl shadow-sm p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-gray-900">Productos destacados del Home</h2>
            <p className="text-sm text-gray-500">Orden predeterminado: <strong>Manualmente</strong>. Elegí los productos y definí cuál aparece 1°, 2°, 3° y así sucesivamente.</p>
          </div>
          <Button onClick={saveHomeOrder} disabled={savingHomeOrder}>{savingHomeOrder ? 'Guardando...' : 'Guardar orden'}</Button>
        </div>
        <div className="mt-4 space-y-2">
          {homeProductIds.length === 0 && <p className="text-sm text-gray-500">Todavía no seleccionaste productos para el Home.</p>}
          {homeProductIds.map((id, index) => {
            const product = products.find((p:any) => p.id === id);
            if (!product) return null;
            return <div key={id} className="flex items-center gap-3 rounded-lg border p-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded bg-green-50 text-sm font-bold text-corpicia-green">{index + 1}</span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{product.name}</span>
              <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => moveHomeProduct(id,-1)} disabled={index===0}><ArrowUp className="h-4 w-4"/></Button>
              <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => moveHomeProduct(id,1)} disabled={index===homeProductIds.length-1}><ArrowDown className="h-4 w-4"/></Button>
              <Button type="button" variant="outline" className="h-8 text-xs" onClick={() => toggleHomeProduct(id)}>Quitar</Button>
            </div>
          })}
        </div>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              className="pl-9" 
              placeholder="Buscar productos..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 bg-gray-50 uppercase border-b">
              <tr>
                <th className="px-6 py-4 font-semibold">Producto</th>
                <th className="px-6 py-4 font-semibold">Categoría</th>
                <th className="px-6 py-4 font-semibold">Precio Base</th>
                <th className="px-6 py-4 font-semibold">Unidad</th>
                <th className="px-6 py-4 font-semibold text-center">Home</th>\n                <th className="px-6 py-4 font-semibold text-center">Estado</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredProducts.map((product) => {
                const mainImg = getAdminProductImage(product);
                
                return (
                  <tr key={product.id} className={`hover:bg-gray-50/50 ${product.is_active !== true ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-gray-100 flex-shrink-0 relative overflow-hidden">
                          <Image src={mainImg} alt={product.name} fill className="object-cover" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 flex items-center gap-2">
                            {product.name}
                            {product.is_featured && (
                              <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 rounded uppercase">Dest.</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">{product.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                        {product.categories?.name || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {formatPrice(product.price_amount)}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {product.unit} (Mín: {product.min_order_quantity})
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button type="button" onClick={() => toggleHomeProduct(product.id)} className={`rounded-md border px-2.5 py-1.5 text-xs font-semibold ${homeProductIds.includes(product.id) ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'}`}>
                        {homeProductIds.includes(product.id) ? `#${homeProductIds.indexOf(product.id)+1}` : 'Agregar'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                            product.is_active === true
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {product.is_active === true ? 'Activo' : 'Inactivo'}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(product.id, product.is_active === true)}
                          disabled={loading}
                          className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                            product.is_active === true
                              ? 'border-red-200 text-red-700 bg-red-50 hover:bg-red-100'
                              : 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100'
                          }`}
                        >
                          {loading
                            ? 'Guardando...'
                            : product.is_active === true
                              ? 'Desactivar'
                              : 'Activar'}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-corpicia-green" disabled={loading} onClick={() => handleDuplicate(product.id)} title="Duplicar">
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Link href={`/admin/productos/${product.id}/editar`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600" disabled={loading} title="Editar">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-red-600" onClick={() => handleDelete(product.id)} disabled={loading} title="Eliminar">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Link href={`/productos/${product.slug}`} target="_blank">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900" title="Ver en tienda">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No se encontraron productos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
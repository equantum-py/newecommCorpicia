'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, ArrowLeft, Sparkles } from 'lucide-react';
import { createProduct, updateProduct } from '@/lib/actions/admin-products';
import { generateProductContentWithAI } from '@/lib/actions/admin-product-ai';
import Link from 'next/link';
import ProductImageUploader from '@/components/admin/ProductImageUploader';

export default function ProductForm({ product = null, categories = [] }: { product?: any, categories: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoAiExecuted = useRef(false);
  const returnToAudit = searchParams.get('returnTo') === 'audit';
  const shouldAutoGenerate = searchParams.get('autoAI') === '1';

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedUnit, setSelectedUnit] = useState(product?.unit || 'm2');
  const [name, setName] = useState(product?.name || '');
  const [shortDescription, setShortDescription] = useState(
    product?.short_description || ''
  );
  const [description, setDescription] = useState(product?.description || '');
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    product?.category_id || ''
  );
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [seoTitle, setSeoTitle] = useState(product?.seo_title || '');
  const [seoDescription, setSeoDescription] = useState(
    product?.seo_description || ''
  );
  const [seoKeywords, setSeoKeywords] = useState(
    Array.isArray(product?.seo_keywords)
      ? product.seo_keywords.join(', ')
      : ''
  );

  const getUnitLabel = (unit: string) => {
    switch (unit) {
      case 'm2':
        return 'm²';
      case 'kg':
        return 'kg';
      case 'bolsa':
        return 'bolsa';
      case 'bolsa_30kg':
        return 'Bolsa de 30 (kg)';
      case 'bolsa_50kg':
        return 'Bolsa de 50 (kg)';
      case 'litro':
        return 'litro';
      case 'metro_lineal':
        return 'metro lineal';
      case 'unidad':
        return 'unidad';
      case 'docena':
        return 'docena';
      case 'visita':
        return 'visita';
      case 'servicio':
        return 'servicio';
      default:
        return unit;
    }
  };

  const normalizeTiers = (prod: any) => {
    const rawTiers = prod?.product_price_tiers || prod?.priceTiers || prod?.tiers || [];
    return rawTiers.map((t: any) => ({
      minQuantity: Number(t.minQuantity ?? t.min_quantity ?? t.min ?? 1),
      maxQuantity: (t.maxQuantity ?? t.max_quantity ?? t.max) === null || (t.maxQuantity ?? t.max_quantity ?? t.max) === '' 
        ? null 
        : Number(t.maxQuantity ?? t.max_quantity ?? t.max),
      price: Number(t.price ?? t.price_amount ?? 0),
      isPromo: Boolean(t.isPromo ?? t.is_promo ?? false)
    })).sort((a: any, b: any) => a.minQuantity - b.minQuantity);
  };

  // Complex fields states
  const [images, setImages] = useState<any[]>(
    product?.product_images?.map((img: any) => ({ ...img, is_main: img.order_index === 0 })) || [{ image_url: '', is_main: true }]
  );
  const [tiers, setTiers] = useState<any[]>(normalizeTiers(product));
  const [features, setFeatures] = useState<any[]>(
    product?.product_features || []
  );
  const [specs, setSpecs] = useState<any[]>(
    product?.product_specifications || []
  );
  const [recs, setRecs] = useState<any[]>(
    product?.product_recommendations || []
  );

  const handleGenerateWithAI = async () => {
    setAiMessage('');

    if (!name.trim()) {
      setAiMessage('Ingresá primero el nombre del producto.');
      return;
    }

    const selectedCategory = categories.find(
      (category: any) => category.id === selectedCategoryId
    );

    setAiLoading(true);

    try {
      const result = await generateProductContentWithAI({
        name: name.trim(),
        category: selectedCategory?.name || '',
        currentDescription: description,
        currentShortDescription: shortDescription,
      });

      if (!result.success) {
        setAiMessage(result.message);
        return;
      }

      setShortDescription(result.content.short_description);
      setDescription(result.content.description);
      setFeatures(result.content.features);
      setSpecs(result.content.specifications);
      setRecs(result.content.recommendations);
      setSeoTitle(result.content.seo_title);
      setSeoDescription(result.content.seo_description);
      setSeoKeywords(result.content.seo_keywords.join(', '));

      setAiMessage(
        'Contenido generado. Revisá los textos antes de guardar el producto.'
      );
    } catch (error) {
      setAiMessage(
        error instanceof Error
          ? error.message
          : 'No se pudo generar el contenido con IA.'
      );
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (
      !shouldAutoGenerate ||
      autoAiExecuted.current ||
      aiLoading ||
      !name.trim()
    ) {
      return;
    }

    autoAiExecuted.current = true;
    void handleGenerateWithAI();
  }, [shouldAutoGenerate, name]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    const formData = new FormData(e.currentTarget);

    // Validate Tiers
    if (tiers.length > 0) {
      for (const t of tiers) {
        if (t.minQuantity < 1) {
          setErrorMsg('El valor "Desde" debe ser mayor a 0 en todas las escalas de precio.');
          setLoading(false);
          return;
        }
        if (t.price <= 0) {
          setErrorMsg('El "Precio por unidad" debe ser mayor a 0 en todas las escalas de precio.');
          setLoading(false);
          return;
        }
        if (t.maxQuantity !== null && t.maxQuantity !== '' && t.maxQuantity < t.minQuantity) {
          setErrorMsg('El valor "Hasta" no puede ser menor que "Desde".');
          setLoading(false);
          return;
        }
      }

      // Check overlapping
      const sortedTiers = [...tiers].sort((a, b) => a.minQuantity - b.minQuantity);
      for (let i = 0; i < sortedTiers.length - 1; i++) {
        const current = sortedTiers[i];
        const next = sortedTiers[i + 1];
        
        const currentMax = (current.maxQuantity === null || current.maxQuantity === '') ? Infinity : current.maxQuantity;
        
        if (next.minQuantity <= currentMax) {
          setErrorMsg('Hay escalas que se cruzan. Revisá los rangos.');
          setLoading(false);
          return;
        }
      }
    }

    const validImages = images.filter(i => i.image_url.trim() !== '');
    const validTiers = tiers; // Already validated
    const validFeatures = features.filter(f => f.feature_text.trim() !== '');
    const validSpecs = specs.filter(s => s.spec_key.trim() !== '' && s.spec_value.trim() !== '');
    const validRecs = recs.filter(r => r.recommendation_text.trim() !== '');

    formData.append('images', JSON.stringify(validImages));
    formData.append('price_tiers', JSON.stringify(validTiers));
    formData.append('features', JSON.stringify(validFeatures));
    formData.append('specifications', JSON.stringify(validSpecs));
    formData.append('recommendations', JSON.stringify(validRecs));

    try {
      let res;
      if (product) {
        res = await updateProduct(product.id, null, formData);
      } else {
        res = await createProduct(null, formData);
      }
      
      if (!res.success) {
        setErrorMsg(res.message);
      } else {
        router.push(
          returnToAudit
            ? '/admin/productos/auditoria'
            : '/admin/productos'
        );
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-20">
      <div className="flex items-center gap-4 border-b pb-4">
        <Link href="/admin/productos">
          <Button type="button" variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{product ? 'Editar Producto' : 'Nuevo Producto'}</h1>
          <p className="text-gray-500">{product ? 'Actualiza los datos del producto' : 'Agrega un nuevo producto al catálogo'}</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
          {errorMsg}
        </div>
      )}

      <div className="rounded-xl border border-green-200 bg-green-50 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 font-semibold text-green-900">
              <Sparkles className="h-5 w-5" />
              Asistente IA de productos
            </div>

            <p className="mt-1 text-sm text-green-800">
              Gemini puede generar descripciones, características,
              especificaciones y recomendaciones. Los cambios no se guardan
              hasta que presiones el botón de guardar.
            </p>
          </div>

          <Button
            type="button"
            onClick={handleGenerateWithAI}
            disabled={aiLoading || !name.trim()}
            className="shrink-0 gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {aiLoading ? 'Generando...' : 'Generar contenido con IA'}
          </Button>
        </div>

        {aiMessage && (
          <div
            className={`mt-4 rounded-md border px-3 py-2 text-sm ${
              aiMessage.startsWith('Contenido generado')
                ? 'border-green-200 bg-white text-green-800'
                : 'border-amber-200 bg-amber-50 text-amber-800'
            }`}
          >
            {aiMessage}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* COLUMNA PRINCIPAL */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
            <h2 className="font-semibold text-lg border-b pb-2">Información Básica</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre *</label>
                <Input
                  name="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug *</label>
                <Input name="slug" defaultValue={product?.slug || ''} required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Descripción Corta</label>
              <textarea 
                name="short_description"
                value={shortDescription}
                onChange={(event) => setShortDescription(event.target.value)} 
                className="w-full flex min-h-[60px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Descripción Completa</label>
              <textarea 
                name="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)} 
                className="w-full flex min-h-[120px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
            <div className="border-b pb-3">
              <h2 className="font-semibold text-lg">
                Imágenes del producto
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Subí las imágenes desde tu computadora. La primera imagen
                principal será utilizada también por Google Merchant.
              </p>
            </div>

            <ProductImageUploader
              images={images.filter(
                (image) => image.image_url?.trim()
              )}
              onChange={setImages}
            />
          </div>

          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
            <h2 className="font-semibold text-lg border-b pb-2">Características</h2>
            {features.map((feat, idx) => (
              <div key={idx} className="flex gap-2">
                <Input 
                  value={feat.feature_text} 
                  onChange={e => {
                    const newFeatures = [...features];
                    newFeatures[idx].feature_text = e.target.value;
                    setFeatures(newFeatures);
                  }} 
                />
                <Button type="button" variant="ghost" size="icon" className="text-red-600 shrink-0" onClick={() => setFeatures(features.filter((_, i) => i !== idx))}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => setFeatures([...features, { feature_text: '' }])}>
              <Plus className="w-4 h-4 mr-2" /> Agregar Característica
            </Button>
          </div>

          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
            <h2 className="font-semibold text-lg border-b pb-2">Especificaciones (Clave/Valor)</h2>
            {specs.map((spec, idx) => (
              <div key={idx} className="flex gap-2">
                <Input 
                  placeholder="Ej: Material"
                  value={spec.spec_key} 
                  onChange={e => {
                    const newSpecs = [...specs];
                    newSpecs[idx].spec_key = e.target.value;
                    setSpecs(newSpecs);
                  }} 
                />
                <Input 
                  placeholder="Ej: Cerámica"
                  value={spec.spec_value} 
                  onChange={e => {
                    const newSpecs = [...specs];
                    newSpecs[idx].spec_value = e.target.value;
                    setSpecs(newSpecs);
                  }} 
                />
                <Button type="button" variant="ghost" size="icon" className="text-red-600 shrink-0" onClick={() => setSpecs(specs.filter((_, i) => i !== idx))}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => setSpecs([...specs, { spec_key: '', spec_value: '' }])}>
              <Plus className="w-4 h-4 mr-2" /> Agregar Especificación
            </Button>
          </div>

          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
            <h2 className="font-semibold text-lg border-b pb-2">Recomendaciones</h2>
            {recs.map((rec, idx) => (
              <div key={idx} className="flex gap-2">
                <textarea 
                  value={rec.recommendation_text} 
                  onChange={e => {
                    const newRecs = [...recs];
                    newRecs[idx].recommendation_text = e.target.value;
                    setRecs(newRecs);
                  }} 
                  className="w-full flex min-h-[60px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <Button type="button" variant="ghost" size="icon" className="text-red-600 shrink-0 mt-2" onClick={() => setRecs(recs.filter((_, i) => i !== idx))}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => setRecs([...recs, { recommendation_text: '' }])}>
              <Plus className="w-4 h-4 mr-2" /> Agregar Recomendación
            </Button>
          </div>

          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-5">
            <div className="border-b pb-3">
              <h2 className="font-semibold text-lg">
                SEO del producto
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Configurá cómo aparecerá este producto en Google.
              </p>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between gap-3">
                <label className="block text-sm font-medium">
                  Título SEO
                </label>

                <span
                  className={`text-xs ${
                    seoTitle.length > 60
                      ? 'text-red-600'
                      : 'text-gray-500'
                  }`}
                >
                  {seoTitle.length}/60
                </span>
              </div>

              <Input
                name="seo_title"
                value={seoTitle}
                onChange={(event) => setSeoTitle(event.target.value)}
                placeholder="Ej.: Guembe para paisajismo | Corpicia"
                maxLength={70}
              />

              <p className="mt-1 text-xs text-gray-500">
                Recomendado: entre 45 y 60 caracteres.
              </p>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between gap-3">
                <label className="block text-sm font-medium">
                  Meta descripción
                </label>

                <span
                  className={`text-xs ${
                    seoDescription.length > 160
                      ? 'text-red-600'
                      : 'text-gray-500'
                  }`}
                >
                  {seoDescription.length}/160
                </span>
              </div>

              <textarea
                name="seo_description"
                value={seoDescription}
                onChange={(event) =>
                  setSeoDescription(event.target.value)
                }
                placeholder="Descripción breve para los resultados de Google."
                maxLength={180}
                className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />

              <p className="mt-1 text-xs text-gray-500">
                Recomendado: entre 140 y 160 caracteres.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Palabras clave
              </label>

              <textarea
                name="seo_keywords"
                value={seoKeywords}
                onChange={(event) => setSeoKeywords(event.target.value)}
                placeholder="guembe, paisajismo, plantas ornamentales, Paraguay"
                className="w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />

              <p className="mt-1 text-xs text-gray-500">
                Separá cada palabra o frase con una coma.
              </p>
            </div>

            <div className="rounded-lg border bg-gray-50 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Vista previa en Google
              </p>

              <p className="text-sm text-green-700 truncate">
                https://www.corpicia.com/productos/
                {name
                  .toLowerCase()
                  .trim()
                  .replace(/[^a-z0-9áéíóúñ]+/gi, '-')
                  .replace(/^-+|-+$/g, '') || 'producto'}
              </p>

              <p className="mt-1 text-xl text-blue-700 leading-snug">
                {seoTitle ||
                  (name
                    ? `${name} | Corpicia Paraguay`
                    : 'Título del producto | Corpicia')}
              </p>

              <p className="mt-1 text-sm leading-relaxed text-gray-600">
                {seoDescription ||
                  shortDescription ||
                  'La meta descripción del producto aparecerá aquí.'}
              </p>
            </div>
          </div>

        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
            <h2 className="font-semibold text-lg border-b pb-2">Organización y Estado</h2>
            
            <div>
              <label className="block text-sm font-medium mb-1">Categoría *</label>
              <select
                name="category_id"
                value={selectedCategoryId}
                onChange={(event) => setSelectedCategoryId(event.target.value)}
                className="w-full flex h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                required
              >
                <option value="" disabled>Seleccione una categoría</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input type="checkbox" name="is_active" value="true" defaultChecked={product ? product.is_active : true} className="w-4 h-4" />
                Producto Activo (Visible)
              </label>

            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
            <h2 className="font-semibold text-lg border-b pb-2">Precios y Cantidades</h2>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Precio base por {getUnitLabel(selectedUnit)} (PYG) *
              </label>
              <Input name="price_amount" type="number" defaultValue={product?.price_amount || ''} required min="0" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Unidad *</label>
              <select name="unit" defaultValue={product?.unit || 'm2'} onChange={e => setSelectedUnit(e.target.value)} className="w-full flex h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" required>
                <option value="m2">Metro cuadrado (m²)</option>
                <option value="kg">Kilogramo (kg)</option>
                <option value="bolsa">Bolsa</option>
                <option value="bolsa_30kg">Bolsa de 30 (kg)</option>
                <option value="bolsa_50kg">Bolsa de 50 (kg)</option>
                <option value="litro">Litro</option>
                <option value="metro_lineal">Metro lineal</option>
                <option value="unidad">Unidad</option>
                <option value="docena">Docena</option>
                <option value="visita">Visita</option>
                <option value="servicio">Servicio</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Cantidad Mínima Pedido *</label>
              <Input name="min_order_quantity" type="number" defaultValue={product?.min_order_quantity || 1} required min="1" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
            <h2 className="font-semibold text-lg border-b pb-2">Precios por cantidad</h2>
            
            <div className="space-y-3 pt-2">
              {tiers.length > 0 && (
                <div className="hidden sm:flex gap-4 px-4 mb-2 text-sm font-semibold text-gray-700">
                  <div className="flex-1 min-w-[70px]">Desde</div>
                  <div className="flex-1 min-w-[70px]">Hasta</div>
                  <div className="flex-[2] min-w-[140px]">Precio por {getUnitLabel(selectedUnit)}</div>
                  <div className="text-center w-20">Promoción</div>
                  <div className="w-8"></div>
                </div>
              )}
              {tiers.map((tier, idx) => (
                <div key={idx} className="flex flex-wrap sm:flex-nowrap gap-4 items-center bg-gray-50/50 p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="flex-1 min-w-[70px] relative">
                    <span className="sm:hidden block text-xs font-semibold text-gray-500 mb-1">Desde</span>
                    <Input type="number" min="1" value={tier.minQuantity} onChange={e => {
                      const newTiers = [...tiers];
                      newTiers[idx].minQuantity = parseInt(e.target.value || '0', 10);
                      setTiers(newTiers);
                    }} className="h-10 text-center text-base" />
                  </div>
                  <div className="flex-1 min-w-[70px] relative">
                    <span className="sm:hidden block text-xs font-semibold text-gray-500 mb-1">Hasta</span>
                    <Input type="number" min="1" placeholder="Ej. 50" value={tier.maxQuantity ?? ''} onChange={e => {
                      const newTiers = [...tiers];
                      newTiers[idx].maxQuantity = e.target.value ? parseInt(e.target.value, 10) : null;
                      setTiers(newTiers);
                    }} className="h-10 text-center text-base" />
                  </div>
                  <div className="flex-[2] min-w-[160px] relative">
                    <span className="sm:hidden block text-xs font-semibold text-gray-500 mb-1">Precio</span>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">Gs.</span>
                      <Input type="number" min="0" value={tier.price === 0 ? '' : tier.price} onChange={e => {
                        const newTiers = [...tiers];
                        newTiers[idx].price = parseInt(e.target.value || '0', 10);
                        setTiers(newTiers);
                      }} className="h-10 pl-10 text-base" />
                    </div>
                  </div>
                  <div className="flex justify-center items-center w-20 pt-5 sm:pt-0">
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={tier.isPromo} onChange={e => {
                            const newTiers = [...tiers];
                            newTiers[idx].isPromo = e.target.checked;
                            setTiers(newTiers);
                          }} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-corpicia-green"></div>
                      </label>
                  </div>
                  <div className="flex justify-center w-8 pt-5 sm:pt-0">
                    <Button type="button" variant="ghost" size="icon" className="text-gray-400 hover:text-red-600 h-8 w-8 hover:bg-red-50" title="Eliminar escala" aria-label="Eliminar escala" onClick={() => setTiers(tiers.filter((_, i) => i !== idx))}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="pt-2">
                <Button type="button" variant="outline" className="w-full text-corpicia-green border-corpicia-green/30 hover:bg-corpicia-green/5" onClick={() => setTiers([...tiers, { minQuantity: 1, maxQuantity: null, price: 0, isPromo: false }])}>
                  <Plus className="w-4 h-4 mr-2" /> Agregar otra escala de precio
                </Button>
              </div>
            </div>

            {/* Resumen */}
            <div className="mt-6 pt-4 border-t">
              <h3 className="text-sm font-semibold mb-3">Resumen de precios</h3>
              {tiers.length === 0 ? (
                <p className="text-sm text-gray-500 italic">Aún no cargaste precios por cantidad.</p>
              ) : (
                <ul className="space-y-2">
                  {[...tiers].sort((a, b) => a.minQuantity - b.minQuantity).map((t, idx) => (
                    <li key={idx} className="text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-corpicia-green/60"></span>
                      {t.maxQuantity ? (
                        <span>{t.minQuantity} a {t.maxQuantity} → {t.price > 0 ? `Gs. ${t.price.toLocaleString('es-PY')}` : 'Precio pendiente'}</span>
                      ) : (
                        <span>Desde {t.minQuantity} en adelante → {t.price > 0 ? `Gs. ${t.price.toLocaleString('es-PY')}` : 'Precio pendiente'}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg flex justify-end gap-4 z-40 lg:pl-64">
        <Link href="/admin/productos">
          <Button type="button" variant="outline" disabled={loading}>
            Cancelar
          </Button>
        </Link>
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar Producto'}
        </Button>
      </div>
    </form>
  );
}

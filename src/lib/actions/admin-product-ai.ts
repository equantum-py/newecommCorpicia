'use server';

import { GoogleGenAI } from '@google/genai';
import { createClient } from '@/lib/supabase/server';

export type ProductAIInput = {
  name: string;
  category?: string;
  currentDescription?: string;
  currentShortDescription?: string;
};

export type ProductAIContent = {
  short_description: string;
  description: string;
  features: Array<{ feature_text: string }>;
  specifications: Array<{ spec_key: string; spec_value: string }>;
  recommendations: Array<{ recommendation_text: string }>;
  seo_title: string;
  seo_description: string;
  seo_keywords: string[];
};

export type ProductAIResult =
  | { success: true; content: ProductAIContent }
  | { success: false; message: string };

const productResponseSchema = {
  type: 'object',
  properties: {
    short_description: { type: 'string' },
    description: { type: 'string' },
    features: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          feature_text: { type: 'string' },
        },
        required: ['feature_text'],
      },
    },
    specifications: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          spec_key: { type: 'string' },
          spec_value: { type: 'string' },
        },
        required: ['spec_key', 'spec_value'],
      },
    },
    recommendations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          recommendation_text: { type: 'string' },
        },
        required: ['recommendation_text'],
      },
    },
    seo_title: { type: 'string' },
    seo_description: { type: 'string' },
    seo_keywords: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  required: [
    'short_description',
    'description',
    'features',
    'specifications',
    'recommendations',
    'seo_title',
    'seo_description',
    'seo_keywords',
  ],
} as const;

function buildFallbackSpecifications(
  name: string,
  category?: string
): ProductAIContent['specifications'] {
  const normalizedName = name.toLowerCase();
  const normalizedCategory = (category || '').toLowerCase();

  if (
    normalizedName.includes('césped') ||
    normalizedName.includes('cesped') ||
    normalizedCategory.includes('césped') ||
    normalizedCategory.includes('cesped')
  ) {
    return [
      { spec_key: 'Tipo de producto', spec_value: 'Césped natural' },
      { spec_key: 'Uso recomendado', spec_value: 'Jardines, patios y áreas verdes' },
      {
        spec_key: 'Presentación',
        spec_value:
          normalizedName.includes('m²') || normalizedName.includes('m2')
            ? 'Venta por metro cuadrado'
            : 'Según presentación disponible',
      },
      { spec_key: 'Instalación', spec_value: 'Sobre terreno previamente preparado' },
      { spec_key: 'Mantenimiento', spec_value: 'Requiere riego, corte y cuidado periódico' },
    ];
  }

  if (
    normalizedCategory.includes('riego') ||
    normalizedName.includes('aspersor') ||
    normalizedName.includes('válvula') ||
    normalizedName.includes('valvula') ||
    normalizedName.includes('difusor')
  ) {
    return [
      { spec_key: 'Tipo de producto', spec_value: category || 'Accesorio para sistema de riego' },
      { spec_key: 'Uso recomendado', spec_value: 'Instalaciones de riego para jardines y áreas verdes' },
      { spec_key: 'Aplicación', spec_value: 'Uso en sistemas de riego compatibles' },
    ];
  }

  return [
    { spec_key: 'Categoría', spec_value: category || 'Producto de jardinería' },
    { spec_key: 'Uso recomendado', spec_value: 'Jardinería, paisajismo y mantenimiento de áreas verdes' },
    { spec_key: 'Presentación', spec_value: 'Según disponibilidad del producto' },
  ];
}

function normalizeContent(value: unknown, input: ProductAIInput): ProductAIContent {
  if (!value || typeof value !== 'object') {
    throw new Error('La respuesta de IA está vacía.');
  }

  const data = value as Record<string, unknown>;
  const shortDescription = String(data.short_description ?? '').trim();
  const description = String(data.description ?? '').trim();
  const seoTitle = String(data.seo_title ?? '').trim();
  const seoDescription = String(data.seo_description ?? '').trim();

  const features = Array.isArray(data.features)
    ? data.features
        .map((item) => ({
          feature_text: String(
            item && typeof item === 'object'
              ? (item as Record<string, unknown>).feature_text ?? ''
              : item ?? ''
          ).trim(),
        }))
        .filter((item) => item.feature_text)
        .slice(0, 6)
    : [];

  const generatedSpecifications = Array.isArray(data.specifications)
    ? data.specifications
        .map((item) => {
          if (!item || typeof item !== 'object') {
            return { spec_key: '', spec_value: '' };
          }
          const specification = item as Record<string, unknown>;
          return {
            spec_key: String(specification.spec_key ?? '').trim(),
            spec_value: String(specification.spec_value ?? '').trim(),
          };
        })
        .filter((item) => item.spec_key && item.spec_value)
        .slice(0, 6)
    : [];

  const recommendations = Array.isArray(data.recommendations)
    ? data.recommendations
        .map((item) => ({
          recommendation_text: String(
            item && typeof item === 'object'
              ? (item as Record<string, unknown>).recommendation_text ?? ''
              : item ?? ''
          ).trim(),
        }))
        .filter((item) => item.recommendation_text)
        .slice(0, 3)
    : [];

  const seoKeywords = Array.isArray(data.seo_keywords)
    ? data.seo_keywords
        .map((keyword) => String(keyword ?? '').trim())
        .filter(Boolean)
        .slice(0, 10)
    : [];

  if (!shortDescription || !description) {
    throw new Error('La IA no generó las descripciones necesarias.');
  }

  if (!seoTitle || !seoDescription) {
    throw new Error('La IA no generó los campos SEO necesarios.');
  }

  return {
    short_description: shortDescription,
    description,
    features,
    specifications:
      generatedSpecifications.length > 0
        ? generatedSpecifications
        : buildFallbackSpecifications(input.name, input.category),
    recommendations,
    seo_title: seoTitle,
    seo_description: seoDescription,
    seo_keywords: seoKeywords,
  };
}

export async function generateProductContentWithAI(
  input: ProductAIInput
): Promise<ProductAIResult> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: 'No autorizado. Iniciá sesión nuevamente.' };
    }

    const { data: profile } = await supabase
      .from('admin_profiles')
      .select('role, is_active')
      .eq('user_id', user.id)
      .maybeSingle();

    if (
      !profile ||
      !profile.is_active ||
      !['owner', 'admin', 'editor'].includes(profile.role)
    ) {
      return { success: false, message: 'No tenés permisos para utilizar el asistente de IA.' };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { success: false, message: 'Gemini no está configurado en este entorno.' };
    }

    const name = input.name?.trim();
    if (!name) {
      return { success: false, message: 'Ingresá primero el nombre del producto.' };
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
Actuá como especialista técnico y redactor ecommerce de Corpicia Paraguay,
empresa dedicada a jardinería, césped, paisajismo, riego y productos relacionados.

Producto: ${name}
Categoría: ${input.category?.trim() || 'Sin categoría indicada'}
Descripción corta actual: ${input.currentShortDescription?.trim() || 'No disponible'}
Descripción completa actual: ${input.currentDescription?.trim() || 'No disponible'}

Reglas:
- Escribí en español claro, natural y profesional.
- No inventes especie botánica, medidas, materiales, potencia, stock, garantía, compatibilidad, precio ni disponibilidad.
- Solo afirmá datos técnicos presentes en el nombre o contexto recibido.
- Descripción corta: 120 a 180 caracteres.
- Descripción completa: 2 a 4 párrafos breves.
- Generá 3 a 6 características.
- Generá 3 a 6 especificaciones comerciales útiles y seguras.
- Generá 1 a 3 recomendaciones.
- Título SEO natural, máximo 60 caracteres.
- Meta descripción SEO entre 140 y 160 caracteres.
- Generá 5 a 10 palabras clave relevantes.
- Usá Paraguay cuando tenga sentido comercial.
- Evitá keyword stuffing y frases exageradas.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        temperature: 0.3,
        responseMimeType: 'application/json',
        responseSchema: productResponseSchema,
      },
    });

    if (!response.text) {
      return { success: false, message: 'Gemini no devolvió contenido.' };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(response.text);
    } catch (error) {
      console.error('[Product AI] JSON inválido recibido de Gemini:', error);
      return {
        success: false,
        message: 'Gemini devolvió una respuesta inválida. Volvé a intentar.',
      };
    }

    return {
      success: true,
      content: normalizeContent(parsed, input),
    };
  } catch (error) {
    console.error('[Product AI] Error:', error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'No se pudo generar el contenido con IA.',
    };
  }
}

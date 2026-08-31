export type WorkPhotoStage = 'before' | 'process' | 'after';

export type WorkGalleryPhoto = {
  id: string;
  url: string;
  stage: WorkPhotoStage;
  order: number;
};

export type WorkGalleryItem = {
  id: string;
  title: string;
  category: string;
  location: string;
  description: string;
  image: string;
  images?: Array<string | WorkGalleryPhoto>;
  active: boolean;
};

export type WorkGallerySettings = {
  active: boolean;
  eyebrow: string;
  title: string;
  description: string;
  items: WorkGalleryItem[];
};

export function normalizeWorkGalleryPhotos(item: WorkGalleryItem): WorkGalleryPhoto[] {
  const raw = item.images?.length ? item.images : (item.image ? [item.image] : []);

  const normalized = raw
    .map((photo, index) => {
      if (typeof photo === 'string') {
        const stage: WorkPhotoStage =
          raw.length === 1 ? 'after' : index === 0 ? 'before' : index === raw.length - 1 ? 'after' : 'process';
        return { id: `legacy-${index}-${photo}`, url: photo, stage, order: index };
      }

      return {
        id: String(photo.id || `photo-${index}`),
        url: String(photo.url || ''),
        stage: photo.stage === 'before' || photo.stage === 'after' ? photo.stage : 'process',
        order: Number.isFinite(photo.order) ? photo.order : index,
      };
    })
    .filter((photo) => photo.url);

  const rank: Record<WorkPhotoStage, number> = { before: 0, process: 1, after: 2 };
  return normalized.sort((a, b) => rank[a.stage] - rank[b.stage] || a.order - b.order);
}

export const DEFAULT_WORK_GALLERY: WorkGallerySettings = {
  active: true,
  eyebrow: 'Trabajos realizados',
  title: 'Proyectos que transforman espacios',
  description: 'Mirá cómo transformamos cada espacio: antes, proceso y resultado final de trabajos reales de Corpicia.',
  items: [],
};

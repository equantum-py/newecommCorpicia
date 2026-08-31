export type WorkGalleryItem = {
  id: string;
  title: string;
  category: string;
  location: string;
  description: string;
  image: string;
  active: boolean;
};

export type WorkGallerySettings = {
  active: boolean;
  eyebrow: string;
  title: string;
  description: string;
  items: WorkGalleryItem[];
};

export const DEFAULT_WORK_GALLERY: WorkGallerySettings = {
  active: true,
  eyebrow: 'Trabajos realizados',
  title: 'Proyectos que transforman espacios',
  description: 'Conocé algunos de nuestros trabajos de césped, riego y paisajismo realizados en Paraguay.',
  items: [],
};

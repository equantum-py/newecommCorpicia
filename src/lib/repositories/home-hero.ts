export type HomeHeroSettings = {
  active: boolean;
  mode: 'text' | 'banner';
  showTexts: boolean;
  eyebrow: string;
  title: string;
  description: string;
  primaryButton: string;
  secondaryButton: string;
  desktopImage: string;
  mobileImage: string;
};

export const DEFAULT_HOME_HERO: HomeHeroSettings = {
  active: true,
  mode: 'text',
  showTexts: true,
  eyebrow: 'Especialistas en espacios verdes en Paraguay',
  title: 'Césped natural, paisajismo y riego automático',
  description:
    'Venta, instalación y asesoramiento profesional para hogares, empresas y proyectos.',
  primaryButton: 'Cotizar proyecto',
  secondaryButton: 'Ver productos',
  desktopImage: '',
  mobileImage: '',
};

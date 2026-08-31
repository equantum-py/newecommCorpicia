import type { Metadata } from 'next';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import { getWorkGallerySettings } from '@/lib/repositories/work-gallery.server';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Trabajos realizados de césped, riego y paisajismo | Corpicia',
  description: 'Conocé trabajos realizados por Corpicia en césped natural, sistemas de riego automático y paisajismo en Paraguay.',
  alternates: { canonical: '/proyectos' },
};

export default async function ProyectosPage() {
  const gallery = await getWorkGallerySettings();
  const projects = gallery.items.filter((item) => item.active && (item.image || item.images?.length));

  return (
    <main className="bg-white">
      <section className="bg-[#073d22] py-10 text-white sm:py-16">
        <div className="container mx-auto px-4">
          <p className="text-xs font-bold uppercase tracking-widest text-green-300">Trabajos realizados</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Nuestros trabajos</h1>
          <p className="mt-3 max-w-2xl text-white/80">
            Proyectos reales de césped, riego y paisajismo realizados para hogares, empresas y profesionales.
          </p>
        </div>
      </section>

      <section className="py-8 sm:py-12 md:py-14">
        <div className="container mx-auto px-4">
          {projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-gray-50 p-10 text-center">
              <p className="font-bold text-gray-900">Todavía no hay trabajos publicados.</p>
            </div>
          ) : (
            <div className="space-y-12 sm:space-y-16">
              {projects.map((project) => {
                const photos = (project.images?.length ? project.images : [project.image]).filter(Boolean);

                return (
                  <article key={project.id} className="border-b pb-10 last:border-b-0 sm:pb-14">
                    <div className="mb-5 max-w-3xl">
                      <p className="text-xs font-bold uppercase tracking-widest text-corpicia-green">{project.category}</p>
                      <h2 className="mt-1 text-2xl font-bold text-gray-950 sm:text-3xl">{project.title}</h2>
                      {project.location && (
                        <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
                          <MapPin className="h-4 w-4" />
                          {project.location}
                        </p>
                      )}
                      {project.description && (
                        <p className="mt-3 text-sm leading-6 text-gray-600 sm:text-base">{project.description}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3">
                      {photos.map((photo, index) => (
                        <div
                          key={`${project.id}-${photo}-${index}`}
                          className={`relative overflow-hidden rounded-xl bg-gray-100 ${index === 0 && photos.length >= 3 ? 'col-span-2 row-span-2 aspect-square md:aspect-[4/3]' : 'aspect-[4/3]'}`}
                        >
                          <Image
                            src={photo}
                            alt={`${project.title} - foto ${index + 1} de trabajo realizado por Corpicia`}
                            fill
                            className="object-cover"
                            sizes={index === 0 && photos.length >= 3 ? '(max-width: 767px) 100vw, 66vw' : '(max-width: 767px) 50vw, 33vw'}
                          />
                        </div>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

import type { Metadata } from 'next';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import { getWorkGallerySettings } from '@/lib/repositories/work-gallery.server';
import { normalizeWorkGalleryPhotos, type WorkPhotoStage } from '@/lib/repositories/work-gallery';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Antes y después: trabajos de césped, riego y paisajismo | Corpicia',
  description: 'Mirá transformaciones reales realizadas por Corpicia: cómo estaba cada espacio, el proceso de trabajo y el resultado final.',
  alternates: { canonical: '/proyectos' },
};

const stageInfo: Record<WorkPhotoStage, { label: string; number: string }> = {
  before: { label: 'Antes', number: '01' },
  process: { label: 'Proceso', number: '02' },
  after: { label: 'Resultado final', number: '03' },
};

export default async function ProyectosPage() {
  const gallery = await getWorkGallerySettings();
  const projects = gallery.items.filter((item) => item.active && (item.image || item.images?.length));

  return (
    <main className="bg-white">
      <section className="bg-[#073d22] py-10 text-white sm:py-14">
        <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-green-300">Trabajos realizados</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Antes, proceso y resultado</h1>
          <p className="mt-3 max-w-2xl text-white/80">Conocé transformaciones reales de Corpicia. Mirá cómo encontramos cada espacio, el trabajo realizado y cómo quedó terminado.</p>
        </div>
      </section>

      <section className="py-8 sm:py-10 lg:py-12">
        <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8">
          {projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-gray-50 p-10 text-center">
              <p className="font-bold text-gray-900">Todavía no hay trabajos publicados.</p>
            </div>
          ) : (
            <div className="space-y-12 lg:space-y-16">
              {projects.map((project, projectIndex) => {
                const photos = normalizeWorkGalleryPhotos(project);
                const stages: WorkPhotoStage[] = ['before', 'process', 'after'];
                const visibleStages = stages
                  .map((stage) => ({ stage, photos: photos.filter((photo) => photo.stage === stage) }))
                  .filter((group) => group.photos.length > 0);

                const desktopGrid =
                  visibleStages.length === 1
                    ? 'lg:grid-cols-1'
                    : visibleStages.length === 2
                      ? 'lg:grid-cols-2'
                      : 'lg:grid-cols-3';

                return (
                  <article key={project.id} className="border-b pb-10 last:border-b-0 lg:pb-14">
                    <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-corpicia-green">Proyecto {String(projectIndex + 1).padStart(2, '0')} · {project.category}</p>
                        <h2 className="mt-1 text-2xl font-bold text-gray-950 sm:text-3xl">{project.title}</h2>
                        {project.location && (
                          <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
                            <MapPin className="h-4 w-4" />
                            {project.location}
                          </p>
                        )}
                      </div>
                      {project.description && (
                        <p className="max-w-3xl text-sm leading-6 text-gray-600 sm:text-base lg:justify-self-end">{project.description}</p>
                      )}
                    </div>

                    <div className={`flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 pr-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:overflow-visible lg:pb-0 lg:pr-0 ${desktopGrid}`}>
                      {visibleStages.map(({ stage, photos: stagePhotos }) => {
                        const info = stageInfo[stage];
                        return (
                          <section key={stage} className="w-[86vw] max-w-[430px] shrink-0 snap-start sm:w-[72vw] lg:w-auto lg:max-w-none lg:shrink">
                            <div className="mb-3 flex items-center gap-3">
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-corpicia-green text-[11px] font-bold text-white">{info.number}</span>
                              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900 sm:text-base">{info.label}</h3>
                              <div className="h-px flex-1 bg-gray-200" />
                            </div>

                            <div className="grid gap-3 sm:gap-4">
                              {stagePhotos.map((photo, index) => (
                                <figure key={photo.id} className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gray-100">
                                  <Image
                                    src={photo.url}
                                    alt={`${project.title} - ${info.label} ${index + 1}`}
                                    fill
                                    className="object-cover"
                                    sizes={visibleStages.length === 2 ? '(max-width:1023px) 86vw, 50vw' : '(max-width:1023px) 86vw, 33vw'}
                                  />
                                  <figcaption className="absolute bottom-3 left-3 rounded-lg bg-black/70 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
                                    {info.label}{stagePhotos.length > 1 ? ` ${index + 1}` : ''}
                                  </figcaption>
                                </figure>
                              ))}
                            </div>
                          </section>
                        );
                      })}
                    </div>

                    {visibleStages.length > 1 && (
                      <p className="mt-2 text-center text-xs font-medium text-gray-400 lg:hidden">Deslizá para ver la transformación →</p>
                    )}
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

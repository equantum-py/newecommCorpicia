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
      <section className="bg-[#073d22] py-10 text-white sm:py-16">
        <div className="container mx-auto px-4">
          <p className="text-xs font-bold uppercase tracking-widest text-green-300">Trabajos realizados</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Antes, proceso y resultado</h1>
          <p className="mt-3 max-w-2xl text-white/80">Conocé transformaciones reales de Corpicia. Mirá cómo encontramos cada espacio, el trabajo realizado y cómo quedó terminado.</p>
        </div>
      </section>

      <section className="py-8 sm:py-12 md:py-14">
        <div className="container mx-auto px-4">
          {projects.length === 0 ? <div className="rounded-2xl border border-dashed bg-gray-50 p-10 text-center"><p className="font-bold text-gray-900">Todavía no hay trabajos publicados.</p></div> : (
            <div className="space-y-14 sm:space-y-20">
              {projects.map((project, projectIndex) => {
                const photos = normalizeWorkGalleryPhotos(project);
                const stages: WorkPhotoStage[] = ['before', 'process', 'after'];
                return (
                  <article key={project.id} className="border-b pb-12 last:border-b-0 sm:pb-16">
                    <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_2fr] lg:items-end">
                      <div><p className="text-xs font-bold uppercase tracking-widest text-corpicia-green">Proyecto {String(projectIndex + 1).padStart(2, '0')} · {project.category}</p><h2 className="mt-1 text-2xl font-bold text-gray-950 sm:text-3xl">{project.title}</h2>{project.location && <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500"><MapPin className="h-4 w-4" />{project.location}</p>}</div>
                      {project.description && <p className="max-w-3xl text-sm leading-6 text-gray-600 sm:text-base lg:justify-self-end">{project.description}</p>}
                    </div>

                    <div className="space-y-7">
                      {stages.map(stage => {
                        const stagePhotos = photos.filter(photo => photo.stage === stage);
                        if (!stagePhotos.length) return null;
                        const info = stageInfo[stage];
                        return <section key={stage}>
                          <div className="mb-3 flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-corpicia-green text-xs font-bold text-white">{info.number}</span><h3 className="text-base font-bold uppercase tracking-wide text-gray-900">{info.label}</h3><div className="h-px flex-1 bg-gray-200" /></div>
                          <div className={`grid gap-3 sm:gap-4 ${stagePhotos.length === 1 ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3'}`}>
                            {stagePhotos.map((photo, index) => <figure key={photo.id} className={`relative overflow-hidden rounded-2xl bg-gray-100 ${stagePhotos.length === 1 ? 'aspect-[16/9] max-h-[620px]' : 'aspect-[4/3]'}`}><Image src={photo.url} alt={`${project.title} - ${info.label} ${index + 1}`} fill className="object-cover" sizes={stagePhotos.length === 1 ? '100vw' : '(max-width:767px) 50vw,33vw'} /><figcaption className="absolute bottom-3 left-3 rounded-lg bg-black/70 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white">{info.label}{stagePhotos.length > 1 ? ` ${index + 1}` : ''}</figcaption></figure>)}
                          </div>
                        </section>;
                      })}
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

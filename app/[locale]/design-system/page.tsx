import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  DsBodyText,
  DsContainer,
  DsDisplayText,
  DsPage,
  DsSection,
  DsTextLink,
  MediaFrame,
  TokenSwatch,
  TypeSample,
} from '@/components/DesignSystem';
import ProjectCard from '@/components/ProjectCard';
import { projects } from '@/data/projects';

const completedProject = projects.find((project) => project.status === 'completed') ?? projects[0];
const inProgressProject = projects.find((project) => project.status === 'in_progress') ?? projects[0];

export default async function DesignSystemPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }

  const { locale } = await params;
  const projectIndexHref = `/${locale}/projekty`;

  return (
    <DsPage>
      <DsContainer>
        <header className="pb-16 md:pb-24">
          <p className="text-[13px] font-[700] uppercase tracking-[0.16em] text-coral/70">
            Local design system
          </p>
          <h1 className="mt-4 uppercase text-coral font-[900] leading-[0.95] text-[42px] md:text-[82px]">
            Kool Studio visual language
          </h1>
          <p className="mt-6 max-w-[760px] text-[16px] md:text-[20px] leading-[1.6] font-[300] text-dark">
            Development-only reference for current tokens, type, layout, imagery, motion patterns, and project components.
          </p>
        </header>

        <DsSection eyebrow="01" title="Tokens">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
            <TokenSwatch name="beige" value="#E5DDD0" className="bg-beige" />
            <TokenSwatch name="coral" value="#FC3117" className="bg-coral" />
            <TokenSwatch name="dark" value="#1A1A1A" className="bg-dark" />
            <TokenSwatch name="muted" value="#888888" className="bg-muted" />
            <TokenSwatch name="white" value="#FFFFFF" className="bg-white" />
          </div>
        </DsSection>

        <DsSection eyebrow="02" title="Typography">
          <TypeSample label="Display heading" className="uppercase text-coral font-[900] leading-[0.95] text-[42px] md:text-[82px]">
            AUTORSKIE WNĘTRZA
          </TypeSample>
          <TypeSample label="Section display" className="uppercase text-coral font-[700] leading-[1.15] text-[32px] md:text-[54px]">
            WNĘTRZA, KTÓRE ZOSTAJĄ NA DŁUŻEJ.
          </TypeSample>
          <TypeSample label="Body copy" className="max-w-[760px] text-[15px] md:text-[18px] leading-[1.7] font-[300] text-dark">
            Projektujemy autorskie wnętrza mieszkalne i komercyjne z dbałością o detal, kontekst i charakter miejsca.
          </TypeSample>
        </DsSection>

        <DsSection eyebrow="03" title="Layout">
          <div className="grid gap-6">
            <DsDisplayText>Max-width content, generous page rhythm, image-led sections.</DsDisplayText>
            <DsBodyText>
              Content uses a 1400px max-width with responsive horizontal padding. Public pages lean on large top offsets, full-width image bands, square project imagery, and 50/50 editorial rows.
            </DsBodyText>
          </div>
        </DsSection>

        <DsSection eyebrow="04" title="Interaction">
          <div className="grid gap-5">
            <DsTextLink href={projectIndexHref}>Project index link</DsTextLink>
            <div className="overflow-hidden whitespace-nowrap border-y border-coral/40 py-4">
              <div className="animate-marquee inline-block">
                {Array.from({ length: 4 }).map((_, index) => (
                  <span key={index} className="font-[400] uppercase text-coral leading-tight mx-8 text-[28px] md:text-[54px]">
                    WE ARE KOOL AND WE DESIGN KOOL THINGS!
                  </span>
                ))}
              </div>
            </div>
          </div>
        </DsSection>

        <DsSection eyebrow="05" title="Imagery">
          <div className="grid gap-[3px] md:grid-cols-3">
            {[
              '/images/dobrzykowice.jpg',
              '/images/dehesa.jpg',
              '/images/kancelaria.jpg',
            ].map((src) => (
              <MediaFrame key={src} className="aspect-square">
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-[600ms] hover:scale-[1.04]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </MediaFrame>
            ))}
          </div>
        </DsSection>

        <DsSection eyebrow="06" title="Project cards">
          <div className="grid gap-5 md:grid-cols-2">
            <ProjectCard project={completedProject} />
            <ProjectCard project={inProgressProject} />
          </div>
        </DsSection>

        <DsSection eyebrow="07" title="Localization">
          <DsBodyText>
            Public content is localized under /pl and /en with next-intl. The styleguide route is localized too, but it stays hidden from navigation and sitemap output.
          </DsBodyText>
        </DsSection>
      </DsContainer>
    </DsPage>
  );
}

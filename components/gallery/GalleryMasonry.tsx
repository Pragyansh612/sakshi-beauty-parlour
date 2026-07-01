'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface GalleryTile {
  title: string;
  cat: string;
  tag: string;
  h: number;
  bg: string;
}

const tiles: GalleryTile[] = [
  { title: 'Royal bridal look', cat: 'Bridal transformations', tag: 'Bridal', h: 330, bg: 'linear-gradient(160deg,#f2e2da,#e9d8cd)' },
  { title: 'Sangeet glam', cat: 'Party makeup', tag: 'Party glam', h: 250, bg: 'linear-gradient(160deg,#efe0d6,#ecdccb)' },
  { title: 'Balayage in honey', cat: 'Hair coloring results', tag: 'Hair colour', h: 300, bg: 'linear-gradient(160deg,#f0e1d9,#ead9ce)' },
  { title: 'Soft curls & updo', cat: 'Hair styling', tag: 'Hair styling', h: 260, bg: 'linear-gradient(160deg,#f1e2da,#e8d6cb)' },
  { title: 'Reception radiance', cat: 'Bridal transformations', tag: 'Bridal', h: 340, bg: 'linear-gradient(160deg,#f3e3db,#e9d6c9)' },
  { title: 'Glass-skin facial', cat: 'Skin treatment results', tag: 'Skin glow', h: 240, bg: 'linear-gradient(160deg,#efe1d8,#ecdfce)' },
  { title: 'Keratin smoothing', cat: 'Hair spa treatments', tag: 'Hair spa', h: 300, bg: 'linear-gradient(160deg,#f0e2d9,#ece1d0)' },
  { title: 'Engagement look', cat: 'Party makeup', tag: 'Party glam', h: 270, bg: 'linear-gradient(160deg,#f2e1d8,#e8d5ca)' },
  { title: 'Bridal mehndi morning', cat: 'Bridal transformations', tag: 'Bridal', h: 250, bg: 'linear-gradient(160deg,#f1e2da,#e9d8cd)' },
];

const filterList = [
  'All',
  'Bridal transformations',
  'Party makeup',
  'Hair coloring results',
  'Hair styling',
  'Hair spa treatments',
  'Skin treatment results',
];

export function GalleryMasonry() {
  const [filter, setFilter] = useState('All');
  const [lightbox, setLightbox] = useState<GalleryTile | null>(null);

  const visible = tiles.filter((t) => filter === 'All' || t.cat === filter);

  return (
    <>
      {/* FILTERS */}
      <div className="max-w-[1240px] mx-auto px-6 md:px-11 flex flex-wrap justify-center gap-2.5 pb-9">
        {filterList.map((label) => (
          <button
            key={label}
            onClick={() => setFilter(label)}
            className={cn(
              'rounded-[30px] border font-body text-[12.5px] font-normal px-5 py-2.5 transition-all cursor-pointer',
              filter === label
                ? 'bg-[#2e2823] border-[#2e2823] text-[#f6ede0]'
                : 'bg-transparent border-[#d8c6a6] text-[#6b5f54] hover:border-[#b5904f] hover:text-[#b5904f]'
            )}
          >
            {label === 'All' ? 'All work' : label}
          </button>
        ))}
      </div>

      {/* MASONRY */}
      <section className="max-w-[1240px] mx-auto px-6 md:px-11 pb-5">
        <div className="[column-count:1] sm:[column-count:2] md:[column-count:3] [column-gap:18px]">
          {visible.map((t) => (
            <div
              key={t.title}
              onClick={() => setLightbox(t)}
              className="relative break-inside-avoid mb-[18px] rounded-2xl overflow-hidden cursor-pointer border border-[#eee3d4] group"
            >
              <div
                className="relative transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-105"
                style={{ height: `${t.h}px`, background: t.bg }}
              >
                <span className="absolute left-1/2 bottom-4 -translate-x-1/2 whitespace-nowrap py-[5px] px-[13px] font-mono text-[9px] tracking-[0.16em] uppercase text-[#7a6a52] bg-white/72 rounded-[20px]">
                  {t.tag}
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 px-[18px] pt-[18px] pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-[3]" style={{ background: 'linear-gradient(to top, rgba(46,40,35,.78), transparent)' }}>
                <b className="block font-heading text-[19px] font-medium text-white">{t.title}</b>
                <span className="text-[11px] tracking-[0.06em] text-[#e7d3ab]">{t.cat}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* LIGHTBOX */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[200] bg-[#1e1915]/86 backdrop-blur-sm flex items-center justify-center p-6 md:p-10"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            aria-label="Close"
            className="absolute top-6 right-6 md:top-[26px] md:right-[30px] w-[46px] h-[46px] rounded-full border border-white/30 bg-white/10 text-white text-xl flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
          <div
            className="bg-[#FAF6EF] rounded-[20px] overflow-hidden max-w-[760px] w-full shadow-[0_40px_90px_-30px_rgba(0,0,0,.6)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-[300px] md:h-[440px]" style={{ background: lightbox.bg }}>
              <span className="absolute left-1/2 bottom-4 -translate-x-1/2 whitespace-nowrap py-[5px] px-[13px] font-mono text-[9px] tracking-[0.16em] uppercase text-[#7a6a52] bg-white/72 rounded-[20px]">
                {lightbox.tag}
              </span>
            </div>
            <div className="px-6 py-6 md:px-[30px] md:py-[26px]">
              <p className="font-mono text-xs uppercase tracking-[0.32em] text-[#b5904f] mb-2">{lightbox.cat}</p>
              <h3 className="font-heading font-medium text-[28px] text-[#2e2823] m-0">{lightbox.title}</h3>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PriceGroup {
  heading: string;
  rows: { name: string; price: string }[];
}

interface ServiceHoverCardProps {
  title: string;
  tagline: string;
  fromPrice: string;
  tag: string;
  bgGradient: string;
  priceGroups: PriceGroup[];
}

export function ServiceHoverCard({
  title,
  tagline,
  fromPrice,
  tag,
  bgGradient,
  priceGroups,
}: ServiceHoverCardProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative group">
      {/* Card */}
      <Link
        href="/services"
        className="block no-underline"
        onClick={(e) => {
          // On mobile, prevent navigation and toggle accordion instead
          if (window.innerWidth < 768) {
            e.preventDefault();
            setMobileOpen((p) => !p);
          }
        }}
      >
        <div className="bg-white border border-[#eee3d4] rounded-[18px] overflow-hidden transition-all duration-[250ms] group-hover:-translate-y-0.5 group-hover:shadow-[0_24px_46px_-28px_rgba(60,45,30,.5)]">
          {/* Image placeholder */}
          <div
            className="relative h-[210px] overflow-hidden"
            style={{ background: bgGradient }}
          >
            <span className="absolute left-1/2 bottom-4 -translate-x-1/2 whitespace-nowrap py-[5px] px-[13px] font-mono text-[9px] tracking-[0.16em] uppercase text-[#7a6a52] bg-white/72 rounded-[20px]">
              {tag}
            </span>
            <span className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 text-[9.5px] font-semibold tracking-[0.09em] uppercase text-[#8a6a1f] bg-[#f6ecca] border border-[#e6d3a0] px-[9px] py-1 rounded-[20px]">
              Up to 20% off
            </span>
          </div>

          {/* Card body */}
          <div className="px-5 pt-5 pb-[22px]">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-heading text-[24px] font-medium text-[#2e2823] m-0">{title}</h3>
              <div className="text-[11px] text-[#9b8e84] whitespace-nowrap">
                from <strong className="text-[#b5904f] font-semibold text-[15px]">₹{fromPrice}</strong>
              </div>
            </div>
            <p className="text-[12.5px] font-light text-[#6b5f54] mt-1.5 leading-relaxed">{tagline}</p>
            <div className="mt-[13px] font-mono text-[10px] tracking-[0.13em] uppercase text-[#b5904f] flex items-center gap-1.5">
              <span className="hidden md:inline">Hover for prices ↓</span>
              <span className="md:hidden flex items-center gap-1">
                {mobileOpen ? 'Hide prices' : 'See prices'}
                <ChevronDown
                  size={12}
                  className={cn(
                    'transition-transform duration-200',
                    mobileOpen && 'rotate-180'
                  )}
                />
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Desktop hover price detail panel */}
      <div
        className="hidden md:block absolute left-0 right-0 top-[calc(100%-12px)] z-40 bg-[#2e2823] text-[#e8dcc8] rounded-[16px] px-4 pt-4 pb-[18px] shadow-[0_34px_60px_-22px_rgba(46,40,35,.7)] opacity-0 invisible translate-y-2 transition-all duration-200 pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:pointer-events-auto"
      >
        {priceGroups.map((group, i) => (
          <div
            key={i}
            className={cn(
              'pt-[9px] mt-[9px]',
              i > 0 ? 'border-t border-[#463e36]' : 'border-0 pt-0 mt-0'
            )}
          >
            <div className="font-heading font-semibold text-[15px] text-[#f6ede0] mb-1.5">{group.heading}</div>
            {group.rows.map((row, j) => (
              <div key={j} className="flex justify-between gap-2.5 text-[11.5px] leading-[1.55] font-light">
                <span className="text-[#cdbfae]">{row.name}</span>
                <span className="text-[#e7d3ab] font-normal whitespace-nowrap">{row.price}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Mobile accordion */}
      <div
        className={cn(
          'md:hidden overflow-hidden transition-all duration-300',
          mobileOpen ? 'max-h-[400px] opacity-100 mt-2' : 'max-h-0 opacity-0'
        )}
      >
        <div className="bg-[#2e2823] text-[#e8dcc8] rounded-[16px] px-4 pt-4 pb-[18px]">
          {priceGroups.map((group, i) => (
            <div
              key={i}
              className={cn(
                'pt-[9px] mt-[9px]',
                i > 0 ? 'border-t border-[#463e36]' : 'border-0 pt-0 mt-0'
              )}
            >
              <div className="font-heading font-semibold text-[15px] text-[#f6ede0] mb-1.5">{group.heading}</div>
              {group.rows.map((row, j) => (
                <div key={j} className="flex justify-between gap-2.5 text-[11.5px] leading-[1.55] font-light">
                  <span className="text-[#cdbfae]">{row.name}</span>
                  <span className="text-[#e7d3ab] font-normal whitespace-nowrap">{row.price}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

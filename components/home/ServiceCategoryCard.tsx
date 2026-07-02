import Link from 'next/link';
import type { ServiceCategoryData } from '@/lib/services-data';

export function ServiceCategoryCard({ slug, title, desc, fromPrice, iconRadius, subcards }: ServiceCategoryData) {
  const topRows = subcards.flatMap((s) => s.rows).slice(0, 5);

  return (
    <Link
      href={`/services#${slug}`}
      className="block no-underline group"
    >
      <div className="h-full flex flex-col bg-white border border-[#eee3d4] rounded-[18px] p-6 transition-all duration-[250ms] group-hover:-translate-y-0.5 group-hover:shadow-[0_24px_46px_-28px_rgba(60,45,30,.5)]">
        <div className="flex items-start justify-between gap-2 mb-4">
          <div
            className="w-11 h-11 border-[1.4px] shrink-0"
            style={{ borderColor: '#b5904f', borderRadius: iconRadius }}
          />
          <span className="inline-flex items-center gap-1 whitespace-nowrap text-[9px] font-semibold tracking-[0.09em] uppercase text-[#8a6a1f] bg-[#f6ecca] border border-[#e6d3a0] px-2.5 py-1 rounded-[20px]">
            Up to 20% off
          </span>
        </div>

        <h3 className="font-heading text-[24px] font-medium text-[#2e2823] m-0">{title}</h3>
        <p className="text-[12.5px] font-light text-[#6b5f54] mt-1.5 leading-relaxed">{desc}</p>

        <div className="mt-4 flex-1 flex flex-col gap-[3px]">
          {topRows.map((row) => (
            <div key={row.name} className="flex justify-between gap-2.5 text-[12px] leading-[1.6] py-[3px] border-b border-[#f1ece2] last:border-0">
              <span className="font-light text-[#5a4f45]">{row.name}</span>
              <span className="font-semibold text-[#b5904f] whitespace-nowrap">{row.price}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-[#f1ece2] flex items-baseline justify-between gap-2">
          <span className="text-[11px] text-[#9b8e84]">
            from <strong className="text-[#b5904f] font-semibold text-[15px]">₹{fromPrice}</strong>
          </span>
          <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-[#2e2823] group-hover:text-[#b5904f] transition-colors">
            View all →
          </span>
        </div>
      </div>
    </Link>
  );
}

import Link from 'next/link';

interface ComboCardProps {
  badge: string;
  tagLabel: string;
  title: string;
  items: string[];
  price: string;
  originalPrice: string;
  featured?: boolean;
}

export function ComboCard({ badge, tagLabel, title, items, price, originalPrice, featured = false }: ComboCardProps) {
  return (
    <div
      className={`flex flex-col rounded-[20px] p-6 border transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_24px_46px_-28px_rgba(60,45,30,.5)] ${
        featured ? 'bg-[#2e2823] border-[#2e2823]' : 'bg-white border-[#eee3d4]'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-3.5">
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-[0.09em] uppercase text-[#8a6a1f] bg-[#f6ecca] border border-[#e6d3a0] px-[11px] py-1 rounded-[20px]">
          {badge}
        </span>
        <span className={`font-mono text-[10px] tracking-[0.14em] uppercase ${featured ? 'text-[#d9b97e]' : 'text-[#9b8e84]'}`}>
          {tagLabel}
        </span>
      </div>
      <h3 className={`font-heading text-[24px] font-medium m-0 ${featured ? 'text-[#f6ede0]' : 'text-[#2e2823]'}`}>{title}</h3>
      <div className="flex flex-col gap-1.5 my-3.5">
        {items.map((item) => (
          <div key={item} className={`flex gap-2 items-start text-[12.5px] font-light ${featured ? 'text-[#cdbfae]' : 'text-[#5a4f45]'}`}>
            <span className="text-[#b5904f] shrink-0">✦</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
      <div className="mt-auto flex items-baseline gap-2.5">
        <span className="font-heading text-[28px] text-[#b5904f]">{price}</span>
        <span className={`text-[14px] line-through ${featured ? 'text-[#8a7d6e]' : 'text-[#9b8e84]'}`}>{originalPrice}</span>
      </div>
      <Link
        href="/book"
        className={`inline-flex items-center justify-center mt-4 w-full rounded-[30px] px-6 py-3.5 font-body font-medium text-[13.5px] no-underline transition-all ${
          featured
            ? 'bg-[#b5904f] text-white hover:shadow-[0_12px_26px_-10px_rgba(181,144,79,.7)]'
            : 'bg-[#2e2823] text-[#f6ede0] hover:-translate-y-px hover:shadow-[0_12px_26px_-10px_rgba(46,40,35,.6)]'
        }`}
      >
        Book this combo
      </Link>
    </div>
  );
}

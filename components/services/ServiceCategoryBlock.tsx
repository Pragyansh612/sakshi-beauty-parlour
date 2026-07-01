import Link from 'next/link';

interface SubcardRow {
  name: string;
  price: string;
}

interface Subcard {
  heading: string;
  rows: SubcardRow[];
}

interface ServiceCategoryBlockProps {
  id: string;
  title: string;
  desc: string;
  fromPrice: string;
  iconRadius: string;
  subcards: Subcard[];
  dark?: boolean;
  columns?: 2 | 3;
}

export function ServiceCategoryBlock({
  id,
  title,
  desc,
  fromPrice,
  iconRadius,
  subcards,
  dark = false,
  columns = 3,
}: ServiceCategoryBlockProps) {
  return (
    <div
      id={id}
      className={`grid grid-cols-1 md:grid-cols-[288px_minmax(0,1fr)] rounded-[22px] overflow-hidden mb-[22px] scroll-mt-24 border ${
        dark ? 'bg-[#2e2823] border-[#2e2823]' : 'bg-white border-[#eee3d4]'
      }`}
    >
      <div
        className={`p-8 flex flex-col border-b md:border-b-0 md:border-r ${
          dark ? 'bg-[#272119] border-[#463e36]' : 'bg-[#fbf7ef] border-[#eee3d4]'
        }`}
      >
        <div
          className="w-11 h-11 border-[1.4px] mb-5"
          style={{ borderColor: dark ? '#d9b97e' : '#b5904f', borderRadius: iconRadius }}
        />
        <h2 className={`font-heading font-medium text-[29px] leading-[1.05] m-0 ${dark ? 'text-[#f6ede0]' : 'text-[#2e2823]'}`}>
          {title}
        </h2>
        <p className={`text-[13.5px] font-light mt-2.5 mb-0 ${dark ? 'text-[#cdbfae]' : 'text-[#6b5f54]'}`}>{desc}</p>
        <div className="mt-4.5">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-[0.09em] uppercase text-[#8a6a1f] bg-[#f6ecca] border border-[#e6d3a0] px-[11px] py-1.5 rounded-[20px]">
            Up to 20% off
          </span>
        </div>
        <div className="mt-auto pt-6 flex items-baseline gap-2">
          <span className={`text-[12px] ${dark ? 'text-[#a89a86]' : 'text-[#9b8e84]'}`}>from</span>
          <span className="font-heading text-[27px] text-[#b5904f]">₹{fromPrice}</span>
        </div>
        <Link
          href="/book"
          className={`inline-flex items-center justify-center mt-4 rounded-[30px] px-[26px] py-3 font-body font-medium text-[13.5px] no-underline transition-all ${
            dark
              ? 'bg-[#b5904f] text-white hover:shadow-[0_12px_26px_-10px_rgba(181,144,79,.7)]'
              : 'bg-[#2e2823] text-[#f6ede0] hover:-translate-y-px hover:shadow-[0_12px_26px_-10px_rgba(46,40,35,.6)]'
          }`}
        >
          Book {title.toLowerCase()} service →
        </Link>
      </div>

      <div
        className={`p-7 grid gap-4 content-start min-w-0 grid-cols-1 sm:grid-cols-2 ${
          columns === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'
        }`}
      >
        {subcards.map((sub) => (
          <div
            key={sub.heading}
            className={`rounded-[14px] p-4 border min-w-0 ${
              dark ? 'bg-[#342d25] border-[#463e36]' : 'bg-white border-[#eee3d4]'
            }`}
          >
            <div
              className={`font-heading font-semibold text-[18px] mb-2 pb-2 border-b ${
                dark ? 'text-[#f6ede0] border-[#463e36]' : 'text-[#2e2823] border-[#f1ece2]'
              }`}
            >
              {sub.heading}
            </div>
            {sub.rows.map((row) => (
              <div key={row.name} className="flex justify-between gap-3 py-[4.5px] min-w-0">
                <span className={`font-light text-[13px] ${dark ? 'text-[#cdbfae]' : 'text-[#5a4f45]'}`}>{row.name}</span>
                <span className={`font-semibold text-[12.5px] whitespace-nowrap ${dark ? 'text-[#e7d3ab]' : 'text-[#b5904f]'}`}>
                  {row.price}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

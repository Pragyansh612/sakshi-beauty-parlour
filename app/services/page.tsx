import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FloatingBookCTA } from '@/components/layout/FloatingBookCTA';
import { EyebrowLabel } from '@/components/shared/EyebrowLabel';
import { ServiceCategoryBlock } from '@/components/services/ServiceCategoryBlock';
import { ComboCard } from '@/components/services/ComboCard';
import { getServiceCategoriesWithServices, getComboOffers } from '@/lib/services-data';

export const revalidate = 60;

export default async function ServicesPage() {
  const [categories, combos] = await Promise.all([
    getServiceCategoriesWithServices(),
    getComboOffers(),
  ]);

  const filterPills = [
    ...categories.map((cat) => ({ href: `#${cat.slug}`, label: cat.title, gold: cat.slug === 'bridal' })),
    { href: '#combos', label: 'Combo Offers', gold: false },
  ];

  return (
    <>
      <Navbar />

      <main>
        {/* HEADER */}
        <header className="max-w-[1240px] mx-auto px-6 md:px-11 pt-14 pb-[30px] text-center">
          <EyebrowLabel className="mb-4">Our menu of care</EyebrowLabel>
          <h1 className="font-heading font-medium text-[44px] md:text-[62px] leading-[1.04] text-[#2e2823] m-0">
            Services &amp;{' '}
            <span className="font-script text-[#b5904f] text-[52px] md:text-[74px]">treatments</span>
          </h1>
          <p className="text-[16px] md:text-[17px] font-light text-[#6b5f54] leading-[1.65] mt-4.5 mb-0 max-w-[560px] mx-auto">
            Full treatment menus with transparent price ranges — and up to 20% off across every category. Every service begins with a personal consultation.
          </p>
        </header>

        {/* FILTER PILLS */}
        <div className="max-w-[1240px] mx-auto px-6 md:px-11 pt-5 pb-8 flex flex-wrap gap-2.5 justify-center">
          {filterPills.map(({ href, label, gold }) => (
            <a
              key={href}
              href={href}
              className={`inline-flex items-center justify-center rounded-[30px] px-5 py-2.5 font-body font-medium text-[12.5px] no-underline transition-all ${
                gold
                  ? 'bg-[#b5904f] text-white hover:shadow-[0_12px_26px_-10px_rgba(181,144,79,.7)]'
                  : 'bg-transparent text-[#2e2823] border border-[#d8c6a6] hover:border-[#b5904f] hover:text-[#b5904f]'
              }`}
            >
              {label}
            </a>
          ))}
        </div>

        {/* CATEGORIES */}
        <section className="max-w-[1240px] mx-auto px-6 md:px-11 pb-5">
          {categories.map((cat) => (
            <ServiceCategoryBlock key={cat.id} {...cat} id={cat.slug} />
          ))}
        </section>

        {/* COMBO OFFERS */}
        <section id="combos" className="max-w-[1240px] mx-auto px-6 md:px-11 pt-8 pb-6 scroll-mt-24">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-7">
            <div>
              <EyebrowLabel className="mb-3">Bundle & save</EyebrowLabel>
              <h2 className="font-heading font-medium text-[36px] md:text-[44px] leading-[1.04] text-[#2e2823] m-0">
                Combo <span className="font-script text-[#b5904f] text-[44px] md:text-[52px]">offers</span>
              </h2>
              <p className="text-[14px] md:text-[15px] font-light text-[#6b5f54] mt-2 max-w-[520px]">
                Curated packages that pair our most-loved services — bundled at a better price than booking each on its own.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-[0.09em] uppercase text-[#8a6a1f] bg-[#f6ecca] border border-[#e6d3a0] px-3 py-1.5 rounded-[20px]">
              Up to 20% off
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {combos.length > 0 ? (
              combos.map((combo) => <ComboCard key={combo.id} {...combo} />)
            ) : (
              <p className="text-sm text-[#8a7d6e]">Combo offers coming soon.</p>
            )}
          </div>
        </section>

        {/* CTA STRIP */}
        <section className="max-w-[1240px] mx-auto px-6 md:px-11 pb-[74px]">
          <div className="bg-[#2e2823] rounded-[24px] px-8 py-10 md:px-[54px] md:py-[50px] flex items-center justify-between flex-wrap gap-6">
            <div>
              <h2 className="font-heading font-medium text-[30px] md:text-[36px] text-[#f6ede0] m-0">
                Not sure what you need?
              </h2>
              <p className="text-[#cdbfae] font-light text-[15px] mt-2">
                Call or WhatsApp us — we&apos;ll recommend the right service for you.
              </p>
            </div>
            <div className="flex gap-3.5">
              <a
                href="tel:+918962339467"
                className="inline-flex items-center justify-center bg-[#b5904f] text-white rounded-[30px] px-8 py-4 font-body font-medium text-[14.5px] no-underline transition-all hover:shadow-[0_12px_26px_-10px_rgba(181,144,79,.7)]"
              >
                ☎ Call now
              </a>
              <a
                href="https://wa.me/919179176465"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-transparent text-[#f6ede0] border border-[#5a5048] rounded-[30px] px-8 py-4 font-body font-medium text-[14.5px] no-underline transition-all hover:border-[#d9b97e] hover:text-[#d9b97e]"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <FloatingBookCTA />
    </>
  );
}

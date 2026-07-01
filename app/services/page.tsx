import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FloatingBookCTA } from '@/components/layout/FloatingBookCTA';
import { EyebrowLabel } from '@/components/shared/EyebrowLabel';
import { ServiceCategoryBlock } from '@/components/services/ServiceCategoryBlock';
import { ComboCard } from '@/components/services/ComboCard';

const filterPills = [
  { href: '#hair', label: 'Hair Care' },
  { href: '#skin', label: 'Skin & Face' },
  { href: '#body', label: 'Body Care' },
  { href: '#threading', label: 'Threading & Waxing' },
  { href: '#grooming', label: 'Grooming' },
  { href: '#bridal', label: 'Bridal Makeup', gold: true },
  { href: '#combos', label: 'Combo Offers' },
];

const categories = [
  {
    id: 'hair',
    title: 'Hair Care',
    desc: 'Spa, colour, smoothing, cuts & styling — tailored to your hair type.',
    fromPrice: '100',
    iconRadius: '50%',
    subcards: [
      { heading: 'Hair Treatment', rows: [{ name: 'Spa', price: '₹1,000–3,000' }, { name: 'Nanoplastia (Chemical)', price: '₹8,000–30,000' }, { name: 'Vegan Treatment', price: '₹10,000' }, { name: 'Straightening', price: '₹6,000–15,000' }] },
      { heading: 'Styling', rows: [{ name: '1 Length', price: '₹100' }, { name: 'UV', price: '₹200' }, { name: 'Styling', price: '₹300–1,000' }, { name: 'Blow Dry', price: '₹300–600' }] },
      { heading: 'Colour & Cut', rows: [{ name: 'Root Touch-up', price: '₹800–1,500' }, { name: 'Global Colour', price: '₹2,500–6,000' }, { name: 'Highlights / Balayage', price: '₹4,000–12,000' }, { name: 'Haircut', price: '₹200–1,200' }] },
    ],
  },
  {
    id: 'skin',
    title: 'Skin & Face',
    desc: 'Glow-restoring facials and deep cleansing for radiant, healthy skin.',
    fromPrice: '300',
    iconRadius: '50% 50% 50% 0',
    subcards: [
      { heading: 'Facials', rows: [{ name: 'Cleanup', price: '₹600–1,200' }, { name: 'Fruit / Hydrating', price: '₹1,000–2,500' }, { name: 'Anti-Aging', price: '₹1,800–3,500' }] },
      { heading: 'Advanced', rows: [{ name: 'Hydra Facial', price: '₹2,000–4,000' }, { name: 'Korean Glass Facial', price: '₹2,500–5,000' }] },
      { heading: 'Bleach & D-Tan', rows: [{ name: 'Face Bleach', price: '₹300–700' }, { name: 'Face D-Tan', price: '₹400–900' }] },
    ],
  },
  {
    id: 'body',
    title: 'Body Care',
    desc: 'Relaxing, skin-renewing rituals from head to toe.',
    fromPrice: '300',
    iconRadius: '14px',
    subcards: [
      { heading: 'Massage', rows: [{ name: 'Body Massage', price: '₹1,500–3,500' }, { name: 'Head Massage', price: '₹300–800' }] },
      { heading: 'Polishing & D-Tan', rows: [{ name: 'Body Polishing', price: '₹2,000–5,000' }, { name: 'Body D-Tan', price: '₹1,200–2,500' }, { name: 'Body Bleach', price: '₹1,000–2,000' }] },
      { heading: 'Scrub & Cleanse', rows: [{ name: 'Body Scrub', price: '₹800–2,000' }, { name: 'Body Cleansing', price: '₹700–1,500' }] },
    ],
  },
  {
    id: 'threading',
    title: 'Threading & Waxing',
    desc: 'Precise shaping and gentle, low-pain waxing with premium formulas.',
    fromPrice: '30',
    iconRadius: '50% 0',
    subcards: [
      { heading: 'Threading', rows: [{ name: 'Eyebrows', price: '₹40' }, { name: 'Upper Lip', price: '₹30' }, { name: 'Chin', price: '₹40' }, { name: 'Full Face', price: '₹150–250' }] },
      { heading: 'Waxing — Half', rows: [{ name: 'Half Arms', price: '₹150–300' }, { name: 'Half Legs', price: '₹200–350' }, { name: 'Underarms', price: '₹100–200' }] },
      { heading: 'Waxing — Full & Premium', rows: [{ name: 'Full Arms / Legs', price: '₹300–600' }, { name: 'Full Body', price: '₹1,500–3,000' }, { name: 'Rica / Brazilian', price: '₹500–1,500' }] },
    ],
  },
  {
    id: 'grooming',
    title: 'Grooming & Wellness',
    desc: 'Pamper your hands and feet with our signature nail & spa care.',
    fromPrice: '300',
    iconRadius: '50% 50% 0 50%',
    columns: 2 as const,
    subcards: [
      { heading: 'Hands & Feet', rows: [{ name: 'Manicure', price: '₹500–1,200' }, { name: 'Pedicure', price: '₹600–1,500' }] },
      { heading: 'Nails', rows: [{ name: 'Nail Extensions', price: '₹1,500–3,000' }, { name: 'Nail Art', price: '₹300–1,200' }, { name: 'Gel Polish', price: '₹500–1,000' }] },
    ],
  },
  {
    id: 'bridal',
    title: 'Bridal & Event Makeup',
    desc: 'Your most photographed day deserves an unhurried, expert touch — HD & airbrush finishes that last.',
    fromPrice: '500',
    iconRadius: '50%',
    dark: true,
    columns: 2 as const,
    subcards: [
      { heading: 'Bridal Makeup', rows: [{ name: 'HD Bridal', price: '₹8,000–15,000' }, { name: 'Airbrush Bridal', price: '₹12,000–30,000' }, { name: 'Engagement / Reception', price: '₹6,000–12,000' }] },
      { heading: 'Party & Add-ons', rows: [{ name: 'Party / Guest Makeup', price: '₹3,000–6,000' }, { name: 'Saree Draping', price: '₹500–1,500' }, { name: 'Hair Styling', price: '₹800–2,000' }] },
    ],
  },
];

const combos = [
  {
    badge: 'Save 25%',
    tagLabel: 'Bridal favourite',
    title: 'Bridal Bliss',
    items: ['Full-body Massage', 'Body Polishing', 'Signature Facial', 'HD Bridal Makeup'],
    price: '₹18,000',
    originalPrice: '₹24,000',
    featured: true,
  },
  {
    badge: 'Save 27%',
    tagLabel: 'Most popular',
    title: 'Glow Package',
    items: ['Hydra Facial', 'Full-body D-Tan', 'Manicure', 'Pedicure'],
    price: '₹3,500',
    originalPrice: '₹4,800',
  },
  {
    badge: 'Save 25%',
    tagLabel: 'Wedding prep',
    title: 'Pre-Wedding Prep',
    items: ['4 Skin Sessions', 'Hair Spa', 'Full-body Waxing'],
    price: '₹9,000',
    originalPrice: '₹12,000',
  },
  {
    badge: 'Save 25%',
    tagLabel: 'Unwind',
    title: 'Relax & Renew',
    items: ['Full-body Massage', 'Head Massage', 'Body Polishing'],
    price: '₹4,500',
    originalPrice: '₹6,000',
  },
];

export default function ServicesPage() {
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
            <ServiceCategoryBlock key={cat.id} {...cat} />
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
              Save up to 27%
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {combos.map((combo) => (
              <ComboCard key={combo.title} {...combo} />
            ))}
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
                href="tel:+919876543210"
                className="inline-flex items-center justify-center bg-[#b5904f] text-white rounded-[30px] px-8 py-4 font-body font-medium text-[14.5px] no-underline transition-all hover:shadow-[0_12px_26px_-10px_rgba(181,144,79,.7)]"
              >
                ☎ Call now
              </a>
              <a
                href="https://wa.me/919876543210"
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

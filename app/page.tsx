import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FloatingBookCTA } from '@/components/layout/FloatingBookCTA';
import { SectionReveal } from '@/components/shared/SectionReveal';
import { EyebrowLabel } from '@/components/shared/EyebrowLabel';
import { ServiceHoverCard } from '@/components/home/ServiceHoverCard';

const trustItems = [
  { icon: '✓', label: 'Certified professionals' },
  { icon: '✦', label: 'Premium products' },
  { icon: '♥', label: 'Hygienic & safe' },
  { icon: '✿', label: 'Bridal expertise' },
];

const whyCards = [
  { title: 'Experienced professionals', desc: 'A team trained in the latest bridal and skin techniques, with over a decade behind the chair.' },
  { title: 'Premium products', desc: 'Only trusted, gentle, salon-grade brands — kind to your skin and built to last through the big day.' },
  { title: 'Hygiene & safety', desc: 'Sanitised tools, single-use disposables and a spotless studio — every single visit.' },
  { title: 'Personalised care', desc: 'A consultation before every service, so the result is tailored to your features and your wishes.' },
  { title: 'Affordable luxury', desc: 'A premium experience at honest, transparent prices — no surprises at the counter.' },
  { title: 'Customer satisfaction', desc: 'A 4.9★ rating across 1,200+ reviews — built one delighted client at a time.' },
];

const featuredServices = [
  {
    title: 'Hair Care',
    tagline: 'Spa, colour, smoothing & styling',
    fromPrice: '100',
    tag: 'Hair care',
    bgGradient: 'linear-gradient(150deg,#f3e3dc,#efe1d0)',
    priceGroups: [
      { heading: 'Hair Treatment', rows: [{ name: 'Spa', price: '₹1,000–3,000' }, { name: 'Nanoplastia', price: '₹8,000–30,000' }, { name: 'Vegan Treatment', price: '₹10,000' }] },
      { heading: 'Styling', rows: [{ name: '1 Length Cut', price: '₹100' }, { name: 'Styling', price: '₹300–1,000' }] },
      { heading: 'Colour & Cut', rows: [{ name: 'Root Touch-up', price: '₹800–1,500' }, { name: 'Global Colour', price: '₹2,500–6,000' }, { name: 'Haircut', price: '₹200–1,200' }] },
    ],
  },
  {
    title: 'Skin & Face',
    tagline: 'Facials, hydra facial & cleanups',
    fromPrice: '300',
    tag: 'Skin & face',
    bgGradient: 'linear-gradient(150deg,#efe1d8,#ecdfce)',
    priceGroups: [
      { heading: 'Facials', rows: [{ name: 'Cleanup', price: '₹600–1,200' }, { name: 'Fruit / Hydrating', price: '₹1,000–2,500' }, { name: 'Anti-Aging', price: '₹1,800–3,500' }] },
      { heading: 'Advanced', rows: [{ name: 'Hydra Facial', price: '₹2,000–4,000' }, { name: 'Korean Glass Facial', price: '₹2,500–5,000' }] },
      { heading: 'Bleach & D-Tan', rows: [{ name: 'Face Bleach', price: '₹300–700' }, { name: 'Face D-Tan', price: '₹400–900' }] },
    ],
  },
  {
    title: 'Body Care',
    tagline: 'Polishing, D-tan & massage',
    fromPrice: '300',
    tag: 'Body care',
    bgGradient: 'linear-gradient(150deg,#f0e2d9,#ece1d0)',
    priceGroups: [
      { heading: 'Massage', rows: [{ name: 'Body Massage', price: '₹1,500–3,500' }, { name: 'Head Massage', price: '₹300–800' }] },
      { heading: 'Polishing & D-Tan', rows: [{ name: 'Body Polishing', price: '₹2,000–5,000' }, { name: 'Body D-Tan', price: '₹1,200–2,500' }] },
      { heading: 'Scrub & Cleanse', rows: [{ name: 'Body Scrub', price: '₹800–2,000' }, { name: 'Body Cleansing', price: '₹700–1,500' }] },
    ],
  },
  {
    title: 'Bridal Makeup',
    tagline: 'HD, airbrush & saree draping',
    fromPrice: '500',
    tag: 'Bridal makeup',
    bgGradient: 'linear-gradient(150deg,#f1e2da,#e9d8cd)',
    priceGroups: [
      { heading: 'Makeup', rows: [{ name: 'HD Bridal', price: '₹8,000–15,000' }, { name: 'Airbrush Bridal', price: '₹12,000–30,000' }, { name: 'Engagement / Reception', price: '₹6,000–12,000' }, { name: 'Party / Guest', price: '₹3,000–6,000' }] },
      { heading: 'Add-ons', rows: [{ name: 'Saree Draping', price: '₹500–1,500' }, { name: 'Hair Styling', price: '₹800–2,000' }] },
    ],
  },
];

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main>
        {/* HERO */}
        <header className="max-w-[1240px] mx-auto px-6 md:px-11 pt-14 pb-[18px]">
          <div className="grid grid-cols-1 md:grid-cols-[1.05fr_1fr] gap-8 md:gap-14 items-center">
            {/* Left */}
            <div>
              <EyebrowLabel className="mb-[22px]">Bridal &nbsp;·&nbsp; Beauty &nbsp;·&nbsp; Care</EyebrowLabel>
              <h1 className="font-heading font-medium text-[52px] md:text-[74px] leading-[1.02] text-[#2e2823] m-0">
                Welcome to{' '}
                <span className="font-script text-[#b5904f] text-[62px] md:text-[88px] inline-block leading-[0.8]">
                  Sakshi
                </span>
                <br />Beauty Parlour
              </h1>
              <p className="text-[16px] md:text-[18px] font-light text-[#6b5f54] leading-[1.65] mt-7 mb-0 max-w-[460px]">
                A premium salon &amp; bridal studio in the heart of Pune — where skin, hair and your most important day are treated with quiet, expert luxury.
              </p>
              <div className="flex flex-wrap gap-3.5 mt-9">
                <Link
                  href="/book"
                  className="inline-flex items-center justify-center bg-[#2e2823] text-[#f6ede0] rounded-[30px] px-8 py-4 font-body font-medium text-[14.5px] no-underline transition-all hover:-translate-y-px hover:shadow-[0_12px_26px_-10px_rgba(46,40,35,.6)]"
                >
                  Book Appointment
                </Link>
                <Link
                  href="/services"
                  className="inline-flex items-center justify-center bg-transparent text-[#2e2823] border border-[#d8c6a6] rounded-[30px] px-8 py-4 font-body font-medium text-[14.5px] no-underline transition-all hover:border-[#b5904f] hover:text-[#b5904f]"
                >
                  Explore Services
                </Link>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 mt-12 items-center">
                {[
                  { stat: '12+', label: 'Years of artistry' },
                  { stat: '600+', label: 'Brides styled' },
                  { stat: '8k+', label: 'Happy clients' },
                ].map(({ stat, label }, i) => (
                  <>
                    {i > 0 && <div key={`div-${i}`} className="w-px h-[38px] bg-[#e7dcc8] hidden sm:block" />}
                    <div key={stat}>
                      <div className="font-heading font-semibold text-[34px] text-[#b5904f] leading-none">{stat}</div>
                      <div className="text-[11px] tracking-[0.1em] uppercase text-[#9b8e84] mt-1 font-light">{label}</div>
                    </div>
                  </>
                ))}
              </div>
            </div>

            {/* Right: portrait placeholder */}
            <div className="relative hidden md:block">
              <div
                className="relative overflow-hidden h-[560px] rounded-[220px_220px_22px_22px]"
                style={{ background: 'linear-gradient(150deg,#f3e3dc,#efe1d0)' }}
              >
                <div
                  className="absolute inset-0"
                  style={{ backgroundImage: 'repeating-linear-gradient(135deg,rgba(181,144,79,.08) 0 12px,transparent 12px 24px)' }}
                />
                <span className="absolute left-1/2 bottom-4 -translate-x-1/2 whitespace-nowrap py-[5px] px-[13px] font-mono text-[9px] tracking-[0.16em] uppercase text-[#7a6a52] bg-white/72 rounded-[20px]">
                  Bridal hero portrait · your photo
                </span>
              </div>
              {/* Floating rating card */}
              <div className="absolute left-[-30px] bottom-[42px] bg-white border border-[#eee3d4] rounded-[18px] px-5 py-4 flex items-center gap-3 shadow-[0_22px_50px_-26px_rgba(60,45,30,.5)]">
                <div className="flex">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-[30px] h-[30px] rounded-full border-2 border-white"
                      style={{ background: `linear-gradient(135deg,#f1e2da,#e6d2c6)`, marginLeft: i > 0 ? '-10px' : '0' }}
                    />
                  ))}
                </div>
                <div>
                  <div className="text-[13px] font-medium text-[#2e2823]">Rated 4.9 ★</div>
                  <div className="text-[11px] text-[#9b8e84] font-light">on 1,200+ reviews</div>
                </div>
              </div>
              {/* Floating bridal badge */}
              <div className="absolute top-[30px] right-[-14px] bg-[#2e2823] text-[#f6ede0] rounded-[16px] px-[18px] py-3.5 text-center shadow-[0_18px_40px_-22px_rgba(46,40,35,.7)]">
                <div className="font-script text-[#d9b97e] text-[24px] leading-[0.8]">Bridal</div>
                <div className="text-[10px] tracking-[0.14em] uppercase text-[#cdbfae] mt-1 font-light">Specialists</div>
              </div>
            </div>
          </div>
        </header>

        {/* TRUST STRIP */}
        <div className="max-w-[1240px] mx-auto px-6 md:px-11 py-11">
          <hr className="border-0 h-px bg-[#e7dcc8]" />
          <div className="flex flex-wrap justify-between items-center gap-6 py-[30px]">
            {trustItems.map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="w-[34px] h-[34px] border border-[#b5904f] rounded-full flex items-center justify-center text-[#b5904f] text-[15px] shrink-0">
                  {icon}
                </span>
                <span className="text-[14px] font-light text-[#4a4038]">{label}</span>
              </div>
            ))}
          </div>
          <hr className="border-0 h-px bg-[#e7dcc8]" />
        </div>

        {/* WHY CHOOSE US */}
        <section className="max-w-[1240px] mx-auto px-6 md:px-11 py-10">
          <SectionReveal>
            <div className="text-center max-w-[560px] mx-auto mb-12">
              <EyebrowLabel className="mb-3.5">Why Sakshi</EyebrowLabel>
              <h2 className="font-heading font-medium text-[40px] md:text-[48px] leading-[1.08] text-[#2e2823] m-0">
                Luxury that feels{' '}
                <span className="font-script text-[#b5904f] text-[48px] md:text-[56px]">personal</span>
              </h2>
              <p className="text-[16px] font-light text-[#6b5f54] leading-[1.65] mt-4">
                Six reasons our clients return, and bring the people they love.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {whyCards.map(({ title, desc }) => (
                <div key={title} className="bg-white border border-[#eee3d4] rounded-[18px] px-[30px] py-[34px]">
                  <div className="w-[46px] h-[46px] border border-[#b5904f] rounded-full mb-[22px]" />
                  <h3 className="font-heading text-[24px] font-medium text-[#2e2823] m-0">{title}</h3>
                  <p className="text-[14px] font-light text-[#6b5f54] leading-[1.65] mt-2.5 mb-0">{desc}</p>
                </div>
              ))}
            </div>
          </SectionReveal>
        </section>

        {/* FEATURED SERVICES */}
        <section className="max-w-[1240px] mx-auto px-6 md:px-11 py-10 md:pt-[62px]">
          <SectionReveal>
            <div className="flex flex-wrap items-end justify-between mb-10 gap-6">
              <div>
                <EyebrowLabel className="mb-3.5">What we do</EyebrowLabel>
                <h2 className="font-heading font-medium text-[40px] md:text-[48px] leading-[1.05] text-[#2e2823] m-0">
                  Featured{' '}
                  <span className="font-script text-[#b5904f] text-[48px] md:text-[56px]">services</span>
                </h2>
              </div>
              <Link
                href="/services"
                className="inline-flex items-center justify-center bg-transparent text-[#2e2823] border border-[#d8c6a6] rounded-[30px] px-[26px] py-[13px] font-body font-medium text-[13.5px] no-underline transition-all hover:border-[#b5904f] hover:text-[#b5904f]"
              >
                View all services →
              </Link>
            </div>
            <p className="text-[13.5px] font-light text-[#6b5f54] -mt-5 mb-6 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[9.5px] font-semibold tracking-[0.09em] uppercase text-[#8a6a1f] bg-[#f6ecca] border border-[#e6d3a0] px-2.5 py-1 rounded-[20px]">
                Up to 20% off
              </span>
              on every service this season
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-[22px]">
              {featuredServices.map((service) => (
                <ServiceHoverCard key={service.title} {...service} />
              ))}
            </div>
          </SectionReveal>
        </section>

        {/* BRIDAL FEATURE BANNER */}
        <section className="max-w-[1240px] mx-auto px-6 md:px-11 py-10 md:py-[62px]">
          <SectionReveal>
            <div className="relative rounded-[26px] overflow-hidden bg-[#2e2823]">
              <div
                className="absolute inset-0 opacity-40"
                style={{ background: 'linear-gradient(120deg,#5a4636,#2e2823)', backgroundImage: 'repeating-linear-gradient(135deg,rgba(181,144,79,.06) 0 12px,transparent 12px 24px)' }}
              />
              <div className="relative px-8 py-16 md:px-16 md:py-[74px] max-w-[560px]">
                <EyebrowLabel className="text-[#d9b97e] mb-[18px]">Our signature</EyebrowLabel>
                <h2 className="font-heading font-medium text-[44px] md:text-[50px] leading-[1.05] text-[#f6ede0] m-0">
                  The{' '}
                  <span className="font-script text-[#d9b97e] text-[52px] md:text-[58px]">bridal</span>
                  {' '}experience
                </h2>
                <p className="text-[#cdbfae] font-light text-[15px] md:text-[16px] leading-[1.7] mt-5 mb-8 max-w-[460px]">
                  From the first trial to the final touch on your wedding morning — a calm, unhurried ritual designed entirely around you. HD &amp; airbrush makeup, hair, draping and a dedicated artist for the day.
                </p>
                <Link
                  href="/book"
                  className="inline-flex items-center justify-center bg-[#b5904f] text-white rounded-[30px] px-8 py-4 font-body font-medium text-[14.5px] no-underline transition-all hover:-translate-y-px hover:shadow-[0_12px_26px_-10px_rgba(181,144,79,.7)]"
                >
                  Plan your bridal booking
                </Link>
              </div>
            </div>
          </SectionReveal>
        </section>

        {/* GALLERY PREVIEW */}
        <section className="py-10 md:py-[62px]">
          <SectionReveal>
            <div className="max-w-[1240px] mx-auto px-6 md:px-11 flex flex-wrap items-end justify-between mb-[34px] gap-6">
              <div>
                <EyebrowLabel className="mb-3.5">A glimpse</EyebrowLabel>
                <h2 className="font-heading font-medium text-[40px] md:text-[48px] leading-[1.05] text-[#2e2823] m-0">
                  Our recent{' '}
                  <span className="font-script text-[#b5904f] text-[48px] md:text-[56px]">work</span>
                </h2>
              </div>
              <Link
                href="/gallery"
                className="inline-flex items-center justify-center bg-transparent text-[#2e2823] border border-[#d8c6a6] rounded-[30px] px-[26px] py-[13px] font-body font-medium text-[13.5px] no-underline transition-all hover:border-[#b5904f] hover:text-[#b5904f]"
              >
                View full gallery →
              </Link>
            </div>
            <div className="flex overflow-x-auto gap-[18px] pb-2 max-w-[1240px] mx-auto px-6 md:px-11 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {[
                { label: 'Bridal transformation', gradient: 'linear-gradient(160deg,#f3e3dc,#efe1d0)' },
                { label: 'Hair colour result', gradient: 'linear-gradient(160deg,#efe0d6,#ecdccb)' },
                { label: 'Party glam', gradient: 'linear-gradient(160deg,#f0e1d9,#ead9ce)' },
                { label: 'Skin glow', gradient: 'linear-gradient(160deg,#f1e2da,#e8d6cb)' },
              ].map(({ label, gradient }) => (
                <div
                  key={label}
                  className="flex-none w-[260px] md:w-[300px] h-[320px] md:h-[380px] rounded-[18px] relative overflow-hidden"
                  style={{ background: gradient }}
                >
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{ backgroundImage: 'repeating-linear-gradient(135deg,rgba(181,144,79,.08) 0 12px,transparent 12px 24px)' }}
                  />
                  <span className="absolute left-1/2 bottom-4 -translate-x-1/2 whitespace-nowrap py-[5px] px-[13px] font-mono text-[9px] tracking-[0.16em] uppercase text-[#7a6a52] bg-white/72 rounded-[20px]">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </SectionReveal>
        </section>

        {/* TESTIMONIAL */}
        <section className="max-w-[1240px] mx-auto px-6 md:px-11 py-10 md:py-[62px]">
          <SectionReveal>
            <div className="text-center max-w-[760px] mx-auto">
              <div className="font-script text-[#b5904f] text-[60px] leading-[0.4]">"</div>
              <p className="font-heading text-[28px] md:text-[34px] leading-[1.35] font-normal italic text-[#2e2823] mt-4">
                Sakshi did my bridal look and I have never felt more myself. Calm, professional, and the makeup lasted through every tear and every dance.
              </p>
              <div className="mt-6 text-[13px] tracking-[0.08em] uppercase text-[#9b8e84] font-light">
                Aditi R. &nbsp;·&nbsp; Bride, 2025
              </div>
            </div>
          </SectionReveal>
        </section>

        {/* CONTACT CTA */}
        <section className="max-w-[1240px] mx-auto px-6 md:px-11 py-10 md:pb-[74px]">
          <SectionReveal>
            <div className="bg-white border border-[#eee3d4] rounded-[26px] overflow-hidden grid grid-cols-1 md:grid-cols-[1.1fr_1fr]">
              <div className="p-8 md:p-[54px_54px_58px]">
                <EyebrowLabel className="mb-4">Book or visit</EyebrowLabel>
                <h2 className="font-heading font-medium text-[36px] md:text-[42px] leading-[1.08] text-[#2e2823] m-0">
                  Ready when{' '}
                  <span className="font-script text-[#b5904f] text-[44px] md:text-[50px]">you are</span>
                </h2>
                <p className="text-[#6b5f54] font-light text-[15px] md:text-[16px] leading-[1.65] mt-4 mb-8 max-w-[380px]">
                  Most of our clients book over a quick call or WhatsApp. Reach us directly — we reply within minutes during salon hours.
                </p>
                <div className="flex flex-wrap gap-3.5">
                  <a
                    href="tel:+919876543210"
                    className="inline-flex items-center justify-center bg-[#2e2823] text-[#f6ede0] rounded-[30px] px-8 py-4 font-body font-medium text-[14.5px] no-underline transition-all hover:-translate-y-px hover:shadow-[0_12px_26px_-10px_rgba(46,40,35,.6)]"
                  >
                    ☎ Call now
                  </a>
                  <a
                    href="https://wa.me/919876543210"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center bg-[#b5904f] text-white rounded-[30px] px-8 py-4 font-body font-medium text-[14.5px] no-underline transition-all hover:-translate-y-px hover:shadow-[0_12px_26px_-10px_rgba(181,144,79,.7)]"
                  >
                    WhatsApp us
                  </a>
                  <Link
                    href="/book"
                    className="inline-flex items-center justify-center bg-transparent text-[#2e2823] border border-[#d8c6a6] rounded-[30px] px-8 py-4 font-body font-medium text-[14.5px] no-underline transition-all hover:border-[#b5904f] hover:text-[#b5904f]"
                  >
                    Book online
                  </Link>
                </div>
              </div>
              {/* Image placeholder */}
              <div
                className="min-h-[240px] relative hidden md:block"
                style={{ background: 'linear-gradient(150deg,#f1e2da,#e8d6cb)' }}
              >
                <div
                  className="absolute inset-0 opacity-30"
                  style={{ backgroundImage: 'repeating-linear-gradient(135deg,rgba(181,144,79,.08) 0 12px,transparent 12px 24px)' }}
                />
                <span className="absolute left-1/2 bottom-4 -translate-x-1/2 whitespace-nowrap py-[5px] px-[13px] font-mono text-[9px] tracking-[0.16em] uppercase text-[#7a6a52] bg-white/72 rounded-[20px]">
                  Salon interior · reception
                </span>
              </div>
            </div>
          </SectionReveal>
        </section>
      </main>

      <Footer />
      <FloatingBookCTA />
    </>
  );
}

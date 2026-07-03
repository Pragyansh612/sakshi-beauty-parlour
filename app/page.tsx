import { Fragment } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FloatingBookCTA } from '@/components/layout/FloatingBookCTA';
import { SectionReveal } from '@/components/shared/SectionReveal';
import { EyebrowLabel } from '@/components/shared/EyebrowLabel';
import { ServiceCategoryCard } from '@/components/home/ServiceCategoryCard';
import { createClient } from '@/lib/supabase/server';
import { getGalleryPublicUrl } from '@/lib/supabase/storage';
import { getServiceCategoriesWithServices } from '@/lib/services-data';

export const revalidate = 3600;

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

const FEATURED_SLUGS = ['hair', 'skin', 'body', 'bridal'];

export default async function HomePage() {
  const supabase = await createClient();
  const allCategories = await getServiceCategoriesWithServices();
  const featuredServices = FEATURED_SLUGS
    .map((slug) => allCategories.find((c) => c.slug === slug))
    .filter((c): c is NonNullable<typeof c> => !!c);
  const { data } = await supabase
    .from('gallery_images')
    .select('id, title, category, tag, storage_path')
    .eq('section', 'work')
    .order('display_order')
    .limit(6);

  const galleryPreview = (data ?? []).map((img) => ({
    id: img.id,
    title: img.title,
    category: img.category,
    tag: img.tag,
    imageUrl: getGalleryPublicUrl(img.storage_path),
  }));

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
                A premium salon &amp; bridal studio in the heart of Sagar — where skin, hair and your most important day are treated with quiet, expert luxury.
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
                  { stat: '15+', label: 'Years of artistry' },
                  { stat: '1000+', label: 'Brides styled' },
                  { stat: '12k+', label: 'Happy clients' },
                ].map(({ stat, label }, i) => (
                  <Fragment key={stat}>
                    {i > 0 && <div className="w-px h-[38px] bg-[#e7dcc8] hidden sm:block" />}
                    <div>
                      <div className="font-heading font-semibold text-[34px] text-[#b5904f] leading-none">{stat}</div>
                      <div className="text-[11px] tracking-[0.1em] uppercase text-[#9b8e84] mt-1 font-light">{label}</div>
                    </div>
                  </Fragment>
                ))}
              </div>
            </div>

            {/* Right: portrait */}
            <div className="relative mt-10 md:mt-0">
              <div className="relative overflow-hidden h-[360px] md:h-[560px] rounded-[120px_120px_22px_22px] md:rounded-[220px_220px_22px_22px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/stock/hero-bridal-portrait.jpg"
                  alt="Bridal makeup portrait"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              {/* Floating rating card */}
              <div className="absolute left-1 md:left-[-30px] bottom-6 md:bottom-[42px] bg-white border border-[#eee3d4] rounded-[18px] px-4 py-3 md:px-5 md:py-4 flex items-center gap-3 shadow-[0_22px_50px_-26px_rgba(60,45,30,.5)]">
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
              <div className="absolute top-4 md:top-[30px] right-1 md:right-[-14px] bg-[#2e2823] text-[#f6ede0] rounded-[16px] px-[18px] py-3.5 text-center shadow-[0_18px_40px_-22px_rgba(46,40,35,.7)]">
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
                <ServiceCategoryCard key={service.id} {...service} />
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
              {galleryPreview.length > 0 ? (
                galleryPreview.map((img) => (
                  <div
                    key={img.id}
                    className="flex-none w-[260px] md:w-[300px] h-[320px] md:h-[380px] rounded-[18px] relative overflow-hidden"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.imageUrl} alt={img.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                    <span className="absolute left-1/2 bottom-4 -translate-x-1/2 whitespace-nowrap py-[5px] px-[13px] font-mono text-[9px] tracking-[0.16em] uppercase text-[#7a6a52] bg-white/72 rounded-[20px]">
                      {img.tag}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#8a7d6e] px-6">Photos coming soon.</p>
              )}
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
                    href="tel:+918962339467"
                    className="inline-flex items-center justify-center bg-[#2e2823] text-[#f6ede0] rounded-[30px] px-8 py-4 font-body font-medium text-[14.5px] no-underline transition-all hover:-translate-y-px hover:shadow-[0_12px_26px_-10px_rgba(46,40,35,.6)]"
                  >
                    ☎ Call now
                  </a>
                  <a
                    href="https://wa.me/919179176965"
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
              {/* Salon interior */}
              <div className="h-[200px] md:h-auto md:min-h-[240px] relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/stock/salon-interior.jpg"
                  alt="Salon interior"
                  className="absolute inset-0 w-full h-full object-cover"
                />
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

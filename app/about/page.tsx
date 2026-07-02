import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FloatingBookCTA } from '@/components/layout/FloatingBookCTA';
import { EyebrowLabel } from '@/components/shared/EyebrowLabel';
import { createClient } from '@/lib/supabase/server';
import { getGalleryPublicUrl } from '@/lib/supabase/storage';

const stats = [
  { stat: '12+', label: 'Years of artistry' },
  { stat: '600+', label: 'Brides styled' },
  { stat: '8k+', label: 'Happy clients' },
  { stat: '4.9★', label: 'Avg. rating' },
];

const standards = [
  { num: '01', title: 'Hygiene first', desc: 'Sanitised tools and single-use disposables for every client, every time.' },
  { num: '02', title: 'Certified artists', desc: 'A trained, continually-upskilled team across bridal, skin and hair.' },
  { num: '03', title: 'Honest pricing', desc: 'Transparent rates, shared upfront — no surprises at the counter.' },
];

export default async function AboutPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('gallery_images')
    .select('id, title, storage_path')
    .eq('section', 'work')
    .order('display_order')
    .limit(4);

  const workPhotos = (data ?? []).map((img) => ({
    id: img.id,
    title: img.title,
    imageUrl: getGalleryPublicUrl(img.storage_path),
  }));
  const [heroPhoto, ...stripPhotos] = workPhotos;

  return (
    <>
      <Navbar />

      <main>
        {/* HERO */}
        <header className="max-w-[1240px] mx-auto px-6 md:px-11 pt-14 pb-[30px]">
          <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-10 md:gap-14 items-center">
            <div>
              <EyebrowLabel className="mb-5">Our story</EyebrowLabel>
              <h1 className="font-heading font-medium text-[44px] md:text-[64px] leading-[1.03] text-[#2e2823] m-0">
                A studio built on{' '}
                <span className="font-script text-[#b5904f] text-[52px] md:text-[74px] inline-block leading-[0.8]">
                  trust
                </span>
              </h1>
              <p className="text-[16px] md:text-[17px] font-light text-[#6b5f54] leading-[1.7] mt-6 mb-0 max-w-[440px]">
                Sakshi Beauty Parlour began with a simple belief: every woman deserves to feel beautifully herself — cared for by people she can trust, in a space that feels calm and luxurious.
              </p>
              <p className="text-[14px] md:text-[15px] font-light text-[#6b5f54] leading-[1.7] mt-4 mb-0 max-w-[440px]">
                Twelve years on, we&apos;re proud to be one of Sagar&apos;s most-loved bridal and beauty studios — but our approach hasn&apos;t changed. Listen first. Personalise everything. Never rush.
              </p>
            </div>
            <div className="relative overflow-hidden h-[320px] md:h-[480px] rounded-[24px_24px_200px_200px]">
              {heroPhoto ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={heroPhoto.imageUrl} alt={heroPhoto.title} className="absolute inset-0 w-full h-full object-cover" />
                </>
              ) : (
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(150deg,#f3e3dc,#efe1d0)', backgroundImage: 'repeating-linear-gradient(135deg,rgba(181,144,79,.08) 0 12px,transparent 12px 24px)' }}
                />
              )}
              <span className="absolute left-1/2 bottom-4 -translate-x-1/2 whitespace-nowrap py-[5px] px-[13px] font-mono text-[9px] tracking-[0.16em] uppercase text-[#7a6a52] bg-white/72 rounded-[20px]">
                Our studio
              </span>
            </div>
          </div>
        </header>

        {/* STATS BAND */}
        <section className="max-w-[1240px] mx-auto px-6 md:px-11 py-11">
          <div className="bg-white border border-[#eee3d4] rounded-[18px] grid grid-cols-2 md:grid-cols-4 overflow-hidden">
            {stats.map(({ stat, label }, i) => (
              <div
                key={stat}
                className={`px-6 py-8 text-center border-[#eee3d4] ${i % 2 === 0 ? 'border-r' : ''} ${i < 2 ? 'border-b md:border-b-0' : ''} ${i === 1 ? 'md:border-r' : ''} ${i === 2 ? 'md:border-r' : ''}`}
              >
                <div className="font-heading font-semibold text-[36px] md:text-[42px] text-[#b5904f]">{stat}</div>
                <div className="text-[11px] md:text-[12px] tracking-[0.1em] uppercase text-[#6b5f54] font-light mt-1">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* MISSION / VISION */}
        <section className="max-w-[1240px] mx-auto px-6 md:px-11 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-[#eee3d4] rounded-[18px] p-9 md:p-[44px_42px]">
              <div className="font-script text-[#b5904f] text-[34px] leading-[0.8]">Our mission</div>
              <h2 className="font-heading font-medium text-[28px] md:text-[30px] text-[#2e2823] mt-3">
                To make luxury beauty feel personal
              </h2>
              <p className="text-[15px] font-light text-[#6b5f54] leading-[1.7] mt-3.5">
                We exist to give every client an experience that&apos;s as thoughtful as it is beautiful — premium products, expert hands, and undivided attention, at a price that feels fair.
              </p>
            </div>
            <div className="bg-[#2e2823] border border-[#2e2823] rounded-[18px] p-9 md:p-[44px_42px]">
              <div className="font-script text-[#d9b97e] text-[34px] leading-[0.8]">Our vision</div>
              <h2 className="font-heading font-medium text-[28px] md:text-[30px] text-[#f6ede0] mt-3">
                To be Sagar&apos;s most-trusted bridal studio
              </h2>
              <p className="text-[15px] font-light text-[#cdbfae] leading-[1.7] mt-3.5">
                A name families pass down — the studio a bride&apos;s mother recommends to her daughter, because the care, the calm and the craft never waver.
              </p>
            </div>
          </div>
        </section>

        {/* STANDARDS */}
        <section className="max-w-[1240px] mx-auto px-6 md:px-11 pt-9 pb-8">
          <div className="text-center max-w-[560px] mx-auto mb-11">
            <EyebrowLabel className="mb-3.5">How we work</EyebrowLabel>
            <h2 className="font-heading font-medium text-[36px] md:text-[44px] leading-[1.06] text-[#2e2823] m-0">
              Professional <span className="font-script text-[#b5904f] text-[44px] md:text-[52px]">standards</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[22px]">
            {standards.map(({ num, title, desc }) => (
              <div key={num} className="bg-white border border-[#eee3d4] rounded-[18px] px-[30px] py-8">
                <div className="font-heading text-[30px] text-[#e2cfa6]">{num}</div>
                <h3 className="font-heading text-[23px] font-medium text-[#2e2823] mt-2.5 m-0">{title}</h3>
                <p className="text-[13.5px] font-light text-[#6b5f54] leading-[1.6] mt-2 mb-0">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* WORK STRIP */}
        {stripPhotos.length > 0 && (
          <section className="max-w-[1240px] mx-auto px-6 md:px-11 pt-9 pb-8">
            <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
              <h2 className="font-heading font-medium text-[30px] md:text-[36px] leading-[1.06] text-[#2e2823] m-0">
                A glimpse of our <span className="font-script text-[#b5904f] text-[36px] md:text-[42px]">work</span>
              </h2>
              <Link
                href="/gallery"
                className="inline-flex items-center justify-center bg-transparent text-[#2e2823] border border-[#d8c6a6] rounded-[30px] px-[22px] py-[11px] font-body font-medium text-[13px] no-underline transition-all hover:border-[#b5904f] hover:text-[#b5904f]"
              >
                View full gallery →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {stripPhotos.map((photo) => (
                <div key={photo.id} className="relative overflow-hidden h-[200px] md:h-[240px] rounded-[16px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.imageUrl} alt={photo.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* COMMITMENT */}
        <section className="max-w-[1240px] mx-auto px-6 md:px-11 pt-9 pb-8">
          <div className="bg-white border border-[#eee3d4] rounded-[24px] overflow-hidden grid grid-cols-1 md:grid-cols-[1fr_1.1fr]">
            <div className="relative overflow-hidden min-h-[240px] md:min-h-[340px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/stock/spa-treatment-candid.jpg"
                alt="Beauty treatment in progress"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div className="p-8 md:p-[54px_50px] flex flex-col justify-center">
              <EyebrowLabel className="mb-3.5">Our promise to you</EyebrowLabel>
              <h2 className="font-heading font-medium text-[30px] md:text-[36px] leading-[1.08] text-[#2e2823] m-0">
                Customer commitment
              </h2>
              <p className="text-[15px] font-light text-[#6b5f54] leading-[1.7] mt-3.5 max-w-[420px]">
                From your first message to the final mirror moment, you&apos;ll be heard, cared for and never hurried. If something isn&apos;t perfect, we&apos;ll make it right — that&apos;s our word.
              </p>
              <div className="flex flex-wrap gap-3.5 mt-6.5">
                <Link
                  href="/book"
                  className="inline-flex items-center justify-center bg-[#2e2823] text-[#f6ede0] rounded-[30px] px-8 py-4 font-body font-medium text-[14.5px] no-underline transition-all hover:-translate-y-px hover:shadow-[0_12px_26px_-10px_rgba(46,40,35,.6)]"
                >
                  Book an appointment
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center bg-transparent text-[#2e2823] border border-[#d8c6a6] rounded-[30px] px-8 py-4 font-body font-medium text-[14.5px] no-underline transition-all hover:border-[#b5904f] hover:text-[#b5904f]"
                >
                  Visit us
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* QUOTE */}
        <section className="max-w-[1240px] mx-auto px-6 md:px-11 pt-12 pb-[74px] text-center">
          <p className="font-heading font-normal italic text-[24px] md:text-[32px] leading-[1.4] text-[#2e2823] max-w-[740px] mx-auto m-0">
            &quot;We don&apos;t just want you to look beautiful — we want you to leave feeling cared for.&quot;
          </p>
          <div className="mt-5 text-[13px] tracking-[0.08em] uppercase text-[#9b8e84] font-light">
            Sakshi &middot; Founder &amp; Lead Artist
          </div>
        </section>
      </main>

      <Footer />
      <FloatingBookCTA />
    </>
  );
}

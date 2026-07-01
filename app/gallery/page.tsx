import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FloatingBookCTA } from '@/components/layout/FloatingBookCTA';
import { EyebrowLabel } from '@/components/shared/EyebrowLabel';
import { GalleryMasonry } from '@/components/gallery/GalleryMasonry';
import { createClient } from '@/lib/supabase/server';
import { getGalleryPublicUrl } from '@/lib/supabase/storage';

export const revalidate = 1800;

const achievements = [
  { icon: '✓', title: 'Professional certifications', desc: 'Certified in advanced bridal & HD makeup by leading academies.' },
  { icon: '★', title: 'Beauty workshops', desc: "Regular masterclasses to stay ahead of every season's techniques." },
  { icon: '✦', title: 'Makeup training certificates', desc: 'Airbrush & HD specialisation, with hands-on bridal certification.' },
  { icon: '♛', title: 'Industry recognition', desc: "Featured among Pune's trusted bridal studios by local press." },
  { icon: '❀', title: 'Event participation', desc: 'On-site teams for weddings, fashion shows & community events.' },
];

export default async function GalleryPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('gallery_images')
    .select('id, title, category, tag, storage_path')
    .eq('section', 'work')
    .order('display_order');

  const images = (data ?? []).map((img) => ({
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
        {/* HEADER */}
        <header className="max-w-[1240px] mx-auto px-6 md:px-11 pt-14 pb-9 text-center">
          <EyebrowLabel className="mb-4">Real work · real results</EyebrowLabel>
          <h1 className="font-heading font-medium text-[44px] md:text-[62px] leading-[1.04] text-[#2e2823] m-0">
            Our <span className="font-script text-[#b5904f] text-[52px] md:text-[74px]">gallery</span>
          </h1>
          <p className="text-[16px] md:text-[17px] font-light text-[#6b5f54] leading-[1.65] mt-4.5 mb-0 max-w-[560px] mx-auto">
            A look at the brides we&apos;ve styled, the transformations we&apos;re proud of, and the recognition we&apos;ve earned along the way.
          </p>
        </header>

        <GalleryMasonry images={images} />

        {/* ACHIEVEMENTS */}
        <section className="max-w-[1240px] mx-auto px-6 md:px-11 pt-14 pb-8">
          <div className="text-center max-w-[560px] mx-auto mb-11">
            <EyebrowLabel className="mb-3.5">Recognition</EyebrowLabel>
            <h2 className="font-heading font-medium text-[38px] md:text-[46px] leading-[1.06] text-[#2e2823] m-0">
              Achievements &amp; <span className="font-script text-[#b5904f] text-[46px] md:text-[54px]">credentials</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[22px]">
            {achievements.map(({ icon, title, desc }) => (
              <div key={title} className="bg-white border border-[#eee3d4] rounded-[18px] px-[30px] py-8">
                <div className="w-[46px] h-[46px] border-[1.4px] border-[#b5904f] rounded-full flex items-center justify-center text-[#b5904f] text-lg mb-5">
                  {icon}
                </div>
                <h3 className="font-heading text-[23px] font-medium text-[#2e2823] m-0">{title}</h3>
                <p className="text-[13.5px] font-light text-[#6b5f54] leading-[1.6] mt-2 mb-0">{desc}</p>
              </div>
            ))}
            <div className="bg-[#2e2823] border border-[#2e2823] rounded-[18px] px-[30px] py-8">
              <div className="font-script text-[#d9b97e] text-[30px] leading-[0.8]">12 years</div>
              <h3 className="font-heading text-[23px] font-medium text-[#f6ede0] mt-2 m-0">of trusted artistry</h3>
              <p className="text-[13.5px] font-light text-[#cdbfae] leading-[1.6] mt-2 mb-0">
                Over 600 brides and 8,000 happy clients — and counting.
              </p>
            </div>
          </div>
        </section>

        {/* CTA STRIP */}
        <section className="max-w-[1240px] mx-auto px-6 md:px-11 pt-11 pb-[74px]">
          <div className="bg-[#2e2823] rounded-[24px] px-8 py-10 md:px-[54px] md:py-[50px] flex items-center justify-between flex-wrap gap-6">
            <div>
              <h2 className="font-heading font-medium text-[28px] md:text-[34px] text-[#f6ede0] m-0">
                Like what you see?
              </h2>
              <p className="text-[#cdbfae] font-light text-[15px] mt-2">Let&apos;s create your transformation next.</p>
            </div>
            <Link
              href="/book"
              className="inline-flex items-center justify-center bg-[#b5904f] text-white rounded-[30px] px-8 py-4 font-body font-medium text-[14.5px] no-underline transition-all hover:shadow-[0_12px_26px_-10px_rgba(181,144,79,.7)]"
            >
              Book your appointment
            </Link>
          </div>
        </section>
      </main>

      <Footer />
      <FloatingBookCTA />
    </>
  );
}

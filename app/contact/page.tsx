import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FloatingBookCTA } from '@/components/layout/FloatingBookCTA';
import { EyebrowLabel } from '@/components/shared/EyebrowLabel';

const detailRows = [
  { icon: '⚲', label: 'Address', value: 'Shop 14, Rose Arcade, FC Road,\nShivaji Nagar, Pune 411005' },
  { icon: '☎', label: 'Call', value: '+91 89623 39467', href: 'tel:+918962339467' },
  { icon: '✆', label: 'WhatsApp', value: '+91 91791 76465', href: 'https://wa.me/919179176465' },
  { icon: '✉', label: 'Email', value: 'hello@sakshibeautyparlour.in', href: 'mailto:hello@sakshibeautyparlour.in' },
  { icon: '◷', label: 'Working hours', value: 'Monday – Sunday\n11:00 AM – 9:00 PM' },
];

export default function ContactPage() {
  return (
    <>
      <Navbar />

      <main>
        {/* HEADER */}
        <header className="max-w-[1240px] mx-auto px-6 md:px-11 pt-14 pb-9 text-center">
          <EyebrowLabel className="mb-4">We&apos;d love to hear from you</EyebrowLabel>
          <h1 className="font-heading font-medium text-[44px] md:text-[62px] leading-[1.04] text-[#2e2823] m-0">
            Get in <span className="font-script text-[#b5904f] text-[52px] md:text-[74px]">touch</span>
          </h1>
          <p className="text-[16px] md:text-[17px] font-light text-[#6b5f54] leading-[1.65] mt-4.5 mb-0 max-w-[540px] mx-auto">
            Call, WhatsApp or drop by the studio. For the quickest response, a call or WhatsApp message always reaches us first.
          </p>
        </header>

        {/* QUICK CONTACT CARDS */}
        <section className="max-w-[1240px] mx-auto px-6 md:px-11 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <a href="tel:+918962339467" className="no-underline">
              <div className="bg-white border border-[#eee3d4] rounded-[18px] px-7 py-[30px] text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_24px_46px_-28px_rgba(60,45,30,.5)]">
                <div className="w-[54px] h-[54px] rounded-full bg-[#2e2823] text-[#f6ede0] flex items-center justify-center text-xl mx-auto mb-4">
                  ☎
                </div>
                <h3 className="font-heading text-[24px] font-medium text-[#2e2823] m-0">Call us</h3>
                <p className="text-[13px] font-light text-[#6b5f54] mt-1">Fastest way to book</p>
                <div className="mt-2.5 text-[15px] font-medium text-[#b5904f]">+91 89623 39467</div>
              </div>
            </a>
            <a href="https://wa.me/919179176465" target="_blank" rel="noopener noreferrer" className="no-underline">
              <div className="bg-white border border-[#eee3d4] rounded-[18px] px-7 py-[30px] text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_24px_46px_-28px_rgba(60,45,30,.5)]">
                <div className="w-[54px] h-[54px] rounded-full bg-[#b5904f] text-white flex items-center justify-center text-xl mx-auto mb-4">
                  ✆
                </div>
                <h3 className="font-heading text-[24px] font-medium text-[#2e2823] m-0">WhatsApp</h3>
                <p className="text-[13px] font-light text-[#6b5f54] mt-1">Send us your queries</p>
                <div className="mt-2.5 text-[15px] font-medium text-[#b5904f]">+91 91791 76465</div>
              </div>
            </a>
            <div className="bg-white border border-[#eee3d4] rounded-[18px] px-7 py-[30px] text-center">
              <div className="text-[13px] font-medium tracking-[0.04em] uppercase text-[#6b5f54]">Follow us</div>
              <div className="flex justify-center gap-3.5 my-4">
                {[
                  { label: 'Instagram', href: 'https://www.instagram.com/sakshi_beauty_parlour._?igsh=Ym1rbHFtNGRoZGI1' },
                  { label: 'Facebook', href: 'https://facebook.com/sakshibeautyparlour' },
                  { label: 'YouTube', href: 'https://youtube.com/@sakshibeautyparlourmakroni8143?si=As5i0emgYXyOVHR0' },
                ].map(({ label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-12 h-12 rounded-full bg-[#f6ecdb] text-[#b5904f] flex items-center justify-center text-sm transition-colors hover:bg-[#b5904f] hover:text-white"
                  >
                    {label[0]}
                  </a>
                ))}
              </div>
              <div className="text-[15px] font-medium text-[#b5904f]">@sakshi_beauty_parlour._</div>
            </div>
          </div>
        </section>

        {/* DETAILS */}
        <section className="max-w-[1240px] mx-auto px-6 md:px-11 py-8">
          <div className="max-w-[600px] mx-auto">
            <h2 className="font-heading font-medium text-[30px] md:text-[34px] text-[#2e2823] m-0">Studio details</h2>
            <div className="mt-3.5">
              {detailRows.map(({ icon, label, value, href }, i) => (
                <div
                  key={label}
                  className={`flex gap-4 items-start py-5 ${i < detailRows.length - 1 ? 'border-b border-[#eee3d4]' : ''}`}
                >
                  <div className="w-[46px] h-[46px] rounded-xl bg-[#f6ecdb] flex items-center justify-center text-[#b5904f] text-lg shrink-0">
                    {icon}
                  </div>
                  <div>
                    <div className="text-[14px] font-medium text-[#2e2823]">{label}</div>
                    {href ? (
                      <a href={href} className="text-[14px] font-light text-[#b5904f] no-underline mt-0.5 block">
                        {value}
                      </a>
                    ) : (
                      <div className="text-[14px] font-light text-[#6b5f54] mt-0.5 whitespace-pre-line leading-[1.5]">
                        {value}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Map placeholder */}
            <div
              className="relative overflow-hidden h-[230px] rounded-2xl mt-6"
              style={{ background: 'linear-gradient(150deg,#e9e2d4,#ddd5c4)' }}
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(181,144,79,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(181,144,79,.12) 1px,transparent 1px)',
                  backgroundSize: '38px 38px',
                }}
              />
              <div className="absolute left-1/2 top-[46%] w-[18px] h-[18px] rounded-[50%_50%_50%_0] bg-[#b5904f] -translate-x-1/2 -translate-y-1/2 rotate-[-45deg] shadow-[0_8px_18px_-6px_rgba(181,144,79,.8)]" />
              <span className="absolute left-1/2 bottom-4 -translate-x-1/2 whitespace-nowrap py-1.5 px-3.5 font-mono text-[9px] tracking-[0.16em] uppercase text-[#7a6a52] bg-white/82 rounded-[20px]">
                Google Map embed · FC Road, Pune
              </span>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-[1240px] mx-auto px-6 md:px-11 pt-8 pb-[74px]">
          <div className="bg-[#2e2823] rounded-[24px] px-8 py-10 md:px-[54px] md:py-[50px] text-center">
            <div className="font-script text-[#d9b97e] text-[36px] md:text-[40px] leading-[0.8]">Visit us</div>
            <h2 className="font-heading font-medium text-[28px] md:text-[34px] text-[#f6ede0] mt-2.5">
              Walk in, or reserve ahead
            </h2>
            <p className="text-[#cdbfae] font-light text-[15px] mt-2.5 mb-6 max-w-[440px] mx-auto">
              We welcome walk-ins, but booking ahead means your preferred artist and time are reserved just for you.
            </p>
            <div className="flex gap-3.5 justify-center flex-wrap">
              <Link
                href="/book"
                className="inline-flex items-center justify-center bg-[#b5904f] text-white rounded-[30px] px-8 py-4 font-body font-medium text-[14.5px] no-underline transition-all hover:shadow-[0_12px_26px_-10px_rgba(181,144,79,.7)]"
              >
                Book appointment
              </Link>
              <a
                href="tel:+918962339467"
                className="inline-flex items-center justify-center bg-transparent text-[#f6ede0] border border-[#5a5048] rounded-[30px] px-8 py-4 font-body font-medium text-[14.5px] no-underline transition-all hover:border-[#d9b97e] hover:text-[#d9b97e]"
              >
                ☎ Call now
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

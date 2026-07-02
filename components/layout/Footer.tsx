import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#2e2823] text-[#cdbfae]">
      <div className="max-w-[1240px] mx-auto px-6 md:px-11 pt-16 pb-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <div className="font-heading font-medium text-[22px] leading-[0.86] text-[#f6ede0]">
            Sakshi
            <small className="block font-body font-normal text-[8px] tracking-[0.42em] uppercase text-[#d9b97e] mt-1">
              Beauty Parlour
            </small>
          </div>
          <p className="mt-5 font-light text-sm leading-[1.7] text-[#b6a895] max-w-[260px]">
            Premium salon &amp; bridal studio. Skin, hair, body and bridal artistry — with quiet luxury at every step.
          </p>
          <div className="mt-[22px] flex items-center gap-[11px]">
            <a
              href="https://www.instagram.com/sakshi_beauty_parlour._?igsh=Ym1rbHFtNGRoZGI1"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-10 h-10 rounded-full border border-[#5a5048] flex items-center justify-center text-[#cdbfae] transition-colors hover:border-[#d9b97e] hover:text-[#d9b97e]"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="3.5" y="3.5" width="17" height="17" rx="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/>
              </svg>
            </a>
            <a
              href="https://facebook.com/sakshibeautyparlour"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="w-10 h-10 rounded-full border border-[#5a5048] flex items-center justify-center text-[#cdbfae] transition-colors hover:border-[#d9b97e] hover:text-[#d9b97e]"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.5 21v-7h2.3l.4-2.9h-2.7V9.2c0-.84.27-1.4 1.46-1.4H16.3V5.2c-.27-.04-1.2-.12-2.27-.12-2.25 0-3.8 1.37-3.8 3.9v2.18H7.9V14h2.33v7z"/>
              </svg>
            </a>
            <a
              href="https://youtube.com/@sakshibeautyparlourmakroni8143?si=As5i0emgYXyOVHR0"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="w-10 h-10 rounded-full border border-[#5a5048] flex items-center justify-center text-[#cdbfae] transition-colors hover:border-[#d9b97e] hover:text-[#d9b97e]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="2.5" y="6" width="19" height="12" rx="4"/>
                <path d="M10.3 9.3l4.8 2.7-4.8 2.7z" fill="currentColor" stroke="none"/>
              </svg>
            </a>
            <span className="text-[12.5px] text-[#8a7d6e] font-light ml-1">@sakshi_beauty_parlour._</span>
          </div>
        </div>

        {/* Explore */}
        <div>
          <div className="text-xs tracking-[0.18em] uppercase text-[#8a7d6e] mb-[18px]">Explore</div>
          <div className="flex flex-col gap-[11px] font-light text-sm">
            {[
              { href: '/',        label: 'Home' },
              { href: '/services', label: 'Services' },
              { href: '/gallery',  label: 'Gallery' },
              { href: '/about',    label: 'About Us' },
              { href: '/contact',  label: 'Contact' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} className="text-[#cdbfae] no-underline hover:text-[#d9b97e] transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Account */}
        <div>
          <div className="text-xs tracking-[0.18em] uppercase text-[#8a7d6e] mb-[18px]">Account</div>
          <div className="flex flex-col gap-[11px] font-light text-sm">
            {[
              { href: '/book',      label: 'Book appointment' },
              { href: '/login',     label: 'Login' },
              { href: '/login',     label: 'Register' },
              { href: '/dashboard', label: 'My dashboard' },
            ].map(({ href, label }, i) => (
              <Link key={`${href}-${i}`} href={href} className="text-[#cdbfae] no-underline hover:text-[#d9b97e] transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Visit us */}
        <div>
          <div className="text-xs tracking-[0.18em] uppercase text-[#8a7d6e] mb-[18px]">Visit us</div>
          <div className="font-light text-sm leading-[1.7] text-[#cdbfae]">
            Shop 14, Rose Arcade,<br />
            FC Road, Shivaji Nagar,<br />
            Pune 411005<br />
            <br />
            <a href="tel:+918962339467" className="text-[#f6ede0] no-underline hover:text-[#d9b97e] transition-colors">
              +91 89623 39467
            </a>
            <br />
            <span className="text-[#8a7d6e]">Mon–Sun · 11:00 AM – 9:00 PM</span>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#463e36]">
        <div className="max-w-[1240px] mx-auto px-6 md:px-11 py-[22px] flex flex-wrap justify-between gap-2.5 text-xs text-[#8a7d6e] font-light">
          <span>© {currentYear} Sakshi Beauty Parlour. All rights reserved.</span>
          <span>Crafted with care in Pune.</span>
        </div>
      </div>
    </footer>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MobileNav } from './MobileNav';

const navLinks = [
  { href: '/',        label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/gallery',  label: 'Gallery' },
  { href: '/about',    label: 'About' },
  { href: '/contact',  label: 'Contact' },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      <nav
        className="sticky top-0 z-50 border-b border-[#e7dcc8]"
        style={{ background: 'rgba(250,246,239,0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      >
        <div className="max-w-[1240px] mx-auto px-6 md:px-11 flex items-center justify-between gap-6 py-4">
          {/* Logo */}
          <Link
            href="/"
            className="shrink-0 font-heading font-medium text-[25px] leading-[0.86] tracking-[0.01em] text-[#2e2823] no-underline"
          >
            Sakshi
            <small className="block font-body font-normal text-[8px] tracking-[0.42em] uppercase text-[#b5904f] mt-1">
              Beauty Parlour
            </small>
          </Link>

          {/* Desktop nav links */}
          <ul className="hidden md:flex gap-[30px] list-none m-0 p-0">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'text-[13.5px] font-normal tracking-[0.02em] no-underline relative py-1 transition-colors duration-[180ms]',
                    isActive(href)
                      ? 'text-[#b5904f] after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:h-px after:bg-[#b5904f] after:content-[""]'
                      : 'text-[#4a4038] hover:text-[#b5904f]'
                  )}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-[18px] shrink-0">
            <a
              href="tel:+918962339467"
              className="text-[13px] text-[#6b5f54] no-underline whitespace-nowrap"
            >
              ☎ <strong className="text-[#2e2823] font-medium">+91 89623 39467</strong>
            </a>
            <Link
              href="/book"
              className="inline-flex items-center justify-center gap-2 bg-[#2e2823] text-[#f6ede0] rounded-[30px] px-[26px] py-[13px] font-body font-medium text-[13.5px] tracking-[0.02em] no-underline transition-all duration-[160ms] hover:-translate-y-px hover:shadow-[0_12px_26px_-10px_rgba(46,40,35,.6)]"
            >
              Book Appointment
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-[#2e2823]"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </nav>

      <MobileNav
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        pathname={pathname}
      />
    </>
  );
}

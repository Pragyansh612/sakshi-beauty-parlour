'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { MobileNav } from '@/components/layout/MobileNav';

interface DashboardNavbarProps {
  fullName: string;
}

export function DashboardNavbar({ fullName }: DashboardNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [signingOut, setSigningOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const initial = fullName.trim().charAt(0).toUpperCase() || 'A';

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <>
      <nav
        className="sticky top-0 z-50 border-b border-[#e7dcc8]"
        style={{ background: 'rgba(250,246,239,0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      >
        <div className="max-w-[1240px] mx-auto px-6 md:px-11 flex items-center justify-between gap-6 py-4">
          <Link
            href="/"
            className="shrink-0 font-heading font-medium text-[25px] leading-[0.86] tracking-[0.01em] text-[#2e2823] no-underline"
          >
            Sakshi
            <small className="block font-body font-normal text-[8px] tracking-[0.42em] uppercase text-[#b5904f] mt-1">
              Beauty Parlour
            </small>
          </Link>

          <ul className="hidden md:flex gap-[30px] list-none m-0 p-0">
            {[
              { href: '/', label: 'Home' },
              { href: '/services', label: 'Services' },
              { href: '/gallery', label: 'Gallery' },
              { href: '/about', label: 'About' },
              { href: '/contact', label: 'Contact' },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-[13.5px] font-normal tracking-[0.02em] no-underline py-1 text-[#4a4038] hover:text-[#b5904f] transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden md:flex items-center gap-[18px] shrink-0">
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="inline-flex items-center justify-center gap-2 border border-[#d8c6a6] text-[#2e2823] rounded-[30px] px-[26px] py-[9px] font-body font-medium text-[13.5px] tracking-[0.02em] transition-colors hover:border-[#b5904f] hover:text-[#b5904f] disabled:opacity-60"
            >
              {signingOut ? 'Signing out…' : 'Sign out'}
            </button>
            <div className="w-[42px] h-[42px] rounded-full bg-gradient-to-br from-[#e9d8cd] to-[#dcc6b8] flex items-center justify-center font-heading font-semibold text-[#7a5c45]">
              {initial}
            </div>
          </div>

          <button
            className="md:hidden p-2 text-[#2e2823]"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </nav>

      <MobileNav isOpen={mobileOpen} onClose={() => setMobileOpen(false)} pathname={pathname} />
    </>
  );
}

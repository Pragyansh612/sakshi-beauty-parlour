'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '▣' },
  { href: '/admin/appointments', label: 'Appointments', icon: '◷' },
  { href: '/admin/bookings', label: 'Bookings', icon: '✦' },
];

const MANAGE = [
  { href: '/admin/services', label: 'Services', icon: '✂' },
  { href: '/admin/gallery', label: 'Gallery', icon: '▦' },
  { href: '/admin/slots', label: 'Slots', icon: '⊞' },
];

function NavItem({ href, label, icon, onNavigate }: { href: string; label: string; icon: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = pathname.startsWith(href);
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-[11px] px-[13px] py-[11px] rounded-[10px] text-[13.5px] font-normal transition-all mt-[3px] no-underline',
        active ? 'bg-[#b5904f] text-white' : 'text-[#b6a895] hover:bg-[#3a332c] hover:text-[#f6ede0]'
      )}
    >
      <span className="w-[18px] text-center text-sm">{icon}</span>
      {label}
    </Link>
  );
}

function SidebarContent({ adminName, onNavigate }: { adminName: string; onNavigate?: () => void }) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const initial = adminName.trim().charAt(0).toUpperCase() || 'S';

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <>
      <Link href="/" className="font-heading font-medium text-[21px] text-[#f6ede0] leading-[0.9] px-2.5 pb-1 no-underline">
        Sakshi
        <small className="block font-body font-normal text-[7px] tracking-[0.36em] uppercase text-[#d9b97e] mt-1">
          Admin Panel
        </small>
      </Link>
      <div className="mt-[18px]">
        {NAV.map((item) => (
          <NavItem key={item.href} {...item} onNavigate={onNavigate} />
        ))}
      </div>
      <div className="text-[10px] tracking-[0.18em] uppercase text-[#6f6356] px-[13px] pt-[18px] pb-2">Manage</div>
      <div>
        {MANAGE.map((item) => (
          <NavItem key={item.href} {...item} onNavigate={onNavigate} />
        ))}
      </div>
      <div className="mt-auto pt-[14px] px-[13px] border-t border-[#463e36] flex items-center gap-[11px]">
        <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-[#d9b97e] to-[#b5904f] flex items-center justify-center text-[#2e2823] font-heading font-semibold flex-none">
          {initial}
        </div>
        <div className="leading-[1.2] flex-1 min-w-0">
          <div className="text-[12.5px] text-[#f6ede0] font-medium truncate">{adminName}</div>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="text-[11px] text-[#8a7d6e] hover:text-[#d9b97e] transition-colors disabled:opacity-60"
          >
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </div>
    </>
  );
}

export function AdminSidebar({ adminName }: { adminName: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between bg-[#2e2823] text-[#f6ede0] px-4 py-3">
        <span className="font-heading font-medium text-lg">Sakshi Admin</span>
        <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="p-1">
          <Menu size={22} />
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-10 w-[260px] bg-[#2e2823] text-[#cdbfae] p-[18px] flex flex-col h-full">
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="self-end p-1 text-[#cdbfae] mb-2"
            >
              <X size={20} />
            </button>
            <SidebarContent adminName={adminName} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex bg-[#2e2823] text-[#cdbfae] p-[18px] flex-col sticky top-0 h-screen">
        <SidebarContent adminName={adminName} />
      </aside>
    </>
  );
}

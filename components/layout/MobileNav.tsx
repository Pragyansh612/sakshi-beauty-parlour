'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/',         label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/gallery',  label: 'Gallery' },
  { href: '/about',    label: 'About' },
  { href: '/contact',  label: 'Contact' },
];

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
  onSignOut?: () => void;
  signingOut?: boolean;
}

export function MobileNav({ isOpen, onClose, pathname, onSignOut, signingOut }: MobileNavProps) {
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Drawer */}
          <motion.div
            className="fixed top-0 left-0 bottom-0 z-50 w-[300px] bg-[#FAF6EF] flex flex-col"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#e7dcc8]">
              <Link
                href="/"
                onClick={onClose}
                className="font-heading font-medium text-[22px] leading-[0.86] text-[#2e2823] no-underline"
              >
                Sakshi
                <small className="block font-body font-normal text-[7px] tracking-[0.42em] uppercase text-[#b5904f] mt-1">
                  Beauty Parlour
                </small>
              </Link>
              <button
                onClick={onClose}
                className="p-2 text-[#6b5f54] hover:text-[#2e2823]"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Links */}
            <nav className="flex-1 px-6 py-6">
              <ul className="space-y-1 list-none m-0 p-0">
                {navLinks.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={onClose}
                      className={cn(
                        'block py-3 text-[15px] font-medium no-underline border-b border-[#f0e9dc] transition-colors',
                        isActive(href)
                          ? 'text-[#b5904f]'
                          : 'text-[#2e2823] hover:text-[#b5904f]'
                      )}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Bottom CTAs */}
            <div className="px-6 pb-8 space-y-3">
              <a
                href="tel:+918962339467"
                className="block text-center text-[13px] text-[#6b5f54] no-underline py-2.5 border border-[#e7dcc8] rounded-[30px]"
              >
                ☎ <strong className="text-[#2e2823] font-medium">+91 89623 39467</strong>
              </a>
              <Link
                href="/book"
                onClick={onClose}
                className="block text-center bg-[#2e2823] text-[#f6ede0] rounded-[30px] px-6 py-3 font-body font-medium text-[13.5px] no-underline"
              >
                Book Appointment
              </Link>
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  disabled={signingOut}
                  className="block w-full text-center bg-transparent text-[#2e2823] border border-[#d8c6a6] rounded-[30px] px-6 py-3 font-body font-medium text-[13.5px] disabled:opacity-60"
                >
                  {signingOut ? 'Signing out…' : 'Sign out'}
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

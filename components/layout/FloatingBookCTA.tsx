'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function FloatingBookCTA() {
  const pathname = usePathname();
  // Don't show on the book page itself, or admin/dashboard routes
  if (pathname === '/book' || pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-6 right-5 z-40">
      <Link
        href="/book"
        className="inline-flex items-center justify-center bg-[#b5904f] text-white rounded-[30px] px-5 py-3 font-body font-medium text-[13px] no-underline shadow-[0_8px_28px_-8px_rgba(181,144,79,.7)]"
      >
        Book Now
      </Link>
    </div>
  );
}

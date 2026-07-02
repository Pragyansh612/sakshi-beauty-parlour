'use client';

import { useEffect, useState } from 'react';

interface Pill {
  href: string;
  label: string;
}

export function ServiceFilterPills({ pills }: { pills: Pill[] }) {
  const [active, setActive] = useState(pills[0]?.href ?? '');

  useEffect(() => {
    const elements = pills
      .map((p) => document.getElementById(p.href.slice(1)))
      .filter((el): el is HTMLElement => !!el);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const topMost = visible.reduce((a, b) => (a.boundingClientRect.top < b.boundingClientRect.top ? a : b));
        setActive(`#${topMost.target.id}`);
      },
      { rootMargin: '-96px 0px -60% 0px', threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pills]);

  return (
    <div className="max-w-[1240px] mx-auto px-6 md:px-11 pt-5 pb-8 flex flex-wrap gap-2.5 justify-center">
      {pills.map(({ href, label }) => (
        <a
          key={href}
          href={href}
          onClick={() => setActive(href)}
          className={`inline-flex items-center justify-center rounded-[30px] px-5 py-2.5 font-body font-medium text-[12.5px] no-underline transition-all ${
            active === href
              ? 'bg-[#b5904f] text-white hover:shadow-[0_12px_26px_-10px_rgba(181,144,79,.7)]'
              : 'bg-transparent text-[#2e2823] border border-[#d8c6a6] hover:border-[#b5904f] hover:text-[#b5904f]'
          }`}
        >
          {label}
        </a>
      ))}
    </div>
  );
}

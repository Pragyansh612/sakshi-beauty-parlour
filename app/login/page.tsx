import Link from 'next/link';
import { AuthPanel } from '@/components/auth/AuthPanel';

export default function LoginPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[1.05fr_1fr]">
      {/* LEFT: brand panel */}
      <div className="relative hidden md:flex flex-col justify-between overflow-hidden bg-[#2e2823] p-11 lg:p-[54px]">
        <div
          className="absolute inset-0 opacity-30"
          style={{ background: 'linear-gradient(150deg,#5a4636,#2e2823)', backgroundImage: 'repeating-linear-gradient(135deg,rgba(181,144,79,.08) 0 12px,transparent 12px 24px)' }}
        />
        <Link href="/" className="relative z-10 font-heading font-medium text-[25px] leading-[0.86] tracking-[0.01em] no-underline text-[#f6ede0]">
          Sakshi
          <small className="block font-body font-normal text-[8px] tracking-[0.42em] uppercase text-[#d9b97e] mt-1">
            Beauty Parlour
          </small>
        </Link>
        <div className="relative z-10">
          <div className="font-script text-[#d9b97e] text-[46px] leading-[0.8]">Welcome back</div>
          <h2 className="font-heading font-medium text-[38px] leading-[1.1] text-[#f6ede0] mt-3.5 max-w-[380px]">
            Your beauty journey, all in one place
          </h2>
          <p className="text-[#cdbfae] font-light text-[15px] leading-[1.7] mt-4 max-w-[380px]">
            Track appointments and bookings, reschedule with a tap, and pick up right where you left off.
          </p>
        </div>
        <div className="relative z-10 flex gap-6.5 text-[#cdbfae] font-light text-[13px]">
          <span>★ 4.9 rating</span>
          <span>600+ brides</span>
          <span>12 years</span>
        </div>
      </div>

      {/* RIGHT: forms */}
      <div className="flex items-center justify-center px-6 py-12 md:px-10">
        <AuthPanel />
      </div>
    </div>
  );
}

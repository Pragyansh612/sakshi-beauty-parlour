'use client';

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

export function ForgotPasswordForm({ onBackToLogin }: ForgotPasswordFormProps) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.32em] text-[#b5904f] mb-3">Reset password</p>
      <h1 className="font-heading font-medium text-[36px] leading-[1.05] text-[#2e2823] m-0">
        Forgot your <span className="font-script text-[#b5904f] text-[42px]">password?</span>
      </h1>
      <p className="text-[14px] font-light text-[#6b5f54] leading-[1.65] mt-3.5">
        Since we only use your phone number to sign in, there&apos;s no email to send a reset link to. Call or WhatsApp us and we&apos;ll verify your identity and reset your password directly.
      </p>

      <div className="flex flex-col gap-3 mt-6.5">
        <a
          href="tel:+918962339467"
          className="inline-flex items-center justify-center w-full bg-[#2e2823] text-[#f6ede0] rounded-[30px] px-6 py-[15px] font-body font-medium text-sm no-underline transition-all hover:-translate-y-px"
        >
          ☎ Call +91 89623 39467
        </a>
        <a
          href="https://wa.me/919179176965"
          target="_blank"
          rel="noopener noreferrer" 
          className="inline-flex items-center justify-center w-full bg-transparent text-[#2e2823] border border-[#d8c6a6] rounded-[30px] px-6 py-[15px] font-body font-medium text-sm no-underline transition-all hover:border-[#b5904f] hover:text-[#b5904f]"
        >
          WhatsApp us
        </a>
      </div>

      <p className="text-[13px] font-light text-[#6b5f54] text-center mt-5">
        <button type="button" onClick={onBackToLogin} className="text-[#b5904f] hover:underline">
          ← Back to sign in
        </button>
      </p>
    </div>
  );
}

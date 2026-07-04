'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/FormField';
import { PHONE_REGEX, normalizePhone } from '@/lib/phone-auth';

const schema = z.object({
  phone: z
    .string()
    .transform((v) => normalizePhone(v))
    .refine((v) => PHONE_REGEX.test(v), 'Enter a valid 10-digit mobile number'),
  password: z.string().min(1, 'Enter your password'),
});

type FormData = z.infer<typeof schema>;

interface LoginFormProps {
  onForgotPassword: () => void;
  onSwitchToRegister: () => void;
  redirectTo?: string;
}

export function LoginForm({ onForgotPassword, onSwitchToRegister, redirectTo }: LoginFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(data),
      });
      const result = (await res.json()) as { error?: string; role?: 'customer' | 'admin' };

      if (!res.ok) {
        toast.error(result.error ?? 'Sign in failed');
        return;
      }

      toast.success('Welcome back!');
      const destination =
        redirectTo ??
        (result.role === 'admin' ? '/admin/dashboard' : '/dashboard');
      router.push(destination);
      router.refresh();
    } catch {
      toast.error('Sign in failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.32em] text-[#b5904f] mb-3">Sign in</p>
      <h1 className="font-heading font-medium text-[36px] leading-[1.05] text-[#2e2823] m-0">
        Hello <span className="font-script text-[#b5904f] text-[42px]">again</span>
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 flex flex-col gap-4.5" noValidate>
        <FormField label="Phone number" htmlFor="phone" error={errors.phone?.message} required>
          <Input id="phone" type="tel" placeholder="98765 43210" {...register('phone')} />
        </FormField>

        <FormField label="Password" htmlFor="password" error={errors.password?.message} required>
          <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
        </FormField>

        <div className="text-right -mt-1">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-[12.5px] text-[#b5904f] hover:underline"
          >
            Forgot password?
          </button>
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full rounded-[30px]" size="lg">
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <div className="flex items-center gap-3.5 my-6">
        <div className="flex-1 h-px bg-[#e7dcc8]" />
        <span className="text-[11px] text-[#9b8e84] tracking-[0.1em]">OR</span>
        <div className="flex-1 h-px bg-[#e7dcc8]" />
      </div>

      <a
        href="https://wa.me/919179176965"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center w-full bg-transparent text-[#2e2823] border border-[#d8c6a6] rounded-[30px] px-6 py-[15px] font-body font-medium text-sm no-underline transition-all hover:border-[#b5904f] hover:text-[#b5904f]"
      >
        Continue with WhatsApp
      </a>

      <p className="text-[13px] font-light text-[#6b5f54] text-center mt-5">
        New here?{' '}
        <button type="button" onClick={onSwitchToRegister} className="text-[#b5904f] hover:underline">
          Create an account
        </button>
      </p>
    </div>
  );
}

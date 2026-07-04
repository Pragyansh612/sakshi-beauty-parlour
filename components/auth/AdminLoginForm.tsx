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

export function AdminLoginForm({ redirectTo }: { redirectTo: string }) {
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

      if (result.role !== 'admin') {
        await fetch('/api/auth/signout', { method: 'POST', credentials: 'same-origin' });
        toast.error("This account doesn't have admin access.");
        return;
      }

      toast.success('Welcome back.');
      router.push(redirectTo);
      router.refresh();
    } catch {
      toast.error('Sign in failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.32em] text-[#b5904f] mb-3">Admin sign in</p>
      <h1 className="font-heading font-medium text-[36px] leading-[1.05] text-[#2e2823] m-0">
        Sakshi <span className="font-script text-[#b5904f] text-[42px]">admin</span>
      </h1>
      <p className="text-[13.5px] font-light text-[#6b5f54] mt-3">
        Restricted access for salon staff. Customers should sign in from the main{' '}
        <a href="/login" className="text-[#b5904f] hover:underline">
          login page
        </a>
        .
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 flex flex-col gap-4.5" noValidate>
        <FormField label="Phone number" htmlFor="phone" error={errors.phone?.message} required>
          <Input id="phone" type="tel" placeholder="98765 43210" {...register('phone')} />
        </FormField>

        <FormField label="Password" htmlFor="password" error={errors.password?.message} required>
          <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
        </FormField>

        <Button type="submit" disabled={isSubmitting} className="w-full rounded-[30px]" size="lg">
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </div>
  );
}

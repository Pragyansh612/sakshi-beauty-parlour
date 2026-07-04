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
  full_name: z.string().min(2, 'Enter your full name'),
  phone: z
    .string()
    .transform((v) => normalizePhone(v))
    .refine((v) => PHONE_REGEX.test(v), 'Enter a valid 10-digit mobile number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  redirectTo?: string;
}

export function RegisterForm({ onSwitchToLogin, redirectTo }: RegisterFormProps) {
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
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(data),
      });
      const result = (await res.json()) as { error?: string };

      if (!res.ok) {
        toast.error(result.error ?? 'Registration failed');
        return;
      }

      toast.success('Account created! Welcome to Sakshi Beauty Parlour.');
      router.push(redirectTo ?? '/dashboard');
      router.refresh();
    } catch {
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.32em] text-[#b5904f] mb-3">Create account</p>
      <h1 className="font-heading font-medium text-[36px] leading-[1.05] text-[#2e2823] m-0">
        Join <span className="font-script text-[#b5904f] text-[42px]">Sakshi</span>
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 flex flex-col gap-4" noValidate>
        <FormField label="Full name" htmlFor="full_name" error={errors.full_name?.message} required>
          <Input id="full_name" placeholder="Your name" {...register('full_name')} />
        </FormField>

        <FormField label="Phone number" htmlFor="phone" error={errors.phone?.message} required>
          <Input id="phone" type="tel" placeholder="98765 43210" {...register('phone')} />
        </FormField>

        <FormField label="Password" htmlFor="password" error={errors.password?.message} required>
          <Input id="password" type="password" placeholder="Create a password" {...register('password')} />
        </FormField>

        <Button type="submit" disabled={isSubmitting} className="w-full rounded-[30px] mt-1" size="lg">
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className="text-[13px] font-light text-[#6b5f54] text-center mt-5">
        Already have an account?{' '}
        <button type="button" onClick={onSwitchToLogin} className="text-[#b5904f] hover:underline">
          Sign in
        </button>
      </p>
    </div>
  );
}

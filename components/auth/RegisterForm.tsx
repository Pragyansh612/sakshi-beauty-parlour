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
import { createClient } from '@/lib/supabase/client';

const schema = z.object({
  full_name: z.string().min(2, 'Enter your full name'),
  phone: z.string().regex(/^\+?[6-9]\d{9}$/, 'Enter a valid Indian mobile number'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    const supabase = createClient();
    const { data: signUpData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
          phone: data.phone,
        },
      },
    });
    setIsSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    if (signUpData.session) {
      toast.success('Account created! Welcome to Sakshi Beauty Parlour.');
      router.push('/dashboard');
      router.refresh();
    } else {
      toast.success('Account created! Check your email to confirm before signing in.');
      onSwitchToLogin();
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
          <Input id="phone" type="tel" placeholder="+91 98765 43210" {...register('phone')} />
        </FormField>

        <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
          <Input id="email" type="email" placeholder="you@email.com" {...register('email')} />
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

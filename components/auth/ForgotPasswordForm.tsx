'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/FormField';
import { createClient } from '@/lib/supabase/client';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
});

type FormData = z.infer<typeof schema>;

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

export function ForgotPasswordForm({ onBackToLogin }: ForgotPasswordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/login`,
    });
    setIsSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success('Reset link sent! Check your email.');
    onBackToLogin();
  };

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.32em] text-[#b5904f] mb-3">Reset password</p>
      <h1 className="font-heading font-medium text-[36px] leading-[1.05] text-[#2e2823] m-0">
        Forgot your <span className="font-script text-[#b5904f] text-[42px]">password?</span>
      </h1>
      <p className="text-[14px] font-light text-[#6b5f54] leading-[1.65] mt-3.5">
        Enter your registered email and we&apos;ll send a reset link.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6.5 flex flex-col gap-4.5" noValidate>
        <FormField label="Email address" htmlFor="email" error={errors.email?.message} required>
          <Input id="email" type="email" placeholder="you@email.com" {...register('email')} />
        </FormField>

        <Button type="submit" disabled={isSubmitting} className="w-full rounded-[30px]" size="lg">
          {isSubmitting ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>

      <p className="text-[13px] font-light text-[#6b5f54] text-center mt-5">
        <button type="button" onClick={onBackToLogin} className="text-[#b5904f] hover:underline">
          ← Back to sign in
        </button>
      </p>
    </div>
  );
}

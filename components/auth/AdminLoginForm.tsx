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
import { getUserRole } from '@/lib/supabase/auth-helpers';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
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
    const supabase = createClient();
    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setIsSubmitting(false);
      toast.error(error.message);
      return;
    }

    const role = signInData.user ? await getUserRole(supabase, signInData.user.id) : null;

    if (role !== 'admin') {
      await supabase.auth.signOut();
      setIsSubmitting(false);
      toast.error("This account doesn't have admin access.");
      return;
    }

    setIsSubmitting(false);
    toast.success('Welcome back.');
    router.push(redirectTo);
    router.refresh();
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
        <FormField label="Email address" htmlFor="email" error={errors.email?.message} required>
          <Input id="email" type="email" placeholder="admin@sakshibeautyparlour.in" {...register('email')} />
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

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/forms/FormField';
import { submitContactForm } from '@/actions/contact';

const schema = z.object({
  name: z.string().min(2, 'Enter your name'),
  phone: z
    .string()
    .regex(/^\+?[6-9]\d{9}$/, 'Enter a valid Indian mobile number'),
  service_interest: z.string().optional(),
  message: z.string().min(10, 'Please write at least 10 characters'),
});

type FormData = z.infer<typeof schema>;

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const result = await submitContactForm(data);
      if (result.success) {
        toast.success("Message sent! We'll be in touch within 24 hours.");
        reset();
      } else {
        toast.error(result.error ?? 'Something went wrong. Please try again.');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <FormField label="Your name" htmlFor="name" error={errors.name?.message} required>
        <Input
          id="name"
          placeholder="Priya Sharma"
          {...register('name')}
        />
      </FormField>

      <FormField label="Phone number" htmlFor="phone" error={errors.phone?.message} required>
        <Input
          id="phone"
          type="tel"
          placeholder="+91 98765 43210"
          {...register('phone')}
        />
      </FormField>

      <FormField label="Service interest" htmlFor="service_interest" error={errors.service_interest?.message}>
        <Input
          id="service_interest"
          placeholder="e.g. Bridal makeup, facial, hair…"
          {...register('service_interest')}
        />
      </FormField>

      <FormField label="Your message" htmlFor="message" error={errors.message?.message} required>
        <Textarea
          id="message"
          placeholder="Tell us what you're looking for or any questions you have…"
          rows={4}
          {...register('message')}
        />
      </FormField>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-[30px]"
        size="lg"
      >
        {isSubmitting ? 'Sending…' : 'Send message'}
      </Button>
    </form>
  );
}

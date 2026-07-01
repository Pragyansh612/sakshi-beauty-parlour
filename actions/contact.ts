'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const ContactFormSchema = z.object({
  name: z.string().min(2, 'Enter your name'),
  phone: z
    .string()
    .regex(/^\+?[6-9]\d{9}$/, 'Enter a valid Indian mobile number (10 digits starting with 6–9)'),
  service_interest: z.string().optional(),
  message: z.string().min(10, 'Please write a brief message (min 10 characters)'),
});

export type ContactFormData = z.infer<typeof ContactFormSchema>;

export async function submitContactForm(
  data: ContactFormData
): Promise<{ success: boolean; error?: string }> {
  const parsed = ContactFormSchema.safeParse(data);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? 'Validation failed';
    return { success: false, error: firstError };
  }

  const supabase = await createClient();

  const { error } = await supabase.from('contact_messages').insert({
    name: parsed.data.name,
    phone: parsed.data.phone,
    service_interest: parsed.data.service_interest ?? null,
    message: parsed.data.message,
  });

  if (error) {
    console.error('Contact form insert error:', error.message);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }

  return { success: true };
}

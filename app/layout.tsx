import type { Metadata } from 'next';
import { Cormorant_Garamond, Dancing_Script, Jost } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

const dancing = Dancing_Script({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dancing',
  display: 'swap',
});

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-jost',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Sakshi Beauty Parlour — Sagar',
    template: '%s | Sakshi Beauty Parlour',
  },
  description:
    'Premium beauty parlour & bridal studio in Sagar. Expert hair care, skin treatments, bridal makeup, and beauty services for every occasion.',
  keywords: [
    'beauty parlour sagar',
    'bridal makeup sagar',
    'hair salon sagar',
    'sakshi beauty parlour',
    'facial sagar',
    'threading sagar',
  ],
  openGraph: {
    title: 'Sakshi Beauty Parlour — Sagar',  
    description:
      'Premium beauty parlour & bridal studio in Sagar. 12+ years, 600+ brides, 4.9★.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dancing.variable} ${jost.variable}`}>
      <body>
        {children}
        <Toaster position="bottom-right" richColors duration={4000} />
      </body>
    </html>
  );
}

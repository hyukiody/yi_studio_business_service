import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'YI Studio Business Service',
  description: 'Professional web services and technology portfolio',
  openGraph: {
    title: 'YI Studio - Professional Development Services',
    description: 'Expert technology consulting and web development',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 antialiased">
        <Header 
          title="YI Studio"
          subtitle="Development Service"
          showLogo={true}
        />
        {children}
      </body>
    </html>
  );
}

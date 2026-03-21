'use client';

import { Header } from '@/components/layout/Header';
import { MainLayout } from '@/components/layout/MainLayout';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';

export default function HomePage() {
  return (
    <>
      <Header title="YI Studio Business Service">
        <nav className="flex gap-6">
          <a href="/about" className="text-gray-600 hover:text-gray-900">
            About
          </a>
          <a href="/portfolio" className="text-gray-600 hover:text-gray-900">
            Portfolio
          </a>
          <a href="/stack" className="text-gray-600 hover:text-gray-900">
            Stack
          </a>
          <a href="/feed" className="text-gray-600 hover:text-gray-900">
            News
          </a>
        </nav>
      </Header>

      <MainLayout>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-4">
              Engineering Excellence & Data Privacy
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Building scalable, maintainable systems with S.O.L.I.D. principles
              and zero-trust privacy architecture.
            </p>
            <div className="flex gap-4">
              <WhatsAppButton phoneNumber="+1234567890" />
              <a
                href="/contact"
                className="px-6 py-3 border-2 border-gray-900 text-gray-900 font-semibold rounded-lg hover:bg-gray-900 hover:text-white transition-colors"
              >
                Get in Touch
              </a>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg h-96"></div>
        </div>
      </MainLayout>
    </>
  );
}

import { Header } from '@/components/layout/Header';
import { MainLayout } from '@/components/layout/MainLayout';

export default function ContactPage() {
  return (
    <>
      <Header title="Get in Touch" />
      <MainLayout>
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
          <p className="text-gray-600 mb-8">
            Have a question or proposal? We'd love to hear from you.
          </p>
          {/* Contact form component will be added here */}
        </div>
      </MainLayout>
    </>
  );
}

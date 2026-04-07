import { ContactForm } from '@/components/forms/ContactForm';
import { Header } from '@/components/layout/Header';
import { MainLayout } from '@/components/layout/MainLayout';

export default function ContactPage() {
  return (
    <>
      <Header title="Get in Touch" />
      <MainLayout>
        <div className="max-w-2xl flex flex-col items-center mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-[#E87A00]">Contact Us</h1>
          <p className="text-gray-700 mb-8 text-center max-w-md">
            Have a question or proposal? We'd love to hear from you.
            Our team typically responds within 24 hours.
          </p>
          
          <ContactForm />
        </div>
      </MainLayout>
    </>
  );
}

import { Header } from '@/components/layout/Header';
import { MainLayout } from '@/components/layout/MainLayout';

export default function AboutPage() {
  return (
    <>
      <Header title="About" />
      <MainLayout>
        <div>
          <h1 className="text-3xl font-bold mb-6">About YI Studio</h1>
          <p className="text-gray-600 mb-8">
            Engineering excellence through architectural rigor and data privacy.
          </p>
          {/* About content will be added here */}
        </div>
      </MainLayout>
    </>
  );
}

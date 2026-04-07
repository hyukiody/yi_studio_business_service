import { Header } from '@/components/layout/Header';
import { MainLayout } from '@/components/layout/MainLayout';

export default function StackPage() {
  return (
    <>
      <Header title="Tech Stack" />
      <MainLayout>
        <div>
          <h1 className="text-3xl font-bold mb-6">Technology Stack</h1>
          <p className="text-gray-600 mb-8">
            Modern technologies and frameworks chosen for production reliability.
          </p>
          {/* Tech stack details will be added here */}
        </div>
      </MainLayout>
    </>
  );
}

import { Header } from '@/components/layout/Header';
import { MainLayout } from '@/components/layout/MainLayout';

export default function PortfolioPage() {
  return (
    <>
      <Header title="Portfolio" />
      <MainLayout>
        <div>
          <h1 className="text-3xl font-bold mb-6">Project Portfolio</h1>
          <p className="text-gray-600 mb-8">
            A collection of projects built with engineering rigor and architectural excellence.
          </p>
          {/* Portfolio grid will be added here */}
        </div>
      </MainLayout>
    </>
  );
}

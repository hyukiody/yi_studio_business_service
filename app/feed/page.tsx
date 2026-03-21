import { Header } from '@/components/layout/Header';
import { MainLayout } from '@/components/layout/MainLayout';

export default function FeedPage() {
  return (
    <>
      <Header title="News & Updates" />
      <MainLayout>
        <div>
          <h1 className="text-3xl font-bold mb-6">News Feed</h1>
          <p className="text-gray-600 mb-8">
            Latest updates, insights, and technical articles.
          </p>
          {/* Feed content will be added here */}
        </div>
      </MainLayout>
    </>
  );
}

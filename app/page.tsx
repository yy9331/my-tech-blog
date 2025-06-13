import PostList from '@/components/post-list';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 pt-[66px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PostList />
      </div>
    </main>
  );
}
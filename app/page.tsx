import AutoMultiIndicators from '@/components/AutoMultiIndicators';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Strategy Creator System</h1>
        <AutoMultiIndicators />
      </div>
    </main>
  );
}

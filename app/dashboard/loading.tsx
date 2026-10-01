export default function Loading() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white/70 font-semibold">Loading Dashboard...</p>
      </div>
    </main>
  );
}

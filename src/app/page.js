export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-3xl font-bold mb-6">Nexus Game</h1>
      <a
        href="/2048"
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl shadow-xl transition"
      >
        Try it
      </a>
    </main>
  );
}

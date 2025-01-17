import YearSelector from "@/components/YearSelector";
import YearList from "@/components/YearList";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-4xl font-bold mb-8">Zakat Registry</h1>
      <div className="w-full max-w-md mb-12">
        <YearSelector />
      </div>
      <YearList />
    </main>
  );
}

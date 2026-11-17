import Dashboard from "@/components/Dashboard";
import { getInvestigations } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getInvestigations();
  return (
    <main className="min-h-screen">
      <Dashboard data={data} />
    </main>
  );
}

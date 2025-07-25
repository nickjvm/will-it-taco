import Home from "@/components/Home";
import serverFetch from "@/lib/serverFetch";
import { InspirationResponse } from "@/services/tacoService";

export default async function Page() {
  const inspirationData = await serverFetch<InspirationResponse[]>(
    "/food/inspiration"
  );
  return <Home inspirationData={inspirationData} />;
}

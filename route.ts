import { getInvestigations } from "@/lib/data";
import { rankAll, DEFAULT_WEIGHTS } from "@/lib/scoring";
import { ENVIRONMENTS, type EnvKey } from "@/lib/knowledge";

export const dynamic = "force-dynamic";

/**
 * GET /api/investigations?env=lunar,mars&q=smoke&category=Smoke%20%26%20soot
 *   &wHabitat=40&wModeling=25&wControls=25&wEarth=10
 * Returns investigations ranked with the dashboard scoring engine.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const valid = ENVIRONMENTS.map((e) => e.key as string);
  const envs = (url.searchParams.get("env") ?? "")
    .split(",")
    .filter((e) => valid.includes(e)) as EnvKey[];
  const num = (k: string, d: number) => {
    const v = Number(url.searchParams.get(k));
    return url.searchParams.has(k) && Number.isFinite(v) && v >= 0 ? v : d;
  };
  const weights = {
    habitat: num("wHabitat", DEFAULT_WEIGHTS.habitat),
    modeling: num("wModeling", DEFAULT_WEIGHTS.modeling),
    controls: num("wControls", DEFAULT_WEIGHTS.controls),
    earth: num("wEarth", DEFAULT_WEIGHTS.earth),
  };
  const q = (url.searchParams.get("q") ?? "").toLowerCase();
  const category = url.searchParams.get("category");

  let list = await getInvestigations();
  if (category) list = list.filter((i) => i.category === category);
  if (q) {
    list = list.filter((i) =>
      [i.acronym, i.title, i.summary, i.fuels.join(" "), i.modelingData.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }
  const ranked = rankAll(list, envs, weights).map((r) => ({
    rank: r.rank,
    slug: r.inv.slug,
    acronym: r.inv.acronym,
    title: r.inv.title,
    category: r.inv.category,
    composite: Math.round(r.composite),
    habitat: Math.round(r.habitat),
    modeling: r.modeling,
    controls: r.controls,
    earth: r.earth,
  }));
  return Response.json({ environments: envs, weights, count: ranked.length, results: ranked });
}

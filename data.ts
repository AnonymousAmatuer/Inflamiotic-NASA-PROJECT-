import { seedInvestigations, type Investigation } from "@/lib/seed-data";

/** Investigation data is bundled with the site, so no database is needed. */
export async function getInvestigations(): Promise<Investigation[]> {
  return seedInvestigations;
}

export async function getInvestigation(slug: string): Promise<Investigation | null> {
  return seedInvestigations.find((investigation) => investigation.slug === slug) ?? null;
}

import type { Investigation } from "@/lib/seed-data";
import { ENVIRONMENTS, type EnvKey, type Environment } from "./knowledge";

export interface Weights {
  habitat: number;
  modeling: number;
  controls: number;
  earth: number;
}

export const DEFAULT_WEIGHTS: Weights = { habitat: 40, modeling: 25, controls: 25, earth: 10 };

function overlapFrac(aMin: number, aMax: number, bMin: number, bMax: number): number {
  const lo = Math.max(aMin, bMin);
  const hi = Math.min(aMax, bMax);
  if (hi < lo) return 0;
  const range = bMax - bMin;
  if (range <= 0) return 1;
  const frac = (hi - lo) / range;
  return frac === 0 ? 0.2 : Math.min(1, frac);
}

export function atmosphereFit(inv: Investigation, env: Environment): number {
  const o2 = overlapFrac(inv.o2Min, inv.o2Max, env.o2[0], env.o2[1]);
  const p = overlapFrac(inv.pMin, inv.pMax, env.p[0], env.p[1]);
  return 0.5 * o2 + 0.5 * p;
}

export function gravityFit(inv: Investigation, env: Environment): number {
  const g = inv.gravity;
  if (env.gravity === "partial") {
    if (g === "partial" || g === "micro+partial") return 1;
    if (g === "micro") return 0.5; // conservative bounding case
    return 0.4;
  }
  if (g === "micro" || g === "micro+partial") return 1;
  if (g === "normal") return 0.4;
  return 0.3;
}

export function curatedEnvScore(inv: Investigation, key: EnvKey): number {
  switch (key) {
    case "spacecraft":
      return inv.scoreSpacecraft;
    case "station":
      return inv.scoreStation;
    case "lunar":
      return inv.scoreLunar;
    case "mars":
      return inv.scoreMars;
    case "rover":
      return inv.scoreRover;
  }
}

export interface EnvBreakdown {
  env: EnvKey;
  curated: number;
  atmosphere: number;
  gravity: number;
  score: number; // 0-100
}

export function envBreakdown(inv: Investigation, env: Environment): EnvBreakdown {
  const curated = curatedEnvScore(inv, env.key);
  const atmosphere = atmosphereFit(inv, env);
  const gravity = gravityFit(inv, env);
  const score = 100 * (0.6 * (curated / 10) + 0.25 * atmosphere + 0.15 * gravity);
  return { env: env.key, curated, atmosphere, gravity, score };
}

export interface Ranked {
  inv: Investigation;
  habitat: number;
  modeling: number;
  controls: number;
  earth: number;
  composite: number;
  breakdowns: EnvBreakdown[];
  rank: number;
}

export function scoreInvestigation(
  inv: Investigation,
  envKeys: EnvKey[],
  w: Weights,
): Omit<Ranked, "rank"> {
  const envs = ENVIRONMENTS.filter((e) => envKeys.includes(e.key));
  const useEnvs = envs.length ? envs : ENVIRONMENTS;
  const breakdowns = useEnvs.map((e) => envBreakdown(inv, e));
  const habitat = breakdowns.reduce((a, b) => a + b.score, 0) / breakdowns.length;
  const modeling = inv.scoreModeling * 10;
  const controls = inv.scoreControls * 10;
  const earth = inv.scoreEarth * 10;
  const total = w.habitat + w.modeling + w.controls + w.earth || 1;
  const composite =
    (habitat * w.habitat + modeling * w.modeling + controls * w.controls + earth * w.earth) / total;
  return { inv, habitat, modeling, controls, earth, composite, breakdowns };
}

export function rankAll(list: Investigation[], envKeys: EnvKey[], w: Weights): Ranked[] {
  return list
    .map((i) => scoreInvestigation(i, envKeys, w))
    .sort((a, b) => b.composite - a.composite)
    .map((r, i) => ({ ...r, rank: i + 1 }));
}

export function explain(r: Omit<Ranked, "rank"> | Ranked, w: Weights, envKeys: EnvKey[]): string[] {
  const total = w.habitat + w.modeling + w.controls + w.earth || 1;
  const parts = [
    { k: "habitat fit", v: (r.habitat * w.habitat) / total },
    { k: "modeling value", v: (r.modeling * w.modeling) / total },
    { k: "controls & equipment value", v: (r.controls * w.controls) / total },
    { k: "Earth transfer", v: (r.earth * w.earth) / total },
  ].sort((a, b) => b.v - a.v);
  const out: string[] = [];
  out.push(
    `Scores ${r.composite.toFixed(0)}/100. Largest contributors: ${parts[0].k} and ${parts[1].k}.`,
  );
  const envs = ENVIRONMENTS.filter((e) => (envKeys.length ? envKeys.includes(e.key) : true));
  const best = [...r.breakdowns].sort((a, b) => b.score - a.score)[0];
  const bestEnv = envs.find((e) => e.key === best.env);
  if (bestEnv) {
    out.push(
      `Best habitat match: ${bestEnv.label} (${best.score.toFixed(0)}/100), with ${(best.atmosphere * 100).toFixed(0)}% atmosphere overlap and ${(best.gravity * 100).toFixed(0)}% gravity match.`,
    );
  }
  const weak = [...r.breakdowns].sort((a, b) => a.gravity - b.gravity)[0];
  if (weak && weak.gravity < 0.9) {
    const e = ENVIRONMENTS.find((x) => x.key === weak.env);
    out.push(
      `Caveat: gravity coverage is partial for ${e?.label ?? "this environment"}. Treat results as a bounding case, not direct evidence.`,
    );
  }
  return out;
}

export interface Gap {
  env: Environment;
  directCount: number;
  strongest: Investigation | null;
  message: string;
}

export function coverageGaps(list: Investigation[]): Gap[] {
  return ENVIRONMENTS.map((env) => {
    const direct = list.filter((i) => atmosphereFit(i, env) >= 0.5 && gravityFit(i, env) >= 0.9);
    const strongest =
      [...list].sort((a, b) => envBreakdown(b, env).score - envBreakdown(a, env).score)[0] ?? null;
    const message =
      direct.length === 0
        ? `No catalogued investigation tested at both the ${env.gLabel} gravity and cabin atmosphere of a ${env.label.toLowerCase()}.`
        : direct.length <= 2
          ? `Only ${direct.length} investigation${direct.length === 1 ? "" : "s"} directly match ${env.label.toLowerCase()} conditions. Evidence is thin.`
          : `${direct.length} investigations directly match ${env.label.toLowerCase()} conditions.`;
    return { env, directCount: direct.length, strongest, message };
  });
}

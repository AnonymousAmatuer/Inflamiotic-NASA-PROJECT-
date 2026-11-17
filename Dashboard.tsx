"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Investigation } from "@/lib/seed-data";
import {
  ENVIRONMENTS,
  INCIDENTS,
  MODELING_DATA_DESCRIPTIONS,
  SPINOFFS,
  type EnvKey,
} from "@/lib/knowledge";
import {
  DEFAULT_WEIGHTS,
  coverageGaps,
  explain,
  rankAll,
  type Ranked,
  type Weights,
} from "@/lib/scoring";
import AtmosphereMap from "./AtmosphereMap";
import { Card, Chip, ScoreBar, fmtRange, gravityLabel } from "./ui";
import { EVIDENCE_NOTES, NASA_FILES, RECENT_EVIDENCE, VERIFIED_FINDINGS } from "@/lib/recent-evidence";
import FuelsExplorer from "./FuelsExplorer";

type Tab = "rank" | "modeling" | "controls" | "earth" | "lessons" | "fuels" | "evidence" | "map";

const TABS: { key: Tab; label: string; hint: string }[] = [
  { key: "rank", label: "Habitat ranking", hint: "Which investigations matter most for crewed environments" },
  { key: "modeling", label: "Modeling data", hint: "Data that supports flammability and fire-scenario models" },
  { key: "controls", label: "Controls & equipment", hint: "Research behind detectors, suppressants and flame control" },
  { key: "earth", label: "Earth applications", hint: "Where space fire research helps on the ground" },
  { key: "lessons", label: "Lessons learned", hint: "Historic fires and the research that addresses them" },
  { key: "fuels", label: "Fuels & flammability", hint: "Explore recorded test results by NASA study and fuel" },
  { key: "evidence", label: "New evidence", hint: "Selected measurements from the NASA files recently added to this project" },
  { key: "map", label: "Coverage map", hint: "Where the evidence does and does not reach" },
];

const CONTROL_GROUPS: Record<string, string> = {
  "Smoke & soot": "Detection & early warning",
  Smoldering: "Detection & early warning",
  "Droplet combustion & suppression": "Suppression",
  "Suppression technology": "Suppression",
  "Flame control": "Active flame control",
  "Material screening": "Materials & atmosphere selection",
  "Solid flame spread": "Materials & atmosphere selection",
  "Gas-phase flames": "Fundamentals feeding design criteria",
};

function downloadCsv(rows: Investigation[]) {
  const head = [
    "slug", "acronym", "title", "platform", "era", "category", "gravity",
    "o2_min_pct", "o2_max_pct", "pressure_min_kPa", "pressure_max_kPa",
    "flow_min_cm_s", "flow_max_cm_s", "modeling_score_0_10", "data_types",
  ];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map((i) =>
    [
      i.slug, i.acronym, i.title, i.platform, i.era, i.category, i.gravity,
      i.o2Min, i.o2Max, i.pMin, i.pMax, i.flowMin, i.flowMax, i.scoreModeling,
      i.modelingData.join("; "),
    ].map(esc).join(","),
  );
  const blob = new Blob([[head.join(","), ...lines].join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "combustion-modeling-data-index.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function Dashboard({ data }: { data: Investigation[] }) {
  const [tab, setTab] = useState<Tab>("rank");
  const [envs, setEnvs] = useState<EnvKey[]>(["lunar", "mars", "rover"]);
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [types, setTypes] = useState<string[]>([]);
  const [open, setOpen] = useState<string | null>(null);

  const categories = useMemo(() => ["All", ...Array.from(new Set(data.map((d) => d.category)))], [data]);
  const allTypes = useMemo(() => {
    const m = new Map<string, number>();
    data.forEach((d) => d.modelingData.forEach((t) => m.set(t, (m.get(t) ?? 0) + 1)));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.filter((d) => {
      if (category !== "All" && d.category !== category) return false;
      if (!q) return true;
      return [d.acronym, d.title, d.summary, d.fuels.join(" "), d.platform, d.modelingData.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [data, query, category]);

  const ranked = useMemo(() => rankAll(filtered, envs, weights), [filtered, envs, weights]);
  const gaps = useMemo(() => coverageGaps(data), [data]);
  const selectedGaps = gaps.filter((g) => envs.length === 0 || envs.includes(g.env.key));
  const envLabel = envs.length === 0 || envs.length === ENVIRONMENTS.length
    ? "all crew environments"
    : ENVIRONMENTS.filter((e) => envs.includes(e.key)).map((e) => e.short).join(", ");

  const toggleEnv = (k: EnvKey) =>
    setEnvs((cur) => (cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k]));
  const setW = (k: keyof Weights, v: number) => setWeights((w) => ({ ...w, [k]: v }));

  const modelingList = useMemo(() => {
    const list = ranked.filter((r) => types.length === 0 || types.every((t) => r.inv.modelingData.includes(t)));
    return [...list].sort((a, b) => b.inv.scoreModeling - a.inv.scoreModeling || b.habitat - a.habitat);
  }, [ranked, types]);

  const controlsGrouped = useMemo(() => {
    const groups = new Map<string, Ranked[]>();
    [...ranked]
      .sort((a, b) => b.inv.scoreControls - a.inv.scoreControls)
      .forEach((r) => {
        const g = CONTROL_GROUPS[r.inv.category] ?? "Other";
        groups.set(g, [...(groups.get(g) ?? []), r]);
      });
    return [...groups.entries()].sort(
      (a, b) => Math.max(...b[1].map((x) => x.inv.scoreControls)) - Math.max(...a[1].map((x) => x.inv.scoreControls)),
    );
  }, [ranked]);

  const earthList = useMemo(
    () => [...ranked].sort((a, b) => b.inv.scoreEarth - a.inv.scoreEarth),
    [ranked],
  );

  const top = ranked[0];
  const bestModel = [...ranked].sort((a, b) => b.inv.scoreModeling - a.inv.scoreModeling)[0];
  const bestControl = [...ranked].sort((a, b) => b.inv.scoreControls - a.inv.scoreControls)[0];
  const bestEarth = [...ranked].sort((a, b) => b.inv.scoreEarth - a.inv.scoreEarth)[0];

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
      {/* HERO */}
      <header className="relative mt-7 overflow-hidden rounded-[1.75rem] border border-slate-800/90 bg-[#0d1217] px-5 py-7 sm:px-8 sm:py-9">
        <div className="relative -mx-2 -mt-3 mb-3 sm:-mx-4 sm:-mt-5">
          <Image
            src="/brand/inflamiotic-logo.jpeg"
            alt="Inflamiotic logo: a spacecraft over Earth with the words Making Space Safer"
            width={1408}
            height={768}
            priority
            className="mx-auto h-auto w-full max-w-[560px] mix-blend-screen"
          />
        </div>
        
        <h1 className="relative mt-3 max-w-3xl font-serif text-3xl font-medium leading-tight tracking-tight text-[#f3eee5] sm:text-5xl">
          INFLAMIOTIC
        </h1>
        <p className="relative mt-4 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
          A working guide to NASA&apos;s combustion experiments: what they tested, what the data shows, and where it may matter for future crews.
        </p>
        <div className="relative mt-7 grid grid-cols-2 border-t border-slate-800 pt-4 sm:grid-cols-4">
          {[
            ["Investigations", String(data.length)],
            ["Platforms", String(new Set(data.map((d) => d.platform)).size)],
            ["Data types indexed", String(allTypes.length)],
            ["Environments scored", String(ENVIRONMENTS.length)],
          ].map(([k, v]) => (
            <div key={k} className="border-l border-slate-800 px-3 py-2 first:border-l-0 sm:px-5">
              <div className="font-serif text-2xl text-[#f3eee5]">{v}</div>
              <div className="mt-0.5 text-[11px] uppercase tracking-wider text-slate-500">{k}</div>
            </div>
          ))}
        </div>
      </header>

      {/* MISSION LENS */}
      <section aria-label="Mission lens" className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">1 · Choose crew environments</h2>
            <button
              className="text-xs text-slate-400 hover:text-orange-300"
              onClick={() => setEnvs(ENVIRONMENTS.map((e) => e.key))}
            >
              Select all
            </button>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {ENVIRONMENTS.map((e) => {
              const on = envs.includes(e.key);
              return (
                <button
                  key={e.key}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleEnv(e.key)}
                  className={`rounded-xl border p-3 text-left transition ${
                    on ? "border-orange-400/70 bg-orange-500/10" : "border-slate-800 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: e.color }} />
                    <span className="text-sm font-medium text-white">{e.label}</span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400">
                    {fmtRange(e.o2[0], e.o2[1], "% O₂")} · {fmtRange(e.p[0], e.p[1], "kPa")} · {e.gLabel}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
        <Card>
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">2 · Set priorities</h2>
            <button className="text-xs text-slate-400 hover:text-orange-300" onClick={() => setWeights(DEFAULT_WEIGHTS)}>
              Reset
            </button>
          </div>
          <div className="mt-3 space-y-3">
            {(
              [
                ["habitat", "Habitat relevance (atmosphere, gravity, scenario fit)"],
                ["modeling", "Predictive-modeling data value"],
                ["controls", "Controls & equipment value"],
                ["earth", "Earth application potential"],
              ] as [keyof Weights, string][]
            ).map(([k, label]) => (
              <label key={k} className="block">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>{label}</span>
                  <span className="tabular-nums text-orange-300">{weights[k]}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={weights[k]}
                  onChange={(e) => setW(k, Number(e.target.value))}
                  className="mt-1 w-full accent-orange-400"
                />
              </label>
            ))}
          </div>
        </Card>
      </section>

      {/* BRIEFING */}
      {top && (
        <section aria-label="Briefing" className="mt-4 grid gap-4 md:grid-cols-4">
          {[
            ["Top pick for " + envLabel, top.inv, `${top.composite.toFixed(0)}/100 composite`],
            ["Most valuable for models", bestModel?.inv, `${bestModel?.inv.scoreModeling}/10 modeling value`],
            ["Most valuable for controls", bestControl?.inv, `${bestControl?.inv.scoreControls}/10 controls value`],
            ["Strongest Earth transfer", bestEarth?.inv, `${bestEarth?.inv.scoreEarth}/10 Earth value`],
          ].map(([label, inv, sub]) => {
            const i = inv as Investigation;
            return (
              <Link
                key={String(label)}
                href={`/investigation/${i.slug}`}
                className="group rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/40 p-4 transition hover:border-orange-400/60"
              >
                <div className="text-[11px] uppercase tracking-wider text-slate-500">{String(label)}</div>
                <div className="mt-1 text-lg font-semibold text-white group-hover:text-orange-200">{i.acronym}</div>
                <div className="line-clamp-2 text-xs text-slate-400">{i.title}</div>
                <div className="mt-2 text-xs text-orange-300">{String(sub)}</div>
              </Link>
            );
          })}
        </section>
      )}

      {/* TABS */}
      <nav className="mt-8 flex gap-1 overflow-x-auto border-b border-slate-800" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm transition ${
              tab === t.key
                ? "border-orange-400 text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <p className="mt-3 text-sm text-slate-400">{TABS.find((t) => t.key === tab)?.hint}</p>

      {/* FILTER BAR */}
      {tab !== "lessons" && tab !== "map" && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search fuels, platforms, data types…"
            aria-label="Search investigations"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none sm:w-72"
          />
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
                {c}
              </Chip>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5">
        {/* RANKING */}
        {tab === "rank" && (
          <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
            <ol className="space-y-3">
              {ranked.length === 0 && <Card>No investigations match your filters.</Card>}
              {ranked.map((r) => (
                <li key={r.inv.slug}>
                  <Card className="transition hover:border-slate-600">
                    <div className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-sm font-semibold text-orange-300">
                        {r.rank}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <h3 className="text-lg font-semibold text-white">{r.inv.acronym}</h3>
                          <Chip tone="sky">{r.inv.category}</Chip>
                          <span className="text-xs text-slate-500">
                            {r.inv.platform} · {r.inv.era}
                          </span>
                        </div>
                        <p className="mt-0.5 text-sm text-slate-400">{r.inv.title}</p>
                        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
                          <ScoreBar label="Composite" value={r.composite} color="#fb923c" />
                          <ScoreBar label="Habitat" value={r.habitat} color="#38bdf8" />
                          <ScoreBar label="Modeling" value={r.modeling} color="#a78bfa" />
                          <ScoreBar label="Controls" value={r.controls} color="#34d399" />
                          <ScoreBar label="Earth" value={r.earth} color="#fbbf24" />
                        </div>
                        <p className="mt-3 text-sm text-slate-200">{r.inv.fireSafetyInsight}</p>
                        <button
                          className="mt-2 text-xs text-orange-300 hover:text-orange-200"
                          onClick={() => setOpen(open === r.inv.slug ? null : r.inv.slug)}
                        >
                          {open === r.inv.slug ? "Hide interpretation" : "Why this rank?"}
                        </button>
                        {open === r.inv.slug && (
                          <div className="mt-2 rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-sm text-slate-300">
                            <ul className="list-disc space-y-1 pl-5">
                              {explain(r, weights, envs).map((s, i) => (
                                <li key={i}>{s}</li>
                              ))}
                            </ul>
                            <Link
                              href={`/investigation/${r.inv.slug}`}
                              className="mt-3 inline-block text-orange-300 hover:text-orange-200"
                            >
                              Open full briefing →
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </li>
              ))}
            </ol>

            <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
              <Card>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Evidence gaps</h3>
                <p className="mt-1 text-xs text-slate-500">For the environments you selected.</p>
                <ul className="mt-3 space-y-3">
                  {selectedGaps.map((g) => (
                    <li key={g.env.key} className="text-sm">
                      <div className="flex items-center gap-2 font-medium text-white">
                        <span className="h-2 w-2 rounded-full" style={{ background: g.env.color }} />
                        {g.env.short}
                        <span
                          className={`ml-auto rounded px-1.5 text-[11px] ${
                            g.directCount <= 2 ? "bg-rose-500/20 text-rose-300" : "bg-emerald-500/20 text-emerald-300"
                          }`}
                        >
                          {g.directCount} direct
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-400">{g.message}</p>
                    </li>
                  ))}
                </ul>
              </Card>
              <Card>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Scenario risks</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-300">
                  {ENVIRONMENTS.filter((e) => envs.includes(e.key)).map((e) => (
                    <li key={e.key}>
                      <span className="font-medium text-white">{e.short}:</span> {e.risks.join("; ")}.
                    </li>
                  ))}
                  {envs.length === 0 && <li className="text-slate-500">Select an environment to see its fire risks.</li>}
                </ul>
              </Card>
            </aside>
          </div>
        )}

        {/* MODELING */}
        {tab === "modeling" && (
          <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
            <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
              <Card>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Data types</h3>
                <p className="mt-1 text-xs text-slate-500">Pick the data your model needs. Results must include all.</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {allTypes.map(([t, n]) => (
                    <Chip
                      key={t}
                      active={types.includes(t)}
                      onClick={() => setTypes((c) => (c.includes(t) ? c.filter((x) => x !== t) : [...c, t]))}
                    >
                      {t} · {n}
                    </Chip>
                  ))}
                </div>
                {types.length > 0 && (
                  <div className="mt-3 space-y-1 text-xs text-slate-400">
                    {types.map((t) => (
                      <p key={t}>
                        <span className="text-slate-200">{t}:</span> {MODELING_DATA_DESCRIPTIONS[t]}
                      </p>
                    ))}
                    <button className="text-orange-300" onClick={() => setTypes([])}>
                      Clear
                    </button>
                  </div>
                )}
              </Card>
              <button
                onClick={() => downloadCsv(modelingList.map((m) => m.inv))}
                className="w-full rounded-xl border border-orange-400/50 bg-orange-500/10 px-4 py-2.5 text-sm font-medium text-orange-200 hover:bg-orange-500/20"
              >
                Export {modelingList.length} rows as CSV
              </button>
            </aside>
            <div className="space-y-3">
              {modelingList.length === 0 && <Card>No investigation provides all selected data types. Remove a type to widen results.</Card>}
              {modelingList.map((r) => (
                <Card key={r.inv.slug}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Link href={`/investigation/${r.inv.slug}`} className="text-lg font-semibold text-white hover:text-orange-200">
                        {r.inv.acronym}
                      </Link>
                      <p className="text-sm text-slate-400">{r.inv.title}</p>
                    </div>
                    <div className="w-32">
                      <ScoreBar label="Modeling value" value={r.inv.scoreModeling} max={10} color="#a78bfa" />
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-200">{r.inv.modelingNotes}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {r.inv.modelingData.map((t) => (
                      <Chip key={t} tone={types.includes(t) ? "orange" : "violet"}>
                        {t}
                      </Chip>
                    ))}
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                    {[
                      ["Oxygen", fmtRange(r.inv.o2Min, r.inv.o2Max, "%")],
                      ["Pressure", fmtRange(r.inv.pMin, r.inv.pMax, "kPa")],
                      ["Flow", r.inv.flowMin === null || r.inv.flowMax === null ? "n/a" : fmtRange(r.inv.flowMin, r.inv.flowMax, "cm/s")],
                      ["Gravity", gravityLabel(r.inv.gravity)],
                    ].map(([k, v]) => (
                      <div key={k} className="rounded-lg bg-slate-950/60 px-2.5 py-2">
                        <dt className="text-slate-500">{k}</dt>
                        <dd className="text-slate-200">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* CONTROLS */}
        {tab === "controls" && (
          <div className="space-y-8">
            {controlsGrouped.length === 0 && <Card>No investigations match your filters.</Card>}
            {controlsGrouped.map(([group, items]) => (
              <section key={group}>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-emerald-300">{group}</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {items.map((r) => (
                    <Card key={r.inv.slug}>
                      <div className="flex items-start justify-between gap-3">
                        <Link href={`/investigation/${r.inv.slug}`} className="font-semibold text-white hover:text-orange-200">
                          {r.inv.acronym}
                        </Link>
                        <div className="w-24 shrink-0">
                          <ScoreBar label="Controls" value={r.inv.scoreControls} max={10} color="#34d399" />
                        </div>
                      </div>
                      <p className="text-xs text-slate-500">{r.inv.title}</p>
                      <p className="mt-2 text-sm text-slate-200">{r.inv.controlsNotes}</p>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* EARTH */}
        {tab === "earth" && (
          <div className="space-y-8">
            <section>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-amber-300">NASA fire-safety technology on Earth</h3>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {SPINOFFS.map((s) => (
                  <Card key={s.name}>
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-white">{s.name}</h4>
                      <Chip tone="orange">{s.era}</Chip>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">Origin: {s.origin}</p>
                    <p className="mt-2 text-sm text-slate-200">{s.application}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {s.linkedSlugs.map((slug) => {
                        const inv = data.find((d) => d.slug === slug);
                        return inv ? (
                          <Link key={slug} href={`/investigation/${slug}`} className="text-xs text-orange-300 hover:text-orange-200">
                            {inv.acronym} →
                          </Link>
                        ) : null;
                      })}
                    </div>
                  </Card>
                ))}
              </div>
            </section>
            <section>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-amber-300">PSI investigations by Earth-transfer potential</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {earthList.map((r) => (
                  <Card key={r.inv.slug}>
                    <div className="flex items-start justify-between gap-3">
                      <Link href={`/investigation/${r.inv.slug}`} className="font-semibold text-white hover:text-orange-200">
                        {r.inv.acronym}
                      </Link>
                      <div className="w-24 shrink-0">
                        <ScoreBar label="Earth" value={r.inv.scoreEarth} max={10} color="#fbbf24" />
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-slate-200">{r.inv.earthNotes}</p>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* LESSONS */}
        {tab === "lessons" && (
          <div className="grid gap-4 lg:grid-cols-3">
            {INCIDENTS.map((inc) => {
              const linked = data
                .filter((d) => d.incidents.includes(inc.id))
                .sort((a, b) => b.scoreSpacecraft - a.scoreSpacecraft);
              return (
                <Card key={inc.id}>
                  <p className="text-xs text-rose-300">{inc.date}</p>
                  <h3 className="mt-1 text-lg font-semibold text-white">{inc.name}</h3>
                  <p className="mt-2 text-sm text-slate-200">{inc.headline}</p>
                  <h4 className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">What happened</h4>
                  <p className="mt-1 text-sm text-slate-300">{inc.cause}</p>
                  <h4 className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Lesson</h4>
                  <p className="mt-1 text-sm text-slate-300">{inc.lesson}</p>
                  <h4 className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Research that addresses it ({linked.length})
                  </h4>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {linked.map((l) => (
                      <Link
                        key={l.slug}
                        href={`/investigation/${l.slug}`}
                        className="rounded-full border border-slate-700 px-2.5 py-0.5 text-xs text-orange-300 hover:border-orange-400"
                      >
                        {l.acronym}
                      </Link>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* MAP */}
        {tab === "fuels" && <FuelsExplorer />}

        {tab === "evidence" && (
          <div className="space-y-5">
            <section>
              <div className="mb-3">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-orange-300">From the findings file</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">What the NASA summaries say</h2>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {VERIFIED_FINDINGS.map((item) => (
                  <Card key={item.study}>
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-sky-300">{item.study}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-200">{item.finding}</p>
                    <p className="mt-3 border-t border-slate-800 pt-3 text-xs leading-5 text-slate-500">Scope: {item.boundary}</p>
                  </Card>
                ))}
              </div>
            </section>
            <div className="grid gap-5 xl:grid-cols-2">
              {RECENT_EVIDENCE.map((study) => (
                <Card key={study.study} className="evidence-card">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-orange-300">{study.study}</p>
                      <h3 className="mt-1 text-xl font-semibold text-white">{study.title}</h3>
                    </div>
                    <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">Source table</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{study.note}</p>
                  <div className="mt-4 overflow-x-auto rounded-xl border border-slate-800">
                    <table className="w-full min-w-[560px] text-left text-xs">
                      <thead className="bg-slate-950/80 text-slate-400">
                        <tr>
                          <th className="px-3 py-2 font-medium">Test</th>
                          <th className="px-3 py-2 font-medium">Thickness</th>
                          <th className="px-3 py-2 font-medium">Airflow</th>
                          <th className="px-3 py-2 font-medium">Spread rate</th>
                          <th className="px-3 py-2 font-medium">O₂</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {study.rows.map((row) => (
                          <tr key={row.test} className="text-slate-200">
                            <th className="px-3 py-2 font-medium text-white">{row.test}</th>
                            <td className="px-3 py-2">{row.thickness}</td>
                            <td className="px-3 py-2">{row.airflow}</td>
                            <td className="px-3 py-2">{row.spread}</td>
                            <td className="px-3 py-2">{row.oxygen}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-500">{study.source}</p>
                </Card>
              ))}
            </div>
            <Card>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Reading the added files</h3>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-400 md:grid-cols-3">
                {EVIDENCE_NOTES.map((note) => <li key={note} className="border-l border-orange-400/50 pl-3">{note}</li>)}
              </ul>
              <h4 className="mt-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Open original CSV files</h4>
              <div className="mt-3 flex flex-wrap gap-2">
                {NASA_FILES.map((file) => (
                  <a key={file.href} href={file.href} download className="rounded-full border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:border-orange-400/70 hover:text-orange-200">
                    {file.label} ↓
                  </a>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* MAP */}
        {tab === "map" && (
          <div className="space-y-5">
            <AtmosphereMap list={data} selectedEnvs={envs} />
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
              {gaps.map((g) => (
                <Card key={g.env.key}>
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: g.env.color }} />
                    {g.env.short}
                  </div>
                  <p className="mt-2 text-xs text-slate-400">{g.message}</p>
                  {g.strongest && (
                    <Link href={`/investigation/${g.strongest.slug}`} className="mt-2 inline-block text-xs text-orange-300">
                      Best match: {g.strongest.acronym} →
                    </Link>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="mt-16 border-t border-slate-800 pt-6 text-xs leading-relaxed text-slate-500">
        <p>
          <strong className="text-slate-400">About the data.</strong> Summaries, tested-condition envelopes and 0–10 relevance
          scores are curated, approximate triage aids derived from public descriptions of NASA Physical Sciences Informatics (PSI)
          combustion investigations.
        </p>
        <p className="mt-2">
          Ranking = weighted blend of habitat relevance (60% curated score, 25% atmosphere overlap, 15% gravity match), modeling,
          controls and Earth-transfer scores. Adjust the sliders to test how conclusions change. API: <code>/api/investigations</code>.
        </p>
         <p> <strong> By the </strong> </p>
        <h1> INFLAMIOTIC TEAM </h1>

      </footer>
    </div>
  );
}

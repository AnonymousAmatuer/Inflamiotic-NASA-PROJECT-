"use client";

import { useEffect, useMemo, useState } from "react";
import { FUEL_STUDIES, parseCsv, type FuelStudyId } from "@/lib/fuel-datasets";
import { Card } from "./ui";

type Row = Record<string, string>;
type Point = { row: Row; fuel: string; oxygen: number; temperature: number; flow: string };
type ViewMode = "charts" | "visual";

const COLORS = ["#f4a261", "#67c5d8", "#b99cf3", "#84c99b", "#ed8290", "#e7c66d"];
const number = (value: string | undefined) => {
  if (!value || value.toLowerCase() === "ramped") return null;
  const result = Number(value);
  return Number.isFinite(result) ? result : null;
};
const displayFuel = (fuel: string) => {
  const names: Record<string, string> = { C2H4: "Ethylene", C3H8: "Propane", ethane: "Ethane", propane: "Propane" };
  return names[fuel] ?? fuel;
};
const compact = (value: number) => new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(value);

function SampleIndexView({
  fuels,
  dates,
  selectedFuel,
  onSelect,
  mode,
}: {
  fuels: [string, number][];
  dates: [string, number][];
  selectedFuel: string | null;
  onSelect: (fuel: string) => void;
  mode: ViewMode;
}) {
  const maxCount = Math.max(1, ...fuels.map(([, count]) => count));
  const maxDateCount = Math.max(1, ...dates.map(([, count]) => count));

  if (mode === "visual") {
    return (
      <Card className="relative isolate overflow-hidden border-sky-300/20 bg-[#0d151b] p-5 sm:p-7">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_100%,rgba(72,154,174,0.16),transparent_55%),linear-gradient(145deg,rgba(20,39,49,0.9),rgba(9,14,19,0.96))]" />
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.17em] text-sky-300">PSI-26 · BASS sample index</p>
            <h3 className="mt-1 text-2xl font-semibold text-white">Materials in the test log</h3>
          </div>
          <p className="max-w-sm text-xs leading-5 text-slate-400">Each tile counts how often a material label appears in the file. Select one to filter the source rows.</p>
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {fuels.map(([fuel, count], index) => {
            const color = COLORS[index % COLORS.length];
            return (
              <button key={fuel} type="button" aria-pressed={selectedFuel === fuel} onClick={() => onSelect(fuel)} className={`group overflow-hidden rounded-xl border text-left transition hover:-translate-y-0.5 ${selectedFuel === fuel ? "border-sky-300/70 bg-sky-300/10" : "border-slate-700/70 bg-slate-950/60 hover:border-sky-300/50"}`}>
                <div className="relative h-14 overflow-hidden border-b border-white/5" style={{ background: `linear-gradient(120deg,${color}17,transparent 70%)` }}>
                  <div className="absolute inset-x-0 bottom-0 flex h-full items-end gap-1 px-3 opacity-80">
                    {[0, 1, 2, 3, 4, 5, 6].map((piece) => <span key={piece} className="block w-2 rounded-t-sm" style={{ height: `${25 + ((count * (piece + 2)) % 65)}%`, backgroundColor: color, opacity: 0.24 + (piece % 3) * 0.16 }} />)}
                  </div>
                  <span className="absolute right-3 top-2 font-serif text-3xl text-white/90">{count}</span>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium leading-5 text-slate-100">{fuel}</p>
                  <p className="mt-1 text-[11px] text-slate-500">{count} {count === 1 ? "record" : "records"} · click to view</p>
                </div>
              </button>
            );
          })}
        </div>
        <p className="mt-4 border-t border-white/10 pt-3 text-xs leading-5 text-slate-500">This PSI-26 file is a sample and test index. It lists material labels, test numbers, and dates; it does not contain oxygen levels, flame temperatures, spread rates, or ignition outcomes.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-sky-300">PSI-26 · BASS sample index</p>
        <h3 className="mt-1 text-lg font-semibold text-white">Records by material label</h3>
        <p className="mt-1 text-xs text-slate-500">Labels are kept as listed in the source file.</p>
        <div className="mt-5 max-h-[350px] space-y-3 overflow-auto pr-1">
          {fuels.map(([fuel, count], index) => (
            <button key={fuel} type="button" onClick={() => onSelect(fuel)} aria-pressed={selectedFuel === fuel} className="block w-full rounded-lg px-2 py-1.5 text-left hover:bg-slate-800/50">
              <span className="mb-1 flex justify-between gap-3 text-xs"><span className="text-slate-300">{fuel}</span><span className="tabular-nums text-white">{count}</span></span>
              <span className="block h-2 overflow-hidden rounded-full bg-slate-800"><span className="block h-full rounded-full" style={{ width: `${(count / maxCount) * 100}%`, backgroundColor: COLORS[index % COLORS.length] }} /></span>
            </button>
          ))}
        </div>
      </Card>
      <Card>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-orange-300">Dates in the file</p>
        <h3 className="mt-1 text-lg font-semibold text-white">Tests across the campaign</h3>
        <p className="mt-1 text-xs text-slate-500">Each mark is one date; hover for its record count.</p>
        <div className="mt-6 flex h-44 items-end gap-1 overflow-x-auto border-b border-slate-700 pb-1">
          {dates.map(([date, count]) => (
            <div key={date} title={`${date}: ${count} records`} className="group relative flex h-full min-w-[9px] flex-1 items-end justify-center">
              <span className="w-full rounded-t-sm bg-gradient-to-t from-orange-500/50 to-amber-200/90 transition-colors group-hover:to-white" style={{ height: `${Math.max(5, (count / maxDateCount) * 100)}%` }} />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[11px] tabular-nums text-slate-500"><span>{dates[0]?.[0] ?? "—"}</span><span>{dates.at(-1)?.[0] ?? "—"}</span></div>
        <p className="mt-4 border-t border-slate-800 pt-3 text-xs leading-5 text-slate-500">This is a sample and test index, not a table of measured flammability results.</p>
      </Card>
    </div>
  );
}

function SampleIndexTable({ rows, source }: { rows: Row[]; source: string }) {
  const columns = ["Test #", "Date", "Fuel Sample Material", "Sample #", "As Run Test #", "GMT"];
  return (
    <Card>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-violet-300">Original PSI-26 rows</p>
          <h3 className="mt-1 text-lg font-semibold text-white">BASS sample and test log</h3>
        </div>
        <a href="/nasa-data/PSI-26_Experimental%20table_BASS.csv" download className="text-xs text-orange-300 hover:text-orange-200">Download original CSV ↓</a>
      </div>
      <div className="mt-4 max-h-[420px] overflow-auto rounded-xl border border-slate-800">
        <table className="w-full min-w-[720px] text-left text-xs">
          <thead className="sticky top-0 bg-slate-950 text-slate-400"><tr>{columns.map((column) => <th key={column} className="px-3 py-2 font-medium">{column}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-800/80">
            {rows.map((row, index) => <tr key={`${row["Test #"]}-${index}`} className="text-slate-300 hover:bg-slate-800/40">
              {columns.map((column, columnIndex) => <td key={column} className={`px-3 py-2 ${columnIndex === 0 ? "font-medium text-white" : ""}`}>{row[column] || "—"}</td>)}
            </tr>)}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">{source} The source lists sample materials and run identifiers, not flammability measurements.</p>
    </Card>
  );
}

export default function FuelsExplorer() {
  const [studyId, setStudyId] = useState<FuelStudyId>("flame-design");
  const [datasets, setDatasets] = useState<Partial<Record<FuelStudyId, Row[]>>>({});
  const [loadingByStudy, setLoadingByStudy] = useState<Record<FuelStudyId, boolean>>({ "flame-design": true, "cfi-g": true, bass: true });
  const [errors, setErrors] = useState<Partial<Record<FuelStudyId, string>>>({});
  const [selectedFuel, setSelectedFuel] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("charts");
  const rows = datasets[studyId] ?? [];
  const loading = loadingByStudy[studyId];
  const error = errors[studyId] ?? null;
  const study = FUEL_STUDIES.find((item) => item.id === studyId)!;

  useEffect(() => {
    let cancelled = false;
    const loadStudy = async (item: typeof FUEL_STUDIES[number]) => {
      try {
        const response = await fetch(item.file);
        if (!response.ok) throw new Error(`Could not load the data file (${response.status}).`);
        const [header = [], ...records] = parseCsv(await response.text());
        const parsed = records.map((values) => Object.fromEntries(header.map((key, index) => [key, values[index] ?? ""])));
        if (!cancelled) setDatasets((current) => ({ ...current, [item.id]: parsed }));
      } catch (reason) {
        if (!cancelled) setErrors((current) => ({ ...current, [item.id]: reason instanceof Error ? reason.message : "Could not load this table." }));
      } finally {
        if (!cancelled) setLoadingByStudy((current) => ({ ...current, [item.id]: false }));
      }
    };
    FUEL_STUDIES.forEach((item) => { void loadStudy(item); });
    return () => { cancelled = true; };
  }, []);

  const fuels = useMemo(() => {
    const counts = new Map<string, number>();
    rows.forEach((row) => {
      const fuel = row[study.fuelColumn]?.trim() || "Unspecified";
      counts.set(fuel, (counts.get(fuel) ?? 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [rows, study.fuelColumn]);

  const visibleRows = useMemo(
    () => selectedFuel ? rows.filter((row) => row[study.fuelColumn] === selectedFuel) : rows,
    [rows, selectedFuel, study.fuelColumn],
  );

  const points = useMemo(() => visibleRows.flatMap((row) => {
    const oxygen = number(row[study.oxygenColumn]);
    const temperature = number(row[study.temperatureColumn]);
    if (oxygen === null || temperature === null) return [];
    return [{
      row,
      fuel: row[study.fuelColumn] || "Unspecified",
      oxygen: oxygen <= 1 ? oxygen * 100 : oxygen,
      temperature,
      flow: row[study.flowColumn] || "",
    }];
  }), [visibleRows, study]);

  const avgByFuel = useMemo(() => fuels.flatMap(([fuel, count]) => {
    const values = points.filter((point) => point.fuel === fuel).map((point) => point.temperature);
    return values.length ? [{ fuel, count: values.length, tests: count, average: values.reduce((sum, value) => sum + value, 0) / values.length }] : [];
  }), [fuels, points]);

  const allFuelNames = fuels.map(([fuel]) => fuel);
  const dates = useMemo(() => {
    if (!study.dateColumn) return [];
    const counts = new Map<string, number>();
    visibleRows.forEach((row) => {
      const date = row[study.dateColumn!] || "Unspecified";
      counts.set(date, (counts.get(date) ?? 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());
  }, [visibleRows, study.dateColumn]);
  const tableColumns: { label: string; key: string; format?: string }[] = study.kind === "sample-index"
    ? [
        { label: study.testColumn, key: study.testColumn },
        { label: study.dateColumn ?? "Date", key: study.dateColumn ?? "Date" },
        { label: "Material / sample", key: study.fuelColumn },
        { label: "Sample #", key: "Sample #" },
        { label: "As run #", key: "As Run Test #" },
        { label: "GMT", key: "GMT" },
      ]
    : [
        { label: study.testColumn, key: study.testColumn },
        { label: "Day", key: "Day" },
        { label: "Fuel", key: study.fuelColumn },
        { label: "Initial O₂", key: study.oxygenColumn, format: "oxygen" },
        { label: "Tad", key: study.temperatureColumn, format: "temperature" },
        { label: "Fuel flow", key: study.flowColumn, format: "flow" },
        ...(study.resultColumn ? [{ label: study.resultColumn, key: study.resultColumn }] : []),
      ];
  const minX = points.length ? Math.min(...points.map((point) => point.oxygen)) : 0;
  const maxX = points.length ? Math.max(...points.map((point) => point.oxygen)) : 1;
  const minY = points.length ? Math.min(...points.map((point) => point.temperature)) : 0;
  const maxY = points.length ? Math.max(...points.map((point) => point.temperature)) : 1;
  const xSpan = maxX - minX || 1;
  const ySpan = maxY - minY || 1;
  const plot = { left: 52, top: 16, width: 650, height: 225 };
  const xPos = (value: number) => plot.left + ((value - minX) / xSpan) * plot.width;
  const yPos = (value: number) => plot.top + plot.height - ((value - minY) / ySpan) * plot.height;
  const maxAverage = Math.max(1, ...avgByFuel.map((item) => item.average));
  const minAverage = Math.min(maxAverage, ...avgByFuel.map((item) => item.average));

  return (
    <div className="space-y-5">
      <section>
        <p className="text-xs font-medium uppercase tracking-[0.17em] text-orange-300">Research files · fuel view</p>
        <h2 className="mt-1 text-2xl font-semibold text-white sm:text-3xl">Fuels &amp; flammability tests</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          {study.kind === "sample-index"
            ? "Browse the BASS sample log by material, test number, and date. This file is an index; it does not report the flammability measurements themselves."
            : "Browse test records by study and fuel. Select a fuel count to focus the chart and rows below. The plot compares initial oxygen concentration with the table's adiabatic flame temperature; it describes these test records, not a universal flammability limit."}
        </p>
      </section>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {FUEL_STUDIES.map((item) => {
          const active = item.id === studyId;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={active}
              onClick={() => { setStudyId(item.id); setSelectedFuel(null); }}
              className={`rounded-2xl border p-4 text-left transition ${active ? "border-orange-400/70 bg-orange-500/10" : "border-slate-800 bg-slate-900/60 hover:border-slate-600"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-sky-300">{item.acronym}</p>
                  <h3 className="mt-1 font-semibold text-white">{item.title}</h3>
                </div>
                <span className="rounded-lg bg-slate-950/70 px-3 py-2 text-center">
                  <span className="block text-xl font-semibold tabular-nums text-white">{loadingByStudy[item.id] ? "…" : errors[item.id] ? "!" : datasets[item.id]?.length ?? 0}</span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500">test rows</span>
                </span>
              </div>
              <p className="mt-3 text-xs text-slate-400">{item.source}</p>
            </button>
          );
        })}
      </div>

      {loading && <Card className="text-sm text-slate-400">Loading the selected NASA table…</Card>}
      {error && <Card className="border-rose-500/40 text-sm text-rose-200">{error} Check the original file in the NASA data folder.</Card>}

      {!loading && !error && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">Test records</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-white">{visibleRows.length}</p>
              <p className="text-xs text-slate-500">{selectedFuel ? displayFuel(selectedFuel) : "all fuels in this table"}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">{study.kind === "sample-index" ? "Material labels" : "Fuel groups"}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-white">{selectedFuel ? 1 : fuels.length}</p>
              <p className="text-xs text-slate-500">{study.kind === "sample-index" ? "Click a material count below to filter" : "Click a fuel count below to filter"}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">{study.kind === "sample-index" ? "Test dates" : "Charted runs"}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-white">{study.kind === "sample-index" ? dates.length : points.length}</p>
              <p className="text-xs text-slate-500">{study.kind === "sample-index" ? "Dates listed in the sample index" : "Rows with numeric oxygen and temperature"}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
            <div>
              <p className="text-sm font-medium text-white">Choose how to view the results</p>
              <p className="text-xs text-slate-500">Switch between precise plots and a more visual eye-treat fuel gallery.</p>
            </div>
            <div className="inline-flex rounded-xl border border-slate-700 bg-slate-950/80 p-1" role="group" aria-label="Results display">
              {([['charts', 'Data charts'], ['visual', 'Visual gallery']] as [ViewMode, string][]).map(([mode, label]) => (
                <button key={mode} type="button" aria-pressed={viewMode === mode} onClick={() => setViewMode(mode)} className={`rounded-lg px-3 py-2 text-xs font-medium transition ${viewMode === mode ? "bg-orange-400 text-slate-950" : "text-slate-400 hover:text-white"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <Card>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-orange-300">Material / fuel counter · click to filter</p>
                <h3 className="mt-1 text-lg font-semibold text-white">{study.kind === "sample-index" ? "Test count by material" : "Test count by fuel"}</h3>
              </div>
              {selectedFuel && <button onClick={() => setSelectedFuel(null)} className="text-xs text-orange-300 hover:text-orange-200">Show all fuels</button>}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {fuels.map(([fuel, count], index) => (
                <button
                  key={fuel}
                  type="button"
                  aria-pressed={selectedFuel === fuel}
                  onClick={() => setSelectedFuel((current) => current === fuel ? null : fuel)}
                  className={`rounded-xl border px-3 py-2 text-left transition ${selectedFuel === fuel ? "border-orange-400 bg-orange-500/15" : "border-slate-800 hover:border-slate-600"}`}
                >
                  <span className="block text-xs text-slate-300">{displayFuel(fuel)}</span>
                  <span className="mt-0.5 block text-lg font-semibold tabular-nums" style={{ color: COLORS[index % COLORS.length] }}>{count} <span className="text-xs font-normal text-slate-500">tests</span></span>
                </button>
              ))}
            </div>
          </Card>

          {viewMode === "visual" ? study.kind === "sample-index" ? (
            <SampleIndexView fuels={fuels} dates={dates} selectedFuel={selectedFuel} onSelect={(fuel) => setSelectedFuel((current) => current === fuel ? null : fuel)} mode="visual" />
          ) : (
            <Card className="relative isolate overflow-hidden border-orange-300/20 bg-[#10161b] p-5 sm:p-7">
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_100%,rgba(238,128,67,0.16),transparent_48%),linear-gradient(145deg,rgba(27,42,53,0.9),rgba(9,14,19,0.96))]" />
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.17em] text-orange-300">Visual gallery · recorded values</p>
                  <h3 className="mt-1 text-2xl font-semibold text-white">A portrait of each fuel</h3>
                </div>
                <p className="max-w-sm text-xs leading-5 text-slate-400">The flame forms are illustrations. Their labels and scales use measured table values.</p>
              </div>
              {avgByFuel.length ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {avgByFuel.map((item, index) => {
                    const fuelPoints = points.filter((point) => point.fuel === item.fuel);
                    const o2Min = Math.min(...fuelPoints.map((point) => point.oxygen));
                    const o2Max = Math.max(...fuelPoints.map((point) => point.oxygen));
                    const ratio = (item.average - minAverage) / (maxAverage - minAverage || 1);
                    const flameScale = 0.72 + ratio * 0.28;
                    const color = COLORS[index % COLORS.length];
                    const gradientId = `flame-${study.id}-${index}`;
                    return (
                      <button key={item.fuel} type="button" onClick={() => setSelectedFuel((current) => current === item.fuel ? null : item.fuel)} aria-pressed={selectedFuel === item.fuel} className={`group relative overflow-hidden rounded-2xl border text-left transition hover:-translate-y-0.5 hover:border-orange-300/60 ${selectedFuel === item.fuel ? "border-orange-300/70 bg-orange-300/10" : "border-slate-700/80 bg-slate-950/60"}`}>
                        <div className="absolute inset-0 opacity-60" style={{ background: `radial-gradient(ellipse at 50% 76%, ${color}24, transparent 58%)` }} />
                        <div className="relative flex min-h-[218px] items-center gap-2 p-4">
                          <div className="flex h-44 w-36 shrink-0 items-center justify-center">
                            <svg viewBox="0 0 180 220" aria-hidden="true" className="h-full w-full overflow-visible">
                              <defs>
                                <linearGradient id={gradientId} x1="0" x2="0" y1="1" y2="0">
                                  <stop offset="0" stopColor={color} stopOpacity="0.95" />
                                  <stop offset="0.62" stopColor="#ffb36b" stopOpacity="0.82" />
                                  <stop offset="1" stopColor="#fff4ce" stopOpacity="0.92" />
                                </linearGradient>
                              </defs>
                              <ellipse cx="90" cy="194" rx="54" ry="13" fill={color} opacity="0.18" />
                              <path d="M90 20 C101 49 138 68 138 116 C138 160 119 190 90 194 C55 191 38 165 42 129 C45 99 66 79 65 52 C81 65 83 79 82 92 C100 74 101 49 90 20Z" fill={`url(#${gradientId})`} opacity="0.92" transform={`translate(0 194) scale(1 ${flameScale}) translate(0 -194)`} className="flame-glow transition-transform duration-500" />
                              <path d="M91 104 C100 124 117 136 112 158 C108 176 99 184 87 184 C72 181 66 169 68 154 C70 143 80 132 79 117 C87 123 89 131 88 139 C96 129 96 117 91 104Z" fill="#fff2cf" opacity="0.84" />
                              <circle cx="33" cy="69" r="2" fill={color} opacity="0.8" /><circle cx="147" cy="54" r="1.5" fill="#ffd49b" opacity="0.7" /><circle cx="144" cy="132" r="2" fill={color} opacity="0.75" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1 self-center">
                            <p className="text-xs font-medium uppercase tracking-[0.12em]" style={{ color }}>{displayFuel(item.fuel)}</p>
                            <p className="mt-2 text-3xl font-semibold tabular-nums text-white">{Math.round(item.average)}<span className="ml-1 text-sm font-normal text-slate-400">K</span></p>
                            <p className="mt-1 text-xs text-slate-400">mean Tad · {item.count} numeric results</p>
                            <div className="mt-4 border-t border-white/10 pt-3 text-xs">
                              <p className="text-slate-500">Initial O₂ in charted runs</p>
                              <p className="mt-1 tabular-nums text-slate-200">{compact(o2Min)}–{compact(o2Max)}%</p>
                            </div>
                            <p className="mt-3 text-[11px] text-slate-500">{item.tests} source rows · click to focus</p>
                          </div>
                        </div>
                        <div className="relative h-1 bg-slate-800"><div className="h-full transition-all" style={{ width: `${(item.average / maxAverage) * 100}%`, background: color }} /></div>
                      </button>
                    );
                  })}
                </div>
              ) : <p className="mt-5 text-sm text-slate-500">No numeric flame-temperature values for this selection.</p>}
              <p className="mt-4 text-xs leading-5 text-slate-500">Average flame temperature summarizes numeric Tad entries only. The illustration is decorative and is not a NASA flame image or a measured flame shape.</p>
            </Card>
          ) : study.kind === "sample-index" ? (
            <SampleIndexView fuels={fuels} dates={dates} selectedFuel={selectedFuel} onSelect={(fuel) => setSelectedFuel((current) => current === fuel ? null : fuel)} mode="charts" />
          ) : (
          <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
            <Card>
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-sky-300">Recorded values</p>
                  <h3 className="mt-1 text-lg font-semibold text-white">Oxygen level &amp; flame temperature</h3>
                </div>
                <p className="text-xs text-slate-500">Each dot is one row</p>
              </div>
              {points.length > 0 ? (
                <div className="mt-3 overflow-x-auto">
                  <svg viewBox="0 0 740 300" role="img" aria-label="Scatter plot of initial oxygen percentage and adiabatic flame temperature in kelvin" className="h-auto min-w-[560px] w-full">
                    {[0, 1, 2, 3].map((tick) => {
                      const y = plot.top + (plot.height * tick) / 3;
                      const value = maxY - (ySpan * tick) / 3;
                      return <g key={tick}><line x1={plot.left} x2={plot.left + plot.width} y1={y} y2={y} stroke="#334155" strokeDasharray="3 5" /><text x={plot.left - 8} y={y + 4} textAnchor="end" fill="#94a3b8" fontSize="11">{Math.round(value)}</text></g>;
                    })}
                    <line x1={plot.left} x2={plot.left + plot.width} y1={plot.top + plot.height} y2={plot.top + plot.height} stroke="#64748b" />
                    <line x1={plot.left} x2={plot.left} y1={plot.top} y2={plot.top + plot.height} stroke="#64748b" />
                    <text x={plot.left + plot.width / 2} y="286" textAnchor="middle" fill="#94a3b8" fontSize="12">Initial oxygen concentration (%)</text>
                    <text transform="translate(14 130) rotate(-90)" textAnchor="middle" fill="#94a3b8" fontSize="12">Adiabatic flame temperature (K)</text>
                    {[0, 1, 2, 3].map((tick) => {
                      const value = minX + (xSpan * tick) / 3;
                      const x = plot.left + (plot.width * tick) / 3;
                      return <text key={tick} x={x} y={plot.top + plot.height + 18} textAnchor="middle" fill="#94a3b8" fontSize="11">{compact(value)}%</text>;
                    })}
                    {points.map((point, index) => {
                      const color = COLORS[Math.max(0, allFuelNames.indexOf(point.fuel)) % COLORS.length];
                      return <circle key={`${point.row.Test}-${index}`} cx={xPos(point.oxygen)} cy={yPos(point.temperature)} r="3.5" fill={color} fillOpacity="0.78" stroke="#0b1015" strokeWidth="1"><title>{`${displayFuel(point.fuel)} · ${point.row.Test}: ${compact(point.oxygen)}% O₂, ${compact(point.temperature)} K, ${point.flow} mg/s fuel flow`}</title></circle>;
                    })}
                  </svg>
                </div>
              ) : <p className="mt-5 text-sm text-slate-500">No rows in this selection have both values recorded.</p>}
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                {allFuelNames.map((fuel, index) => <span key={fuel} className="inline-flex items-center gap-1.5 text-xs text-slate-400"><span className="h-2 w-2 rounded-full" style={{ background: COLORS[index % COLORS.length] }} />{displayFuel(fuel)}</span>)}
              </div>
            </Card>

            <Card>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-emerald-300">Across recorded runs</p>
              <h3 className="mt-1 text-lg font-semibold text-white">Average flame temperature by fuel</h3>
              <p className="mt-1 text-xs text-slate-500">Mean of numeric Tad values in the selected table.</p>
              <div className="mt-5 space-y-4">
                {avgByFuel.map((item, index) => (
                  <div key={item.fuel}>
                    <div className="mb-1 flex items-center justify-between gap-3 text-xs"><span className="text-slate-300">{displayFuel(item.fuel)} <span className="text-slate-600">({item.count} numeric)</span></span><span className="tabular-nums text-white">{Math.round(item.average)} K</span></div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full" style={{ width: `${Math.max(2, (item.average / maxAverage) * 100)}%`, background: COLORS[index % COLORS.length] }} /></div>
                  </div>
                ))}
                {avgByFuel.length === 0 && <p className="text-sm text-slate-500">No numeric temperature values for this selection.</p>}
              </div>
            </Card>
          </div>
          )}

          {study.kind === "sample-index" && <SampleIndexTable rows={visibleRows} source={study.source} />}

          {study.kind === "flame" && (
          <Card>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-violet-300">Source rows</p>
                <h3 className="mt-1 text-lg font-semibold text-white">{selectedFuel ? displayFuel(selectedFuel) : "All fuels"} · measurements</h3>
              </div>
              <a href={study.file} download className="text-xs text-orange-300 hover:text-orange-200">Download original CSV ↓</a>
            </div>
            <div className="mt-4 max-h-[420px] overflow-auto rounded-xl border border-slate-800">
              <table className="w-full min-w-[720px] text-left text-xs">
                <thead className="sticky top-0 bg-slate-950 text-slate-400"><tr>
                  {["Test", "Day", "Fuel", "Initial O₂", "Tad", "Fuel flow", ...(study.resultColumn ? [study.resultColumn] : [])].map((label) => <th key={label} className="px-3 py-2 font-medium">{label}</th>)}
                </tr></thead>
                <tbody className="divide-y divide-slate-800/80">
                  {visibleRows.map((row, index) => {
                    const oxygen = number(row[study.oxygenColumn]);
                    return <tr key={`${row.Test}-${index}`} className="text-slate-300 hover:bg-slate-800/40">
                      <td className="px-3 py-2 font-medium text-white">{row.Test || "—"}</td>
                      <td className="px-3 py-2">{row.Day || "—"}</td>
                      <td className="px-3 py-2">{displayFuel(row[study.fuelColumn] || "—")}</td>
                      <td className="px-3 py-2 tabular-nums">{oxygen === null ? row[study.oxygenColumn] || "—" : `${compact(oxygen <= 1 ? oxygen * 100 : oxygen)}%`}</td>
                      <td className="px-3 py-2 tabular-nums">{row[study.temperatureColumn] || "—"}{number(row[study.temperatureColumn]) !== null ? " K" : ""}</td>
                      <td className="px-3 py-2 tabular-nums">{row[study.flowColumn] || "—"}{number(row[study.flowColumn]) !== null ? " mg/s" : ""}</td>
                      {study.resultColumn && <td className="px-3 py-2">{row[study.resultColumn] || "—"}</td>}
                    </tr>;
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">{study.source} Rows marked “RAMPED” or blank remain visible in the table and are excluded from numeric charts. Temperature averages summarize recorded runs, not a fuel ranking or safety threshold.</p>
          </Card>
          )}
        </>
      )}
    </div>
  );
}

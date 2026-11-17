"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { parseCsv } from "@/lib/fuel-datasets";
import { Card } from "./ui";

type StudyId = "bass2" | "psi10" | "psi159" | "psi26";
type ChartType = "scatter" | "line" | "bar" | "pie";
type Study = { id: StudyId; name: string; file: string; description: string; gravity: string; x: string; y: string };
type Row = Record<string, string>;
type Point = { id: string; material: string; x: number; y: number; details: [string, string][]; parameters: Record<string, number> };
type SimParameter = { key: string; label: string; unit: string };

const SIM_PARAMETERS: Record<StudyId, SimParameter[]> = {
  bass2: [
    { key: "airflow", label: "Airflow velocity", unit: "cm/s" },
    { key: "oxygen", label: "Initial oxygen", unit: "vol%" },
    { key: "thickness", label: "Sample thickness", unit: "mm" },
    { key: "finalOxygen", label: "Final oxygen", unit: "vol%" },
    { key: "duration", label: "Burn duration", unit: "s" },
  ],
  psi10: [
    { key: "oxygen", label: "Initial oxygen", unit: "%" },
    { key: "fuelFlow", label: "Fuel mass flow", unit: "mg/s" },
    { key: "pressure", label: "Mean pressure", unit: "atm" },
    { key: "totalFlow", label: "Total mass flow", unit: "mg/s" },
    { key: "initialPressure", label: "Initial pressure", unit: "atm" },
  ],
  psi159: [
    { key: "oxygen", label: "Oxygen before test", unit: "%" },
    { key: "fuelFlow", label: "Hydrocarbon mass flow", unit: "mg/s" },
    { key: "pressure", label: "Approx. pressure", unit: "bar" },
    { key: "burnTime", label: "Burn time", unit: "s" },
    { key: "mixtureFraction", label: "Stoichiometric mixture fraction", unit: "Zst" },
  ],
  psi26: [],
};

const STUDIES: { id: StudyId; name: string; file: string; description: string; gravity: string; x: string; y: string }[] = [
  { id: "bass2", name: "BASS-II · PMMA test matrix", file: "/nasa-data/bass_II_PMMA_test_matrix_v0.2.csv", description: "PMMA flat-sample matrix · NASA/TM-20210011385, Table 5.1", gravity: "BASS-II microgravity investigation", x: "Airflow (cm/s)", y: "Spread rate (mm/s)" },
  { id: "psi10", name: "PSI-10 · Flame Design", file: "/nasa-data/PSI-10_Experimental%20table_Flame%20Design_Normal%20Flame.csv", description: "Normal-flame experimental table supplied with this project", gravity: "Normal-flame table; gravity condition not separately stated", x: "Initial oxygen (%)", y: "Adiabatic flame temperature (K)" },
  { id: "psi159", name: "PSI-159 · CFI-G", file: "/nasa-data/PSI-159_Experimental%20table_CFI-G_Normal%20Flames.csv", description: "CFI-G normal-flame experimental table supplied with this project", gravity: "Normal-flame table; gravity condition not separately stated", x: "Initial oxygen (%)", y: "Adiabatic flame temperature (K)" },
  { id: "psi26", name: "PSI-26 · BASS sample log", file: "/nasa-data/PSI-26_Experimental%20table_BASS.csv", description: "BASS sample and run index; this file lists materials and identifiers, not measured flame outcomes", gravity: "BASS microgravity investigation; this index contains no gravity measurements", x: "", y: "" },
];

const asNumber = (text: string | undefined) => {
  if (!text || /ramped|n\/?a/i.test(text)) return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
};
const pretty = (n: number) => new Intl.NumberFormat("en", { maximumFractionDigits: 3 }).format(n);
const CHART_COLORS = ["#f4a261", "#67c5d8", "#b99cf3", "#84c99b", "#ed8290", "#e7c66d", "#7ba6e8", "#e99ac7"];

function pythonPlotCode(points: Point[], chartType: ChartType, study: Study, material: string) {
  const x = JSON.stringify(points.map((point) => point.x));
  const y = JSON.stringify(points.map((point) => point.y));
  const labels = JSON.stringify(points.map((point) => point.material));
  const title = JSON.stringify(`${study.name}: ${study.y} by ${study.x}${material === "All materials" ? "" : ` · ${material}`}`);
  const shared = `# Generated from the currently selected Inflamiotic source records.\n# Values are observations from the provided NASA tables; this script does not fit or predict fire behavior.\n# Install with: python -m pip install matplotlib\nimport matplotlib.pyplot as plt\n\nx = ${x}\ny = ${y}\nmaterials = ${labels}\nplt.figure(figsize=(10, 6))\n`;
  if (chartType === "pie") return `${shared}counts = {name: materials.count(name) for name in sorted(set(materials))}\nplt.pie(counts.values(), labels=counts.keys(), autopct="%1.1f%%", startangle=90)\nplt.title(${title.replace(/·/g, "-")})\nplt.axis("equal")\n` + `plt.tight_layout()\nplt.savefig("inflamiotic-chart.png", dpi=200)\nplt.show()\n`;
  if (chartType === "bar") return `${shared}groups = {name: [value for value, label in zip(y, materials) if label == name] for name in sorted(set(materials))}\nmeans = {name: sum(values) / len(values) for name, values in groups.items()}\nplt.bar(means.keys(), means.values(), color="darkorange")\nplt.ylabel(${JSON.stringify(study.y)})\nplt.xticks(rotation=25, ha="right")\n` + `plt.title(${title.replace(/·/g, "-")})\nplt.tight_layout()\nplt.savefig("inflamiotic-chart.png", dpi=200)\nplt.show()\n`;
  if (chartType === "line") return `${shared}for name in sorted(set(materials)):\n    indices = [i for i, label in enumerate(materials) if label == name]\n    indices.sort(key=lambda i: x[i])\n    plt.plot([x[i] for i in indices], [y[i] for i in indices], marker="o", linewidth=1, label=name)\nplt.xlabel(${JSON.stringify(study.x)})\nplt.ylabel(${JSON.stringify(study.y)})\nplt.legend(title="Fuel / material")\n` + `plt.title(${title.replace(/·/g, "-")})\nplt.tight_layout()\nplt.savefig("inflamiotic-chart.png", dpi=200)\nplt.show()\n`;
  return `${shared}for name in sorted(set(materials)):\n    indices = [i for i, label in enumerate(materials) if label == name]\n    plt.scatter([x[i] for i in indices], [y[i] for i in indices], label=name, alpha=0.75)\nplt.xlabel(${JSON.stringify(study.x)})\nplt.ylabel(${JSON.stringify(study.y)})\nplt.legend(title="Fuel / material")\n` + `plt.title(${title.replace(/·/g, "-")})\nplt.tight_layout()\nplt.savefig("inflamiotic-chart.png", dpi=200)\nplt.show()\n`;
}

async function downloadChartPdf(svg: SVGSVGElement, title: string, source: string) {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.querySelectorAll("text").forEach((node) => { node.style.fill = "#263544"; });
  const background = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  background.setAttribute("width", "100%"); background.setAttribute("height", "100%"); background.setAttribute("fill", "#ffffff");
  clone.insertBefore(background, clone.firstChild);
  const svgUrl = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const image = new Image();
    image.src = svgUrl;
    await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error("Could not render the selected chart for PDF export.")); });
    const canvas = document.createElement("canvas"); canvas.width = 1520; canvas.height = 720;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("This browser cannot prepare the PDF image.");
    context.fillStyle = "#ffffff"; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const jpeg = atob(canvas.toDataURL("image/jpeg", 0.92).split(",")[1]);
    const clean = (value: string) => value.replace(/[^\x20-\x7E]/g, "-").replace(/[\\()]/g, "\\$&");
    const content = `BT /F1 18 Tf 42 756 Td (${clean(title)}) Tj ET\nBT /F1 10 Tf 42 738 Td (${clean(source)}) Tj ET\nq 532 0 0 252 40 460 cm /Im0 Do Q\nBT /F1 10 Tf 42 438 Td (Inflamiotic data visualization - source observations only.) Tj ET\nBT /F1 9 Tf 42 420 Td (See the source table for test conditions and study limitations.) Tj ET\n`;
    const objects = [
      "<< /Type /Catalog /Pages 2 0 R >>",
      "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
      "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> /XObject << /Im0 5 0 R >> >> /Contents 6 0 R >>",
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
      `<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n${jpeg}\nendstream`,
      `<< /Length ${content.length} >>\nstream\n${content}endstream`,
    ];
    let pdf = "%PDF-1.4\n";
    const offsets = [0];
    objects.forEach((object, index) => { offsets.push(pdf.length); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
    const xref = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.slice(1).forEach((offset) => { pdf += `${String(offset).padStart(10, "0")} 00000 n \n`; });
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
    const bytes = new Uint8Array(pdf.length);
    for (let index = 0; index < pdf.length; index += 1) bytes[index] = pdf.charCodeAt(index);
    const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "inflamiotic-chart.pdf"; anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

function parseRows(csv: string): Row[] {
  const [header = [], ...records] = parseCsv(csv);
  return records.map((record) => Object.fromEntries(header.map((column, i) => [column.trim(), (record[i] ?? "").trim()])));
}

function measuredPoints(id: StudyId, rows: Row[]): Point[] {
  if (id === "bass2") return rows.flatMap((row) => {
    const flows = (row.flow_velocity_cm_s_sequence ?? "").split("|").map((v) => asNumber(v.trim()));
    const spreads = (row.spread_rate_mm_s_sequence ?? "").split("|").map((v) => asNumber(v.trim()));
    return flows.flatMap((flow, index) => {
      const spread = spreads[index];
      if (flow === null || spread === null || spread === undefined) return [];
      const oxygen = asNumber(row.initial_oxygen_vol_pct);
      const finalOxygen = asNumber(row.final_oxygen_vol_pct);
      const thickness = asNumber(row.thickness_mm);
      const duration = asNumber(row.burn_duration_s);
      if (oxygen === null || finalOxygen === null || thickness === null || duration === null) return [];
      return [{
        id: `${row.test_id}-${index + 1}`,
        material: row.fuel || "Unspecified",
        x: flow,
        y: spread,
        parameters: { airflow: flow, oxygen, thickness, finalOxygen, duration },
        details: [["Test", row.test_id], ["Airflow", `${pretty(flow)} cm/s`], ["Recorded spread rate", `${pretty(spread)} mm/s`], ["Sample thickness", `${row.thickness_mm} mm`], ["Initial oxygen", `${row.initial_oxygen_vol_pct} vol%`], ["Final oxygen", `${row.final_oxygen_vol_pct} vol%`], ["Flow direction", row.flow_direction], ["Burn duration", `${row.burn_duration_s} s`]],
      }];
    });
  });

  if (id === "psi10" || id === "psi159") return rows.flatMap((row) => {
    const rawOxygen = asNumber(id === "psi10" ? row["XO2 (init)"] : row["XO2 before test"]);
    const temperature = asNumber(row["Tad (K)"]);
    if (rawOxygen === null || temperature === null) return [];
    const oxygen = rawOxygen <= 1 ? rawOxygen * 100 : rawOxygen;
    const fuelFlow = asNumber(row[id === "psi10" ? "mfuel (mg/s)" : "mHC (mg/s)"]);
    const pressure = asNumber(row[id === "psi10" ? "pmean (atm)" : "approx p (bar)"]);
    const extra = asNumber(row[id === "psi10" ? "mtot (mg/s)" : "burn time (sec)"]);
    const fifth = asNumber(row[id === "psi10" ? "pinit (atm)" : "Zst"]);
    if (fuelFlow === null || pressure === null || extra === null || fifth === null) return [];
    return [{
      id: row.Test || `${row.Fuel}-record`,
      material: row.Fuel || "Unspecified",
      x: oxygen,
      y: temperature,
      parameters: id === "psi10"
        ? { oxygen, fuelFlow, pressure, totalFlow: extra, initialPressure: fifth }
        : { oxygen, fuelFlow, pressure, burnTime: extra, mixtureFraction: fifth },
      details: [["Test", row.Test ?? "—"], ["Fuel", row.Fuel ?? "—"], ["Measured table value", `${pretty(temperature)} K`], ["Initial oxygen", `${pretty(oxygen)}%`], [id === "psi10" ? "Fuel mass flow" : "Hydrocarbon mass flow", `${pretty(fuelFlow)} mg/s`], [id === "psi10" ? "Mean pressure" : "Approx. pressure", `${pretty(pressure)} ${id === "psi10" ? "atm" : "bar"}`], ...(id === "psi10" ? [["Total mass flow", `${pretty(extra)} mg/s`], ["Initial pressure", `${pretty(fifth)} atm`]] as [string, string][] : [["Burn time", `${pretty(extra)} s`], ["Stoichiometric mixture fraction (Zst)", pretty(fifth)], ["Hot ignition", row["Hot ignition"] || "Not recorded"]] as [string, string][])],
    }];
  });

  return [];
}

export default function FireLab() {
  const [studyId, setStudyId] = useState<StudyId>("bass2");
  const [chartType, setChartType] = useState<ChartType>("scatter");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [material, setMaterial] = useState("All materials");
  const [conditionTargets, setConditionTargets] = useState<Record<string, number>>({});
  const [responseConcept, setResponseConcept] = useState("None selected");
  const [exportError, setExportError] = useState("");
  const chartRef = useRef<SVGSVGElement>(null);
  const study = STUDIES.find((item) => item.id === studyId)!;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setRows([]);
    setMaterial("All materials");
    fetch(study.file)
      .then((response) => {
        if (!response.ok) throw new Error(`The source table could not be loaded (${response.status}).`);
        return response.text();
      })
      .then((csv) => { if (!cancelled) setRows(parseRows(csv)); })
      .catch((reason: unknown) => { if (!cancelled) setError(reason instanceof Error ? reason.message : "The source table could not be loaded."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [study.file]);

  const materials = useMemo(() => [...new Set(rows.map((row) => row.fuel || row["Fuel Sample Material"] || "Unspecified"))].sort(), [rows]);
  const visibleRows = useMemo(() => material === "All materials" ? rows : rows.filter((row) => (row.fuel || row["Fuel Sample Material"] || "Unspecified") === material), [rows, material]);
  const points = useMemo(() => measuredPoints(studyId, visibleRows), [studyId, visibleRows]);
  const parameterControls = SIM_PARAMETERS[studyId].flatMap((parameter) => {
    const values = points.map((point) => point.parameters[parameter.key]).filter(Number.isFinite);
    if (!values.length) return [];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const key = `${studyId}:${material}:${parameter.key}`;
    const initial = (min + max) / 2;
    const value = Math.max(min, Math.min(max, conditionTargets[key] ?? initial));
    return [{ ...parameter, min, max, value, targetKey: key }];
  });
  const sceneCandidates = points.filter((point) => parameterControls.every((control) => Number.isFinite(point.parameters[control.key])));
  const scenePoint = sceneCandidates.length && parameterControls.length
    ? sceneCandidates.reduce((best, candidate) => {
      const distance = (point: Point) => parameterControls.reduce((sum, control) => {
        const span = control.max - control.min || 1;
        return sum + ((point.parameters[control.key] - control.value) / span) ** 2;
      }, 0);
      return distance(candidate) < distance(best) ? candidate : best;
    })
    : undefined;
  const bounds = useMemo(() => {
    if (!points.length) return null;
    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);
    const [xmin, xmax] = [Math.min(...xs), Math.max(...xs)];
    const [ymin, ymax] = [Math.min(...ys), Math.max(...ys)];
    return { xmin, xmax, ymin, ymax, xspan: xmax - xmin || 1, yspan: ymax - ymin || 1 };
  }, [points]);
  const materialSummary = useMemo(() => {
    const groups = new Map<string, number[]>();
    points.forEach((point) => groups.set(point.material, [...(groups.get(point.material) ?? []), point.y]));
    return [...groups.entries()].map(([name, values]) => ({ name, count: values.length, mean: values.reduce((sum, value) => sum + value, 0) / values.length }));
  }, [points]);

  const downloadPython = () => {
    const code = pythonPlotCode(points, chartType, study, material);
    const url = URL.createObjectURL(new Blob([code], { type: "text/x-python;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `inflamiotic-${studyId}-${chartType}.py`; anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const downloadPdf = async () => {
    if (!chartRef.current) return;
    setExportError("");
    try {
      await downloadChartPdf(chartRef.current, `${study.name} - ${chartType} chart${material === "All materials" ? "" : ` - ${material}`}`, study.description);
    } catch (reason) {
      setExportError(reason instanceof Error ? reason.message : "Could not export this chart as a PDF.");
    }
  };

  return (
    <section aria-labelledby="fire-lab-title" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-orange-300">NASA evidence · Interactive data view</p>
          <h2 id="fire-lab-title" className="mt-1 font-serif text-3xl text-[#f3eee5]">Fire research, from the test tables</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Filter the supplied experimental records by study and material. Each plotted mark is a recorded result from the selected file; no values are estimated between tests.</p>
        </div>
        <span className="rounded-full border border-sky-300/25 bg-sky-300/5 px-3 py-1 text-xs text-sky-200">Observed values only</span>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.72fr_1.28fr]">
        <Card className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Choose a source table</h3>
          <label className="block text-sm text-slate-300">NASA investigation
            <select value={studyId} onChange={(event) => setStudyId(event.target.value as StudyId)} className="mt-2 block w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white">
              {STUDIES.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <label className="block text-sm text-slate-300">Fuel / material
            <select value={material} onChange={(event) => setMaterial(event.target.value)} disabled={loading || materials.length === 0} className="mt-2 block w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white disabled:opacity-50">
              <option>All materials</option>
              {materials.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Experimental context</p>
            <p className="mt-1 text-sm text-slate-200">{study.gravity}</p>
            <p className="mt-2 text-xs leading-5 text-slate-500">Gravity is shown as documented by the source context. These files do not provide a continuous gravity control or matched normal/microgravity pairs for a what-if calculation.</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-slate-800 p-3"><p className="text-[11px] text-slate-500">Source records</p><p className="mt-1 font-serif text-2xl text-white">{loading ? "…" : visibleRows.length}</p></div>
            <div className="rounded-xl border border-slate-800 p-3"><p className="text-[11px] text-slate-500">Plotted measurements</p><p className="mt-1 font-serif text-2xl text-white">{loading ? "…" : points.length}</p></div>
          </div>
          <a href={study.file} download className="inline-flex text-xs text-orange-300 hover:text-orange-200">Download selected source CSV ↗</a>
        </Card>

        <Card className="min-w-0 overflow-hidden border-sky-300/15 bg-[#0b1117]">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><p className="text-xs font-medium uppercase tracking-[0.14em] text-sky-300">Data view</p><h3 className="mt-1 text-lg font-semibold text-white">{chartType === "pie" ? "Record share by fuel / material" : chartType === "bar" ? `Mean ${study.y} by material` : `${study.y}${study.x ? ` by ${study.x.toLowerCase()}` : ""}`}</h3></div>
            <label className="text-xs text-slate-400">Chart form
              <select aria-label="Chart form" value={chartType} onChange={(event) => setChartType(event.target.value as ChartType)} className="ml-2 rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-2 text-xs text-white">
                <option value="scatter">Scatter plot</option><option value="line">Ordered line</option><option value="bar">Mean by material</option><option value="pie">Record share pie</option>
              </select>
            </label>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => void downloadPdf()} disabled={points.length === 0 || loading} className="rounded-full border border-orange-300/35 px-3 py-1.5 text-xs text-orange-200 transition hover:bg-orange-300/10 disabled:cursor-not-allowed disabled:opacity-40">Download chart PDF</button>
            <button type="button" onClick={downloadPython} disabled={points.length === 0 || loading} className="rounded-full border border-sky-300/35 px-3 py-1.5 text-xs text-sky-200 transition hover:bg-sky-300/10 disabled:cursor-not-allowed disabled:opacity-40">Download Matplotlib .py</button>
            {exportError && <span role="alert" className="self-center text-xs text-rose-300">{exportError}</span>}
          </div>
          {loading ? <p className="py-20 text-center text-sm text-slate-400">Loading the NASA table…</p> : error ? <p role="alert" className="py-20 text-center text-sm text-rose-300">{error}</p> : studyId === "psi26" ? (
            <div className="mt-5">
              <p className="mb-3 text-sm leading-6 text-slate-400">PSI-26 contains sample and test identifiers. It does not contain numeric flammability outcomes, so it is summarized here as an inventory rather than plotted as a burn result.</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{materials.filter((item) => material === "All materials" || item === material).map((item) => <div key={item} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3"><p className="text-sm text-slate-200">{item}</p><p className="mt-1 text-xs text-slate-500">{rows.filter((row) => (row["Fuel Sample Material"] || "Unspecified") === item).length} sample records</p></div>)}</div>
            </div>
          ) : points.length === 0 || !bounds ? <p className="py-20 text-center text-sm text-slate-400">No numeric outcomes for this material in the selected source table.</p> : (
            <div className="mt-3 overflow-x-auto">
              {chartType === "pie" ? (
                <svg ref={chartRef} viewBox="0 0 760 360" role="img" aria-label="Pie chart of source measurement records by fuel or material" className="data-chart h-auto min-w-[560px] w-full">
                  {(() => { let angle = -Math.PI / 2; const total = materialSummary.reduce((sum, group) => sum + group.count, 0); const cx = 245; const cy = 175; const radius = 132;
                    return <>{materialSummary.map((group, i) => { const next = angle + (group.count / total) * Math.PI * 2; const x1 = cx + radius * Math.cos(angle); const y1 = cy + radius * Math.sin(angle); const x2 = cx + radius * Math.cos(next); const y2 = cy + radius * Math.sin(next); const path = group.count === total ? "" : `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${next - angle > Math.PI ? 1 : 0} 1 ${x2} ${y2} Z`; angle = next; return group.count === total ? <circle key={group.name} cx={cx} cy={cy} r={radius} fill={CHART_COLORS[i % CHART_COLORS.length]}><title>{`${group.name}: ${group.count} records`}</title></circle> : <path key={group.name} d={path} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="#0b1117" strokeWidth="2"><title>{`${group.name}: ${group.count} records (${((group.count / total) * 100).toFixed(1)}%)`}</title></path>; })}{materialSummary.map((group, i) => <g key={`legend-${group.name}`}><circle cx="470" cy={76 + i * 30} r="5" fill={CHART_COLORS[i % CHART_COLORS.length]}/><text x="484" y={80 + i * 30} fill="#cbd5e1" fontSize="12">{group.name}: {group.count} ({((group.count / total) * 100).toFixed(1)}%)</text></g>)}</>;
                  })()}
                </svg>
              ) : chartType === "bar" ? (
                <svg ref={chartRef} viewBox="0 0 760 360" role="img" aria-label={`Bar chart of mean ${study.y} grouped by fuel or material`} className="data-chart h-auto min-w-[560px] w-full">
                  {(() => { const max = Math.max(...materialSummary.map((group) => group.mean), 1); return <>{[0, 1, 2, 3, 4].map((i) => { const y = 34 + i * 55; return <g key={i}><line x1="90" x2="730" y1={y} y2={y} stroke="#263544" strokeDasharray="3 5"/><text x="80" y={y + 4} textAnchor="end" fill="#94a3b8" fontSize="11">{pretty(max * (1 - i / 4))}</text></g>; })}{materialSummary.map((group, i) => { const band = 640 / materialSummary.length; const height = (group.mean / max) * 220; const x = 92 + i * band + band * 0.16; return <g key={group.name}><rect x={x} y={254 - height} width={band * 0.68} height={height} rx="4" fill={CHART_COLORS[i % CHART_COLORS.length]}><title>{`${group.name}: mean ${pretty(group.mean)} ${study.y}; ${group.count} records`}</title></rect><text x={x + band * 0.34} y="278" textAnchor="middle" fill="#cbd5e1" fontSize="10">{group.name.slice(0, 14)}</text></g>; })}<text x="410" y="330" textAnchor="middle" fill="#cbd5e1" fontSize="12">Fuel / material · {study.y}</text></>; })()}
                </svg>
              ) : (
                <svg ref={chartRef} viewBox="0 0 760 360" role="img" aria-label={`${chartType === "line" ? "Ordered line" : "Scatter"} chart of recorded ${study.y} by ${study.x}`} className="data-chart h-auto min-w-[560px] w-full">
                  {[0, 1, 2, 3, 4].map((i) => { const y = 34 + i * 62; const label = bounds.ymax - bounds.yspan * i / 4; return <g key={i}><line x1="84" x2="730" y1={y} y2={y} stroke="#263544" strokeDasharray="3 5"/><text x="74" y={y + 4} textAnchor="end" fill="#94a3b8" fontSize="11">{pretty(label)}</text></g>; })}
                  <line x1="84" x2="730" y1="282" y2="282" stroke="#64748b"/><line x1="84" x2="84" y1="34" y2="282" stroke="#64748b"/>
                  {[0, 1, 2, 3, 4].map((i) => { const x = 84 + i * 161.5; return <text key={i} x={x} y="303" textAnchor="middle" fill="#94a3b8" fontSize="11">{pretty(bounds.xmin + bounds.xspan * i / 4)}</text>; })}
                  <text x="407" y="342" textAnchor="middle" fill="#cbd5e1" fontSize="12">{study.x}</text><text transform="translate(18 157) rotate(-90)" textAnchor="middle" fill="#cbd5e1" fontSize="12">{study.y}</text>
                  {chartType === "line" && materialSummary.map((group, i) => <polyline key={group.name} points={points.filter((point) => point.material === group.name).sort((a, b) => a.x - b.x).map((point) => `${84 + ((point.x - bounds.xmin) / bounds.xspan) * 646},${282 - ((point.y - bounds.ymin) / bounds.yspan) * 248}`).join(" ")} fill="none" stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth="1.5" strokeOpacity=".7"/>)}
                  {points.map((point, i) => { const x = 84 + ((point.x - bounds.xmin) / bounds.xspan) * 646; const y = 282 - ((point.y - bounds.ymin) / bounds.yspan) * 248; return <circle key={`${point.id}-${i}`} cx={x} cy={y} r={chartType === "line" ? "3.5" : "4.5"} fill={CHART_COLORS[Math.max(0, materials.indexOf(point.material)) % CHART_COLORS.length]} fillOpacity=".82" stroke="#0b1117" strokeWidth="1.5"><title>{`${point.id} · ${point.material} · ${study.x}: ${pretty(point.x)} · ${study.y}: ${pretty(point.y)}`}</title></circle>; })}
                </svg>
              )}
              <p className="mt-2 border-t border-slate-800 pt-3 text-[11px] leading-5 text-slate-500">{chartType === "pie" ? "Pie slices show the share of plotted measurement records by material." : chartType === "bar" ? `Bars show the arithmetic mean of recorded ${study.y} values for each material; counts are shown on hover.` : chartType === "line" ? "Points are ordered by the x value and joined for visibility; the line is not a fitted model." : "Each mark is one observed source value; no fitted curve or interpolation."}</p>
            </div>
          )}
          <p className="mt-3 border-t border-slate-800 pt-3 text-xs leading-5 text-slate-500">{study.description}. Values are plotted from the supplied file; source test conditions vary and should be read with each record.</p>
          <details className="mt-3 border-t border-slate-800 pt-3 text-xs text-slate-400">
            <summary className="cursor-pointer hover:text-sky-200">View the Matplotlib code</summary>
            <pre className="mt-3 max-h-72 overflow-auto rounded-lg bg-slate-950 p-3 text-[11px] leading-5 text-slate-300">{points.length ? pythonPlotCode(points, chartType, study, material) : "Select a study with numeric measurements to generate code."}</pre>
          </details>
        </Card>
      </div>

      <Card className="overflow-hidden border-orange-300/20 bg-[#090e13] p-0">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative flex min-h-[340px] flex-col items-center justify-center overflow-hidden border-b border-slate-800 p-5 lg:border-b-0 lg:border-r">
            <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_82%,rgba(239,133,66,0.16),transparent_43%),radial-gradient(ellipse_at_50%_8%,rgba(64,114,145,0.13),transparent_55%)]" />
            {scenePoint ? (
              <>
                <div className="relative z-10 flex w-full justify-between text-[10px] uppercase tracking-[0.16em] text-slate-500"><span>{study.gravity}</span><span>{scenePoint.material}</span></div>
                <svg viewBox="0 0 300 250" role="img" aria-label={`Animated illustrative flame representing test ${scenePoint.id}, ${scenePoint.material}, in ${study.gravity} context`} className="relative z-10 h-[250px] w-full max-w-[360px] overflow-visible">
                  <defs>
                    <radialGradient id="live-flame-glow"><stop stopColor="#f4a261" stopOpacity=".34"/><stop offset="1" stopColor="#f4a261" stopOpacity="0"/></radialGradient>
                    <linearGradient id="live-flame-fill" x1="0" x2="0" y1="1" y2="0"><stop stopColor="#e8753d"/><stop offset=".65" stopColor="#f4a261"/><stop offset="1" stopColor="#fff0c4"/></linearGradient>
                  </defs>
                  <ellipse cx="150" cy="154" rx="106" ry="88" fill="url(#live-flame-glow)"/>
                  <g className="fire-simulator-flame" style={{ transformOrigin: "150px 194px" }}>
                    <path d="M150 24 C159 59 192 82 188 124 C185 160 170 188 150 194 C127 188 114 164 116 131 C117 99 141 71 150 24Z" fill="url(#live-flame-fill)" opacity=".92"/>
                    <path d="M151 104 C160 124 175 139 169 162 C165 178 157 188 148 190 C134 186 128 174 131 159 C133 146 144 132 140 119 C148 128 150 137 148 145 C156 136 156 120 151 104Z" fill="#fff0d0" opacity=".82"/>
                  </g>
                  <line x1="72" x2="228" y1="198" y2="198" stroke="#64748b" strokeOpacity=".55"/><rect x="126" y="199" width="48" height="10" rx="3" fill="#334155"/>
                  {responseConcept !== "None selected" && <path d="M82 152 C104 126 196 126 218 152" fill="none" stroke="#73c7d8" strokeWidth="2" strokeDasharray="5 6" opacity=".8"><title>Conceptual response marker; no measured performance shown</title></path>}
                </svg>
                <p className="relative z-10 -mt-1 rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1 text-[11px] text-slate-300">Closest recorded test: {scenePoint.id} · {responseConcept === "None selected" ? "no response concept" : `${responseConcept} · concept only`}</p>
              </>
            ) : <div className="relative z-10 max-w-xs text-center"><p className="text-sm font-medium text-slate-200">No flame result to animate for this selection</p><p className="mt-2 text-xs leading-5 text-slate-500">The selected source contains sample labels without measured flame outcomes.</p></div>}
            <p className="relative z-10 mt-3 max-w-sm text-center text-[11px] leading-5 text-slate-500">Animated schematic for orientation only. Shape and motion are not calculated from the measurements and do not predict flame behavior.</p>
          </div>

          <div className="p-5 sm:p-6">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-orange-300">Animated simulator · evidence-linked scene</p>
            <h3 className="mt-1 text-xl font-semibold text-white">Adjust recorded test conditions</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">Each slider stays within the selected table’s recorded range. Together they find the closest measured test; the site does not calculate an untested result.</p>
            {parameterControls.length > 0 ? <div className="mt-4 space-y-4">{parameterControls.map((control) => <label key={control.key} className="block text-xs text-slate-300">
              <span className="flex flex-wrap justify-between gap-1"><span>{control.label}</span><span className="tabular-nums text-sky-200">{pretty(control.value)} {control.unit}</span></span>
              <input aria-label={control.label} type="range" min={control.min} max={control.max === control.min ? control.min + 0.01 : control.max} step={Math.max((control.max - control.min) / 100, 0.001)} value={control.value} disabled={control.min === control.max} onChange={(event) => setConditionTargets((current) => ({ ...current, [control.targetKey]: Number(event.target.value) }))} className="mt-2 w-full accent-sky-300 disabled:opacity-40" />
              <span className="flex justify-between text-[10px] text-slate-600"><span>{pretty(control.min)} {control.unit}</span><span>{pretty(control.max)} {control.unit}</span></span>
            </label>)}</div> : <p className="mt-4 rounded-lg border border-slate-800 p-3 text-xs leading-5 text-slate-400">This file has no numeric flame measurements for condition sliders. Choose BASS-II, PSI-10, or PSI-159 to explore recorded parameters.</p>}
            <label className="mt-4 block text-sm text-slate-300">Fire-response concept (visual marker only)
              <select value={responseConcept} onChange={(event) => setResponseConcept(event.target.value)} className="mt-2 block w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white">
                {["None selected", "Gas displacement concept", "Cooling concept", "Surface barrier concept"].map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            {scenePoint && <div className="mt-4 grid gap-2 sm:grid-cols-2">{scenePoint.details.filter(([label]) => label !== "Test" && label !== "Fuel").map(([label, value]) => <div key={label} className="rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2"><p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p><p className="mt-1 text-sm tabular-nums text-slate-200">{value}</p></div>)}</div>}
            {scenePoint && <p className="mt-4 rounded-xl border border-sky-300/15 bg-sky-300/5 p-3 text-xs leading-5 text-slate-400">Closest match: test {scenePoint.id}, {scenePoint.material}. Its recorded values appear below. Your slider combination may not be an actual test; no interpolation or fire outcome is generated.</p>}
            <p className="mt-3 text-[11px] leading-5 text-slate-500">The gravity context follows the selected study rather than a continuous gravity slider; the files do not provide matched gravity values for a controlled comparison.</p>
          </div>
        </div>
      </Card>

      {studyId !== "psi26" && !loading && !error && (
        <Card>
          <div className="flex flex-wrap items-end justify-between gap-2"><div><p className="text-xs font-medium uppercase tracking-[0.14em] text-orange-300">Source observations</p><h3 className="mt-1 text-lg font-semibold text-white">Conditions behind the plotted points</h3></div><p className="text-xs text-slate-500">Showing up to 80 matching source records</p></div>
          <div className="mt-4 max-h-[430px] overflow-auto rounded-xl border border-slate-800">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="sticky top-0 bg-slate-950 text-slate-400"><tr><th className="px-3 py-2 font-medium">Test</th><th className="px-3 py-2 font-medium">Fuel / material</th><th className="px-3 py-2 font-medium">{study.x}</th><th className="px-3 py-2 font-medium">{study.y}</th><th className="px-3 py-2 font-medium">Other recorded conditions</th></tr></thead>
              <tbody className="divide-y divide-slate-800/80">{points.slice(0, 80).map((point, i) => <tr key={`${point.id}-${i}`} className="text-slate-300 hover:bg-slate-800/40"><td className="px-3 py-2 font-medium text-white">{point.id.split("-")[0]}</td><td className="px-3 py-2">{point.material}</td><td className="px-3 py-2 tabular-nums">{pretty(point.x)}</td><td className="px-3 py-2 tabular-nums">{pretty(point.y)}</td><td className="px-3 py-2 text-slate-400">{point.details.filter(([label]) => !["Test", "Fuel", "Measured table value", "Initial oxygen"].includes(label)).map(([label, value]) => `${label}: ${value}`).join(" · ") || "No additional fields in plotted view"}</td></tr>)}</tbody>
            </table>
          </div>
        </Card>
      )}

      <Card className="border-amber-300/15 bg-amber-300/[0.035]">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-amber-200">What the files say about materials and response</p>
        <p className="mt-2 text-sm leading-6 text-slate-300">The BASS and BASS-II summaries describe suppression as dependent on experimental context, including application position and geometry. The numerical BASS-II matrix shown above is a PMMA test matrix; it does not compare suppressant materials or establish a best option. This view therefore reports observed fuel-test data without ranking countermeasures.</p>
        <p className="mt-2 text-xs leading-5 text-slate-500">Source: nasa_psi_combustion_findings_v0.1.csv in the supplied project files. Treat the summary as study context; consult the original NASA publications for full methods and limits.</p>
      </Card>
    </section>
  );
}

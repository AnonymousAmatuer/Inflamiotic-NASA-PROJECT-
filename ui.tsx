import type { ReactNode } from "react";

export function Chip({
  children,
  active,
  onClick,
  tone = "slate",
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  tone?: "slate" | "orange" | "sky" | "emerald" | "violet";
}) {
  const tones: Record<string, string> = {
    slate: "border-slate-700 text-slate-300",
    orange: "border-orange-500/40 text-orange-300 bg-orange-500/10",
    sky: "border-sky-500/40 text-sky-300 bg-sky-500/10",
    emerald: "border-emerald-500/40 text-emerald-300 bg-emerald-500/10",
    violet: "border-violet-500/40 text-violet-300 bg-violet-500/10",
  };
  const base = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs";
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={`${base} transition ${
          active
            ? "border-cyan-300/50 bg-cyan-300/10 text-cyan-100"
            : "border-slate-700 text-slate-400 hover:border-cyan-300/35 hover:text-slate-200"
        }`}
      >
        {children}
      </button>
    );
  }
  return <span className={`${base} ${tones[tone]}`}>{children}</span>;
}

export function ScoreBar({
  label,
  value,
  max = 100,
  color = "#35d9ff",
}: {
  label: string;
  value: number;
  max?: number;
  color?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="min-w-0">
      <div className="mb-1 flex justify-between text-[11px] text-slate-400">
        <span>{label}</span>
        <span className="tabular-nums text-slate-300">{Math.round(value)}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`panel-card rounded-2xl border border-slate-800 bg-slate-900/70 p-5 ${className}`}>
      {children}
    </div>
  );
}

export function fmtRange(min: number, max: number, unit: string) {
  return min === max ? `${min} ${unit}` : `${min}–${max} ${unit}`;
}

export function gravityLabel(g: string) {
  switch (g) {
    case "micro":
      return "Microgravity (~0 g)";
    case "partial":
      return "Partial gravity (0.16–0.38 g)";
    case "micro+partial":
      return "Micro + partial gravity";
    default:
      return "Normal gravity (1 g)";
  }
}

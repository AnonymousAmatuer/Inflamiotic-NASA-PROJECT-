"use client";

import { useState } from "react";
import Link from "next/link";
import type { Investigation } from "@/lib/seed-data";
import { ENVIRONMENTS, type EnvKey } from "@/lib/knowledge";
import { fmtRange, gravityLabel } from "./ui";

const W = 720;
const H = 420;
const M = { l: 56, r: 16, t: 16, b: 46 };
const X_MAX = 55;
const Y_MIN = 30;
const Y_MAX = 150;

const sx = (v: number) => M.l + (Math.min(v, X_MAX) / X_MAX) * (W - M.l - M.r);
const sy = (v: number) =>
  H - M.b - ((Math.min(Math.max(v, Y_MIN), Y_MAX) - Y_MIN) / (Y_MAX - Y_MIN)) * (H - M.t - M.b);

export default function AtmosphereMap({
  list,
  selectedEnvs,
}: {
  list: Investigation[];
  selectedEnvs: EnvKey[];
}) {
  const [active, setActive] = useState<string | null>(null);
  const sel = list.find((i) => i.slug === active) ?? null;
  const xTicks = [0, 10, 20, 30, 40, 50];
  const yTicks = [30, 50, 70, 90, 110, 130, 150];

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="panel-card rounded-2xl border p-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="data-chart w-full" role="img" aria-label="Atmosphere coverage map: oxygen versus pressure">
          {xTicks.map((t) => (
            <g key={`x${t}`}>
              <line x1={sx(t)} x2={sx(t)} y1={M.t} y2={H - M.b} stroke="#1e293b" />
              <text x={sx(t)} y={H - M.b + 16} textAnchor="middle" fontSize="11" fill="#94a3b8">
                {t}
              </text>
            </g>
          ))}
          {yTicks.map((t) => (
            <g key={`y${t}`}>
              <line x1={M.l} x2={W - M.r} y1={sy(t)} y2={sy(t)} stroke="#1e293b" />
              <text x={M.l - 8} y={sy(t) + 4} textAnchor="end" fontSize="11" fill="#94a3b8">
                {t}
              </text>
            </g>
          ))}
          <text x={(W + M.l) / 2} y={H - 8} textAnchor="middle" fontSize="12" fill="#cbd5e1">
            Oxygen concentration (% by volume)
          </text>
          <text
            transform={`translate(14 ${H / 2}) rotate(-90)`}
            textAnchor="middle"
            fontSize="12"
            fill="#cbd5e1"
          >
            Total pressure (kPa)
          </text>

          {list.map((i) => {
            const x1 = sx(i.o2Min);
            const x2 = Math.max(sx(i.o2Max), x1 + 4);
            const y1 = sy(i.pMax);
            const y2 = Math.max(sy(i.pMin), y1 + 4);
            const on = active === i.slug;
            return (
              <rect
                key={i.slug}
                x={x1}
                y={y1}
                width={x2 - x1}
                height={y2 - y1}
                rx={3}
                fill="#35d9ff"
                fillOpacity={on ? 0.45 : 0.08}
                stroke={on ? "#d8f5ff" : "#35d9ff"}
                strokeOpacity={on ? 1 : 0.35}
                strokeWidth={on ? 2 : 1}
                className="cursor-pointer"
                onClick={() => setActive(on ? null : i.slug)}
              >
                <title>{`${i.acronym}: ${fmtRange(i.o2Min, i.o2Max, "% O₂")}, ${fmtRange(i.pMin, i.pMax, "kPa")}`}</title>
              </rect>
            );
          })}

          {ENVIRONMENTS.map((e, idx) => {
            const dim = selectedEnvs.length > 0 && !selectedEnvs.includes(e.key);
            const x1 = sx(e.o2[0]);
            const x2 = sx(e.o2[1]);
            const y1 = sy(e.p[1]);
            const y2 = sy(e.p[0]);
            return (
              <g key={e.key} opacity={dim ? 0.25 : 1} pointerEvents="none">
                <rect
                  x={x1}
                  y={y1}
                  width={x2 - x1}
                  height={y2 - y1}
                  fill={e.color}
                  fillOpacity={0.12}
                  stroke={e.color}
                  strokeWidth={2}
                  strokeDasharray="5 3"
                />
                <text
                  x={x2 + 4}
                  y={y1 + 12 + (idx % 3) * 12}
                  fontSize="11"
                  fontWeight={600}
                  fill={e.color}
                >
                  {e.short}
                </text>
              </g>
            );
          })}
        </svg>
        <p className="px-2 pb-1 text-xs text-slate-500">
          Dashed boxes: planned or actual cabin atmospheres. Orange boxes: tested envelopes (approximate). Axes are clamped at 55% O₂ and 150 kPa. Click a box for details.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm">
        {sel ? (
          <>
            <p className="text-xs uppercase tracking-wider text-orange-300">Selected</p>
            <h4 className="mt-1 text-lg font-semibold text-white">{sel.acronym}</h4>
            <p className="mt-1 text-slate-400">{sel.title}</p>
            <dl className="mt-3 space-y-1 text-slate-300">
              <div>
                <dt className="inline text-slate-500">Oxygen: </dt>
                <dd className="inline">{fmtRange(sel.o2Min, sel.o2Max, "%")}</dd>
              </div>
              <div>
                <dt className="inline text-slate-500">Pressure: </dt>
                <dd className="inline">{fmtRange(sel.pMin, sel.pMax, "kPa")}</dd>
              </div>
              <div>
                <dt className="inline text-slate-500">Flow: </dt>
                <dd className="inline">
                  {sel.flowMin === null || sel.flowMax === null ? "n/a" : fmtRange(sel.flowMin, sel.flowMax, "cm/s")}
                </dd>
              </div>
              <div>
                <dt className="inline text-slate-500">Gravity: </dt>
                <dd className="inline">{gravityLabel(sel.gravity)}</dd>
              </div>
            </dl>
            <Link
              href={`/investigation/${sel.slug}`}
              className="mt-4 inline-block text-orange-300 hover:text-orange-200"
            >
              Open full briefing →
            </Link>
          </>
        ) : (
          <>
            <p className="text-xs uppercase tracking-wider text-slate-500">How to read</p>
            <p className="mt-2 text-slate-300">
              Where an orange envelope overlaps a dashed cabin box, the investigation tested conditions relevant to that environment. Most orange boxes cover ISS-like air; few cover 26–34% O₂ at 56–70 kPa.
            </p>
            <p className="mt-3 text-slate-400">
              Gravity matters too: surface habitats sit at 0.16 g or 0.38 g, where little long-duration data exists.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

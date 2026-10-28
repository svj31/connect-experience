"use client";

import { useState } from "react";

/**
 * Small SVG charts. Single series use one hue; the two series chart uses the validated
 * violet and rose pair with a legend and direct hover values. Every chart has a table view
 * for screen readers.
 */
export function BarChart({ data, label, height = 160, valueSuffix = "" }: { data: { label: string; value: number; long?: string }[]; label: string; height?: number; valueSuffix?: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const w = 100 / data.length;
  return (
    <figure className="m-0">
      <div className="relative" style={{ height }}>
        <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="h-full w-full overflow-visible" aria-hidden="true">
          {[0.5, 1].map((g) => <line key={g} x1="0" x2="100" y1={height - (height - 18) * g} y2={height - (height - 18) * g} stroke="var(--line)" strokeWidth="0.3" vectorEffect="non-scaling-stroke" />)}
          {data.map((d, i) => {
            const h = (d.value / max) * (height - 18);
            return (
              <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                <rect x={i * w} y="0" width={w} height={height} fill="transparent" />
                <rect x={i * w + w * 0.18} y={height - Math.max(h, d.value ? 2 : 0)} width={w * 0.64} height={Math.max(h, d.value ? 2 : 0)} rx="1.2" fill="var(--chart-1)" opacity={hover === null || hover === i ? 1 : 0.45} />
              </g>
            );
          })}
        </svg>
        {hover !== null && (
          <div className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-line-strong bg-surface px-2 py-1 text-xs font-bold whitespace-nowrap shadow-[var(--shadow)]" style={{ left: `${(hover + 0.5) * w}%` }}>
            {data[hover].long ?? data[hover].label}: {data[hover].value}{valueSuffix}
          </div>
        )}
      </div>
      <div className="mt-1.5 flex text-[10px] font-semibold text-muted">
        {data.map((d, i) => <span key={i} className="truncate text-center" style={{ width: `${w}%` }}>{data.length > 14 && i % 3 ? "" : d.label}</span>)}
      </div>
      <table className="sr-only">
        <caption>{label}</caption>
        <tbody>{data.map((d, i) => <tr key={i}><th>{d.long ?? d.label}</th><td>{d.value}</td></tr>)}</tbody>
      </table>
    </figure>
  );
}

export function HBarChart({ data, label }: { data: { label: string; value: number }[]; label: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <figure className="m-0">
      <ul className="space-y-2.5" aria-label={label}>
        {data.map((d) => (
          <li key={d.label} className="grid grid-cols-[minmax(0,8rem)_1fr_2.5rem] items-center gap-2 text-sm" title={`${d.label}: ${d.value}`}>
            <span className="truncate font-semibold">{d.label}</span>
            <span className="h-3 overflow-hidden rounded-r-[4px] bg-transparent"><span className="block h-full rounded-r-[4px] bg-[var(--chart-1)] transition-all duration-700" style={{ width: `${(d.value / max) * 100}%` }} /></span>
            <span className="text-right text-muted tabular-nums">{d.value}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

export function PairBars({ data, a, b, label }: { data: { label: string; a: number; b: number }[]; a: string; b: string; label: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.flatMap((d) => [d.a, d.b]));
  const H = 120;
  return (
    <figure className="m-0">
      <div className="mb-2 flex gap-4 text-xs font-semibold text-muted">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[var(--chart-1)]" />{a}</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[var(--chart-2)]" />{b}</span>
      </div>
      <div className="relative flex items-end gap-2" style={{ height: H }}>
        {data.map((d, i) => (
          <div key={i} className="relative flex h-full flex-1 items-end justify-center gap-[2px]" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <span className="w-1/3 rounded-t-[4px] bg-[var(--chart-1)] transition-all duration-700" style={{ height: `${Math.max((d.a / max) * 100, d.a ? 3 : 0)}%` }} />
            <span className="w-1/3 rounded-t-[4px] bg-[var(--chart-2)] transition-all duration-700" style={{ height: `${Math.max((d.b / max) * 100, d.b ? 3 : 0)}%` }} />
            {hover === i && (
              <span className="absolute -top-2 z-10 -translate-y-full rounded-lg border border-line-strong bg-surface px-2 py-1 text-xs font-bold whitespace-nowrap shadow-[var(--shadow)]">
                {d.label}: {d.a} {a.toLowerCase()}, {d.b} {b.toLowerCase()}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-2 text-[11px] font-semibold text-muted">{data.map((d, i) => <span key={i} className="flex-1 text-center">{d.label}</span>)}</div>
      <table className="sr-only">
        <caption>{label}</caption>
        <thead><tr><th>Day</th><th>{a}</th><th>{b}</th></tr></thead>
        <tbody>{data.map((d, i) => <tr key={i}><th>{d.label}</th><td>{d.a}</td><td>{d.b}</td></tr>)}</tbody>
      </table>
    </figure>
  );
}

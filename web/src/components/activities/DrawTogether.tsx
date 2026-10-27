"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { ActionError, Panel, useAction, type ActivityProps } from "./shared";

interface Stroke {
  id: number;
  uid: number;
  color: string;
  size: number;
  points: [number, number][];
}

const COLOR_NAMES: Record<string, string> = {
  "#1f1d1a": "Ink", "#c2452d": "Coral", "#1e6b66": "Teal", "#d99a1e": "Sun", "#3d7a3a": "Leaf", "#2f5f9e": "Sky", "#ffffff": "Eraser white",
};

export function paintStrokes(ctx: CanvasRenderingContext2D, strokes: Stroke[], width: number, height: number) {
  for (const s of strokes) {
    ctx.strokeStyle = s.color;
    ctx.fillStyle = s.color;
    ctx.lineWidth = (s.size * width) / 800;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (s.points.length === 1) {
      const [x, y] = s.points[0];
      ctx.beginPath();
      ctx.arc(x * width, y * height, ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }
    ctx.beginPath();
    s.points.forEach(([x, y], i) => (i ? ctx.lineTo(x * width, y * height) : ctx.moveTo(x * width, y * height)));
    ctx.stroke();
  }
}

export function DrawTogether({ game, me, act }: ActivityProps) {
  const { run, error, busy } = useAction(act);
  const canvas = useRef<HTMLCanvasElement>(null);
  const current = useRef<[number, number][] | null>(null);
  const [color, setColor] = useState<string>("#1f1d1a");
  const [size, setSize] = useState(6);
  const [savedNote, setSavedNote] = useState(false);
  const strokes: Stroke[] = game.strokes;

  const redraw = useCallback(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const { width, height } = el;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    paintStrokes(ctx, strokes, width, height);
    if (current.current) paintStrokes(ctx, [{ id: 0, uid: me, color, size, points: current.current }], width, height);
  }, [strokes, me, color, size]);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const resize = () => {
      const rect = el.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      el.width = Math.round(rect.width * ratio);
      el.height = Math.round(rect.height * ratio);
      redraw();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    return () => observer.disconnect();
  }, [redraw]);

  function point(e: PointerEvent<HTMLCanvasElement>): [number, number] {
    const rect = e.currentTarget.getBoundingClientRect();
    return [(e.clientX - rect.left) / rect.width, (e.clientY - rect.top) / rect.height];
  }

  function down(e: PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    current.current = [point(e)];
    redraw();
  }
  function move(e: PointerEvent<HTMLCanvasElement>) {
    if (!current.current || current.current.length >= 600) return;
    current.current.push(point(e));
    redraw();
  }
  function up() {
    const points = current.current;
    current.current = null;
    if (points?.length) void run({ type: "stroke", points, color, size });
  }

  async function save() {
    if (await run({ type: "save" })) {
      setSavedNote(true);
      setTimeout(() => setSavedNote(false), 2500);
    }
  }

  return (
    <Panel title="Draw Together" subtitle="You both draw on the same canvas, live.">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="flex gap-1.5" role="radiogroup" aria-label="Pen color">
          {(game.colors as string[]).map((c) => (
            <button
              key={c}
              role="radio"
              aria-checked={color === c}
              aria-label={COLOR_NAMES[c] ?? c}
              onClick={() => setColor(c)}
              className={`h-8 w-8 rounded-md border-2 ${color === c ? "border-ink ring-2 ring-ink/20" : "border-line-strong"}`}
              style={{ background: c }}
            />
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold">
          Size
          <input type="range" min={2} max={24} value={size} onChange={(e) => setSize(Number(e.target.value))} className="accent-coral" />
        </label>
      </div>
      <canvas
        ref={canvas}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        className="aspect-[4/3] w-full cursor-crosshair touch-none rounded-lg border border-line-strong bg-white"
        role="img"
        aria-label={`Shared drawing canvas with ${strokes.length} strokes`}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={() => run({ type: "undo" })}><Icon name="undo" size={16} /> Undo mine</Button>
        <Button variant="secondary" size="sm" onClick={() => run({ type: "clear" })}><Icon name="trash" size={16} /> Clear</Button>
        <Button size="sm" onClick={save} loading={busy}><Icon name="save" size={16} /> Save to moments</Button>
        {savedNote && <span className="self-center text-sm font-semibold text-teal" role="status">Saved</span>}
      </div>
      <ActionError message={error} />
    </Panel>
  );
}

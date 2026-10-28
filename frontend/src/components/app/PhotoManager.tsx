"use client";

/* eslint-disable @next/next/no-img-element -- member uploads are data URLs */
import { useRef, useState } from "react";
import { Icon } from "../ui/Icon";

const MAX_PHOTOS = 6;
const MAX_SIDE = 900;

/** Shrinks a picked image to at most 900 px on its long side as a JPEG data URL, so uploads stay small. */
async function resize(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("That file is not an image we can read"));
      el.src = url;
    });
    const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.82);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Six photo slots like every dating app: the first is your main photo. */
export function PhotoManager({ photos, onChange, error }: { photos: string[]; onChange: (next: string[]) => void; error?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [problem, setProblem] = useState<string | null>(null);

  async function add(files: FileList | null) {
    if (!files?.length) return;
    setProblem(null);
    const room = MAX_PHOTOS - photos.length;
    try {
      const next = await Promise.all([...files].slice(0, room).filter((f) => f.type.startsWith("image/")).map(resize));
      onChange([...photos, ...next]);
    } catch (e) {
      setProblem(e instanceof Error ? e.message : "Could not add that photo");
    }
    if (input.current) input.current.value = "";
  }

  return (
    <div>
      <ul className="grid grid-cols-3 gap-3">
        {Array.from({ length: MAX_PHOTOS }, (_, i) => {
          const src = photos[i];
          return (
            <li key={i} className={`relative aspect-[3/4] overflow-hidden rounded-2xl ${src ? "bg-paper-deep" : "border-2 border-dashed border-line-strong bg-paper-deep"}`}>
              {src ? (
                <>
                  <img src={src} alt={i === 0 ? "Your main photo" : `Photo ${i + 1}`} className="h-full w-full object-cover" />
                  {i === 0 && <span className="bg-brand absolute top-2 left-2 rounded-full px-2 py-0.5 text-[11px] font-extrabold">Main</span>}
                  <div className="absolute right-2 bottom-2 flex gap-1.5">
                    {i > 0 && (
                      <button type="button" onClick={() => onChange([src, ...photos.filter((_, j) => j !== i)])} className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#111] shadow" aria-label={`Make photo ${i + 1} your main photo`} title="Make main">
                        <Icon name="star" size={15} />
                      </button>
                    )}
                    <button type="button" onClick={() => onChange(photos.filter((_, j) => j !== i))} className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#c42020] shadow" aria-label={`Remove photo ${i + 1}`} title="Remove">
                      <Icon name="close" size={15} />
                    </button>
                  </div>
                </>
              ) : (
                <button type="button" onClick={() => input.current?.click()} className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted hover:text-violet" aria-label="Add a photo">
                  <span className="bg-brand flex h-9 w-9 items-center justify-center rounded-full"><Icon name="plus" size={18} /></span>
                  {i === photos.length && <span className="text-xs font-bold">Add</span>}
                </button>
              )}
            </li>
          );
        })}
      </ul>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => add(e.target.files)} />
      <p className="mt-3 text-sm text-muted">Clear, recent photos of you get more matches. No photo yet? Your planet avatar stands in.</p>
      {(problem || error) && <p role="alert" className="mt-1 text-sm font-semibold text-danger">{problem ?? error}</p>}
    </div>
  );
}

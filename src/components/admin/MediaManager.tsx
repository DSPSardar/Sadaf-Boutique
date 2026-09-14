"use client";

import { useRef, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Play, Trash2, Upload } from "lucide-react";
import { cn } from "@/lib/cn";
import { mediaBase } from "@/lib/media";
import type { ProductMediaRow } from "@/lib/supabase/types";
import { deleteMedia, reorderMedia, setVideoPoster, updateMediaAlt } from "@/app/(admin)/admin/(panel)/actions";
import { Button } from "@/components/ui/Button";

interface Upload {
  id: string;
  name: string;
  progress: number;
  error?: string;
}

/** Photo/video uploads with progress, ordering (first = primary), alt text, video poster and delete. */
export function MediaManager({ productId, initial }: { productId: string; initial: ProductMediaRow[] }) {
  const [media, setMedia] = useState<ProductMediaRow[]>(initial);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [pending, start] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const images = media.filter((m) => m.kind === "image").sort((a, b) => a.sort_order - b.sort_order);
  const video = media.find((m) => m.kind === "video");

  function upload(file: File) {
    const id = `${Date.now()}-${file.name}`;
    setUploads((u) => [...u, { id, name: file.name, progress: 0 }]);
    const form = new FormData();
    form.append("productId", productId);
    form.append("file", file);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/media");
    xhr.upload.onprogress = (e) => e.lengthComputable && setUploads((u) => u.map((x) => (x.id === id ? { ...x, progress: Math.round((e.loaded / e.total) * 100) } : x)));
    xhr.onload = () => {
      try {
        const body = JSON.parse(xhr.responseText);
        if (xhr.status >= 400) throw new Error(body.error ?? "Upload failed");
        setMedia((m) => [...m, body.media as ProductMediaRow]);
        setUploads((u) => u.filter((x) => x.id !== id));
      } catch (e) {
        setUploads((u) => u.map((x) => (x.id === id ? { ...x, error: e instanceof Error ? e.message : "Upload failed" } : x)));
      }
    };
    xhr.onerror = () => setUploads((u) => u.map((x) => (x.id === id ? { ...x, error: "Network error" } : x)));
    xhr.send(form);
  }

  function handleFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((f) => {
      if (f.type === "video/mp4" && video) {
        setUploads((u) => [...u, { id: `${Date.now()}-${f.name}`, name: f.name, progress: 0, error: "Delete the existing video first" }]);
        return;
      }
      upload(f);
    });
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...images];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    const reordered = next.map((m, i) => ({ ...m, sort_order: i }));
    setMedia([...reordered, ...(video ? [video] : [])]);
    start(() => reorderMedia(productId, reordered.map((m) => m.id)));
  }

  function makePrimary(index: number) {
    const next = [images[index], ...images.filter((_, i) => i !== index)].map((m, i) => ({ ...m, sort_order: i }));
    setMedia([...next, ...(video ? [video] : [])]);
    start(() => reorderMedia(productId, next.map((m) => m.id)));
  }

  function remove(m: ProductMediaRow) {
    if (!window.confirm("Remove this file from the product?")) return;
    setMedia((list) => list.filter((x) => x.id !== m.id));
    start(() => deleteMedia(m.id));
  }

  return (
    <section className="space-y-4 rounded-xs border border-hairline bg-surface p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[12px] font-medium uppercase tracking-[0.14em]">Photos & video</h2>
        <span className="text-[12px] text-muted">{images.length} photos{video ? " · 1 video" : ""}</span>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn("flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xs border border-dashed px-4 py-8 text-center transition-colors", dragOver ? "border-ink bg-sand" : "border-hairline hover:border-ink")}
      >
        <Upload size={20} strokeWidth={1.5} className="text-muted" />
        <p className="text-sm">Drop photos or an MP4 here, or click to choose</p>
        <p className="text-[12px] text-muted">JPG, PNG or WebP up to 15 MB · MP4 up to 25 MB. Renditions are generated automatically.</p>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,video/mp4" multiple className="sr-only" onChange={(e) => handleFiles(e.target.files)} />
      </div>

      {uploads.length ? (
        <ul className="space-y-2">
          {uploads.map((u) => (
            <li key={u.id} className="text-[12px]">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate">{u.name}</span>
                {u.error ? (
                  <button type="button" onClick={() => setUploads((list) => list.filter((x) => x.id !== u.id))} className="text-oxblood">
                    {u.error} · dismiss
                  </button>
                ) : (
                  <span className="text-muted">{u.progress < 100 ? `${u.progress}%` : "Processing…"}</span>
                )}
              </div>
              {!u.error ? (
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-sand">
                  <div className={cn("h-full bg-ink transition-[width]", u.progress >= 100 && "animate-pulse")} style={{ width: `${u.progress}%` }} />
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {images.length ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((m, i) => (
            <li key={m.id} className="space-y-2">
              <div className="relative aspect-[4/5] overflow-hidden rounded-xs bg-sand">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${mediaBase(m.storage_path)}/card-400.webp`} alt={m.alt} className="h-full w-full object-cover" />
                {i === 0 ? <span className="absolute top-1.5 left-1.5 rounded-xs bg-ink px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ivory">Primary</span> : null}
                <div className="absolute right-1.5 bottom-1.5 flex gap-1">
                  <IconBtn label="Move up" onClick={() => move(i, -1)} disabled={i === 0 || pending}><ArrowUp size={13} /></IconBtn>
                  <IconBtn label="Move down" onClick={() => move(i, 1)} disabled={i === images.length - 1 || pending}><ArrowDown size={13} /></IconBtn>
                  <IconBtn label="Delete photo" onClick={() => remove(m)} disabled={pending}><Trash2 size={13} /></IconBtn>
                </div>
              </div>
              <input
                aria-label="Alt text"
                defaultValue={m.alt}
                placeholder="Alt text"
                onBlur={(e) => e.target.value !== m.alt && start(() => updateMediaAlt(m.id, e.target.value))}
                className="h-8 w-full rounded-xs border border-hairline px-2 text-[12px] outline-none focus:border-ink"
              />
              {i !== 0 ? (
                <button type="button" onClick={() => makePrimary(i)} disabled={pending} className="text-[11px] underline underline-offset-4 disabled:opacity-50">
                  Make primary
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">No photos yet. The first photo you add becomes the card image.</p>
      )}

      {video ? (
        <div className="flex items-start gap-3 rounded-xs border border-hairline p-3">
          <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xs bg-sand">
            <video src={`${mediaBase(video.storage_path)}/video.mp4`} muted playsInline preload="metadata" className="h-full w-full object-cover" />
            <span className="absolute inset-0 flex items-center justify-center bg-ink/30 text-ivory">
              <Play size={14} className="fill-current" />
            </span>
          </div>
          <div className="min-w-0 flex-1 space-y-2 text-sm">
            <p className="font-medium">Preview video</p>
            <label className="flex items-center gap-2 text-[12px] text-muted">
              Poster
              <select
                defaultValue={video.poster_media_id ?? ""}
                onChange={(e) => start(() => setVideoPoster(video.id, e.target.value || null))}
                className="h-8 rounded-xs border border-hairline bg-surface px-2 text-[12px] text-ink"
              >
                <option value="">Primary photo</option>
                {images.map((m, i) => (
                  <option key={m.id} value={m.id}>
                    Photo {i + 1}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <Button size="sm" variant="ghost" onClick={() => remove(video)} disabled={pending} aria-label="Delete video">
            <Trash2 size={14} />
          </Button>
        </div>
      ) : null}
    </section>
  );
}

function IconBtn({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} disabled={disabled} className="flex h-7 w-7 items-center justify-center rounded-full bg-surface/90 text-ink transition-colors hover:bg-surface disabled:opacity-40">
      {children}
    </button>
  );
}

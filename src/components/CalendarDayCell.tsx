"use client";

import { useEffect, useState } from "react";
import { getPhotosForDate } from "@/lib/db";
import { parseDateKey } from "@/lib/dateKey";
import { MoonPhaseBackdrop } from "@/components/MoonPhaseBackdrop";

type Props = {
  dateKey: string;
  hasPhoto: boolean;
  blobVersion: number;
  onOpenPhoto: (dateKey: string) => void;
};

export function CalendarDayCell({
  dateKey,
  hasPhoto,
  blobVersion,
  onOpenPhoto,
}: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const dayNum = parseDateKey(dateKey).getDate();

  useEffect(() => {
    if (!hasPhoto) return;
    let cancelled = false;
    let objectUrl: string | null = null;
    void (async () => {
      const records = await getPhotosForDate(dateKey);
      if (cancelled) return;
      if (!records.length) {
        setUrl(null);
        setCount(0);
        return;
      }
      setCount(records.length);
      const latest = records[0]!;
      objectUrl = URL.createObjectURL(latest.blob);
      setUrl(objectUrl);
    })();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [dateKey, hasPhoto, blobVersion]);

  const base =
    "relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl text-sm transition-colors";

  if (hasPhoto && url) {
    return (
      <button
        type="button"
        onClick={() => onOpenPhoto(dateKey)}
        className={`${base} bg-zinc-900 ring-1 ring-zinc-700 active:ring-amber-400/60`}
        aria-label={`${parseDateKey(dateKey).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" })}の写真を拡大`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <span className="relative z-[1] mt-auto self-end rounded bg-black/55 px-1 py-0.5 text-[10px] font-medium tabular-nums text-white">
          {dayNum}
        </span>
        {count > 1 && (
          <span className="absolute left-1 top-1 z-[1] rounded bg-amber-500/90 px-1 py-0.5 text-[9px] font-semibold tabular-nums text-zinc-950">
            {count}
          </span>
        )}
      </button>
    );
  }

  if (hasPhoto && !url) {
    return (
      <div
        className={`${base} bg-zinc-900 ring-1 ring-zinc-800`}
        aria-busy
      >
        <span className="text-xs text-zinc-500">{dayNum}</span>
      </div>
    );
  }

  return (
    <div
      className={`${base} bg-zinc-900/50 ring-1 ring-zinc-800/60 text-2xl font-extralight tabular-nums text-zinc-100`}
      aria-label={`未撮影 ${dateKey}（背景はその日の想定の月の位相）`}
    >
      <MoonPhaseBackdrop
        dateKey={dateKey}
        className="pointer-events-none absolute inset-0 m-auto h-[88%] w-[88%] opacity-[0.38]"
      />
      <span className="relative z-[1] drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]">
        {dayNum}
      </span>
    </div>
  );
}

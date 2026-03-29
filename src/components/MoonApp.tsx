"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { CaptureView } from "@/components/CaptureView";
import { CalendarMonthView } from "@/components/CalendarMonthView";
import { PhotoDayModal } from "@/components/PhotoDayModal";
import { formatDateKey } from "@/lib/dateKey";
import { getAllPhotoDateKeys } from "@/lib/db";

function computeStreak(photoSet: Set<string>): number {
  const anchor = new Date();
  anchor.setHours(12, 0, 0, 0);
  let key = formatDateKey(anchor);
  if (!photoSet.has(key)) {
    anchor.setDate(anchor.getDate() - 1);
    key = formatDateKey(anchor);
  }
  let count = 0;
  const cur = new Date(anchor);
  cur.setHours(12, 0, 0, 0);
  for (;;) {
    key = formatDateKey(cur);
    if (!photoSet.has(key)) break;
    count += 1;
    cur.setDate(cur.getDate() - 1);
  }
  return count;
}

type Tab = "capture" | "calendar";

function useClientReady() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function MoonApp() {
  const mounted = useClientReady();
  const [tab, setTab] = useState<Tab>("capture");
  const [photoDates, setPhotoDates] = useState<string[]>([]);
  const [blobVersion, setBlobVersion] = useState(0);
  const [modalDateKey, setModalDateKey] = useState<string | null>(null);

  const refreshIndex = useCallback(async () => {
    const keys = await getAllPhotoDateKeys();
    setPhotoDates(keys);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    const id = window.setTimeout(() => {
      if (!cancelled) void refreshIndex();
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [mounted, refreshIndex]);

  useEffect(() => {
    if (!mounted) return;
    const onVis = () => {
      if (document.visibilityState === "visible") {
        window.setTimeout(() => void refreshIndex(), 0);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [mounted, refreshIndex]);

  const onPhotoSaved = useCallback(async () => {
    await refreshIndex();
    setBlobVersion((v) => v + 1);
  }, [refreshIndex]);

  if (!mounted) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-zinc-400">
        読み込み中…
      </div>
    );
  }

  const photoSet = new Set(photoDates);
  const streak = computeStreak(photoSet);

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-md flex-col">
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {tab === "capture" ? (
          <CaptureView streak={streak} onPhotoSaved={onPhotoSaved} />
        ) : (
          <CalendarMonthView
            photoDateSet={photoSet}
            blobVersion={blobVersion}
            onOpenPhoto={setModalDateKey}
          />
        )}
      </main>

      <nav
        className="flex shrink-0 border-t border-zinc-800/90 bg-zinc-950/95 pb-[max(calc(0.5rem*3),env(safe-area-inset-bottom))] pt-[calc(0.25rem*3)] backdrop-blur supports-[backdrop-filter]:bg-zinc-950/80"
        aria-label="メイン"
      >
        <button
          type="button"
          onClick={() => setTab("capture")}
          className={`flex flex-1 flex-col items-center justify-center gap-1 py-[calc(0.75rem*3)] text-sm font-medium transition-colors ${
            tab === "capture"
              ? "text-amber-400"
              : "text-zinc-500 active:text-zinc-300"
          }`}
        >
          撮影
        </button>
        <button
          type="button"
          onClick={() => setTab("calendar")}
          className={`flex flex-1 flex-col items-center justify-center gap-1 py-[calc(0.75rem*3)] text-sm font-medium transition-colors ${
            tab === "calendar"
              ? "text-amber-400"
              : "text-zinc-500 active:text-zinc-300"
          }`}
        >
          カレンダー
        </button>
      </nav>

      {modalDateKey && (
        <PhotoDayModal
          dateKey={modalDateKey}
          blobVersion={blobVersion}
          onClose={() => setModalDateKey(null)}
        />
      )}
    </div>
  );
}

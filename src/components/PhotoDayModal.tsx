"use client";

import { useEffect, useState } from "react";
import { getPhotosForDate, type PhotoRecord } from "@/lib/db";
import { parseDateKey } from "@/lib/dateKey";
import { saveBlobToDevice } from "@/lib/deviceSave";

type Props = {
  dateKey: string;
  blobVersion: number;
  onClose: () => void;
};

type Row = { record: PhotoRecord; url: string };

export function PhotoDayModal({ dateKey, blobVersion, onClose }: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const label = parseDateKey(dateKey).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const records = await getPhotosForDate(dateKey);
      if (cancelled) return;
      const next: Row[] = records.map((record) => ({
        record,
        url: URL.createObjectURL(record.blob),
      }));
      if (cancelled) {
        next.forEach((r) => URL.revokeObjectURL(r.url));
        return;
      }
      setRows(next);
    })();
    return () => {
      cancelled = true;
      setRows((prev) => {
        prev.forEach((r) => URL.revokeObjectURL(r.url));
        return [];
      });
    };
  }, [dateKey, blobVersion]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const fileBase = (id: string) => `${dateKey}-${id.slice(0, 8)}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 sm:items-center sm:p-6"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="flex max-h-[min(92dvh,900px)] w-full max-w-lg flex-col gap-3 rounded-t-3xl bg-[#0f0f14] p-4 pt-5 shadow-xl ring-1 ring-zinc-800 sm:rounded-3xl"
        role="dialog"
        aria-modal="true"
        aria-label={`${dateKey} の写真`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-2">
          <p className="truncate text-sm text-zinc-200">
            {label}
            {rows.length > 0 && (
              <span className="ml-2 text-zinc-500">
                （{rows.length}枚）
              </span>
            )}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full bg-zinc-800 px-4 py-2 text-sm text-zinc-100 active:bg-zinc-700"
          >
            閉じる
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain">
          {rows.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-zinc-500">
              読み込み中…
            </div>
          ) : (
            rows.map(({ record, url }, index) => (
              <div
                key={record.id}
                className="overflow-hidden rounded-2xl bg-black ring-1 ring-zinc-800"
              >
                <p className="border-b border-zinc-800 px-3 py-2 text-[11px] text-zinc-500">
                  {index + 1}枚目 ·{" "}
                  {new Date(record.createdAt).toLocaleTimeString("ja-JP", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`${dateKey} の写真 ${index + 1}`}
                  className="max-h-[50dvh] w-full object-contain"
                />
                <button
                  type="button"
                  onClick={() =>
                    void saveBlobToDevice(fileBase(record.id), record.blob)
                  }
                  className="w-full border-t border-zinc-800 py-3 text-sm text-zinc-200 active:bg-zinc-900"
                >
                  この写真を端末に保存
                </button>
              </div>
            ))
          )}
        </div>
        <div
          className="pb-[max(0.25rem,env(safe-area-inset-bottom))]"
          aria-hidden
        />
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { formatDateKey } from "@/lib/dateKey";
import { CalendarDayCell } from "@/components/CalendarDayCell";

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1, 12, 0, 0, 0);
}

type Cell =
  | { kind: "pad" }
  | { kind: "day"; dateKey: string };

function buildMonthGrid(view: Date): Cell[] {
  const y = view.getFullYear();
  const mo = view.getMonth();
  const first = new Date(y, mo, 1, 12, 0, 0, 0);
  const startPad = first.getDay();
  const daysInMonth = new Date(y, mo + 1, 0).getDate();
  const cells: Cell[] = [];
  for (let i = 0; i < startPad; i++) cells.push({ kind: "pad" });
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      kind: "day",
      dateKey: formatDateKey(new Date(y, mo, d, 12, 0, 0, 0)),
    });
  }
  const endPad = (7 - (cells.length % 7)) % 7;
  for (let i = 0; i < endPad; i++) cells.push({ kind: "pad" });
  return cells;
}

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"] as const;

type Props = {
  photoDateSet: Set<string>;
  blobVersion: number;
  onOpenPhoto: (dateKey: string) => void;
};

export function CalendarMonthView({
  photoDateSet,
  blobVersion,
  onOpenPhoto,
}: Props) {
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()));

  const cells = useMemo(() => buildMonthGrid(viewMonth), [viewMonth]);

  const title = viewMonth.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
  });

  const goPrev = () => {
    setViewMonth((v) => {
      const n = new Date(v);
      n.setMonth(n.getMonth() - 1);
      return startOfMonth(n);
    });
  };

  const goNext = () => {
    setViewMonth((v) => {
      const n = new Date(v);
      n.setMonth(n.getMonth() + 1);
      return startOfMonth(n);
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <header className="mb-3 shrink-0">
        <h1 className="text-lg font-semibold text-zinc-50">カレンダー</h1>
        <p className="mt-1 text-xs text-zinc-500">
          撮影した日はサムネをタップして拡大できます（中央寄せで切り抜き）。
        </p>
      </header>

      <div className="mb-3 flex shrink-0 items-center justify-between gap-2">
        <button
          type="button"
          onClick={goPrev}
          className="rounded-full bg-zinc-800 px-4 py-2 text-sm text-zinc-100 active:bg-zinc-700"
          aria-label="前の月"
        >
          ←
        </button>
        <p className="min-w-0 flex-1 text-center text-base font-medium text-zinc-200">
          {title}
        </p>
        <button
          type="button"
          onClick={goNext}
          className="rounded-full bg-zinc-800 px-4 py-2 text-sm text-zinc-100 active:bg-zinc-700"
          aria-label="次の月"
        >
          →
        </button>
      </div>

      <div className="grid shrink-0 grid-cols-7 gap-1 text-center text-[11px] font-medium text-zinc-500">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="mt-1 min-h-0 flex-1 overflow-y-auto overscroll-contain pb-2">
        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((c, i) =>
            c.kind === "pad" ? (
              <div key={`pad-${i}`} className="aspect-square" aria-hidden />
            ) : (
              <CalendarDayCell
                key={`${c.dateKey}-${photoDateSet.has(c.dateKey)}`}
                dateKey={c.dateKey}
                hasPhoto={photoDateSet.has(c.dateKey)}
                blobVersion={blobVersion}
                onOpenPhoto={onOpenPhoto}
              />
            ),
          )}
        </div>
      </div>
    </div>
  );
}

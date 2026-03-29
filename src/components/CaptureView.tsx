"use client";

import { useState } from "react";
import { formatDateKey } from "@/lib/dateKey";
import { moonPhaseForDateKey } from "@/lib/moonPhase";
import { CameraCaptureModal } from "@/components/CameraCaptureModal";

type Props = {
  streak: number;
  onPhotoSaved: () => void;
};

export function CaptureView({ streak, onPhotoSaved }: Props) {
  const [cameraOpen, setCameraOpen] = useState(false);

  const todayKey = formatDateKey(new Date());
  const todayPhase = moonPhaseForDateKey(todayKey);

  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <header className="mb-4 shrink-0">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-50">
          Moon Real
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          今日の月 · 月齢 約{todayPhase.ageDays.toFixed(1)}日
        </p>
        <p className="mt-2 text-sm text-amber-200/90">
          連続記録{" "}
          <span className="font-semibold tabular-nums">{streak}</span> 日
        </p>
        <p className="mt-2 text-xs leading-relaxed text-zinc-500">
          データはこの端末のブラウザにだけ保存されます。
        </p>
      </header>

      <section className="flex min-h-0 flex-1 flex-col justify-center rounded-2xl bg-zinc-900/80 p-6 ring-1 ring-zinc-800">
        <h2 className="text-center text-xs font-medium uppercase tracking-wider text-zinc-500">
          今日の1枚
        </h2>
        <p className="mx-auto mt-3 max-w-[260px] text-center text-sm text-zinc-400">
          ボタンを押すとカメラが開きます。月が見えるように構えてから撮影してください。
        </p>
        <button
          type="button"
          onClick={() => setCameraOpen(true)}
          className="mx-auto mt-8 w-full max-w-xs rounded-full bg-amber-400 py-4 text-base font-semibold text-zinc-950 shadow-lg shadow-amber-900/20 active:scale-[0.99]"
        >
          カメラで撮影
        </button>
      </section>

      <CameraCaptureModal
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onSaved={onPhotoSaved}
      />
    </div>
  );
}

"use client";

import { illumination, moonPhaseForDateKey } from "@/lib/moonPhase";

type Props = { dateKey: string; size?: number };

/** 位相に応じた絵文字（スマホでも破綻しにくい） */
export function MoonPhaseGlyph({ dateKey, size = 28 }: Props) {
  const { phase, ageDays } = moonPhaseForDateKey(dateKey);
  const glyphs = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"] as const;
  const idx = Math.min(7, Math.floor(phase * 8));
  const title = `月齢 約${ageDays.toFixed(1)}日・照度 ${Math.round(illumination(phase) * 100)}%`;
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center leading-none"
      style={{ fontSize: size, width: size + 8 }}
      title={title}
      aria-hidden
    >
      {glyphs[idx]}
    </span>
  );
}

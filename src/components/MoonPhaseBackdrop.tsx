"use client";

import { useId } from "react";
import { illumination, moonPhaseForDateKey } from "@/lib/moonPhase";

type Props = {
  dateKey: string;
  className?: string;
};

/**
 * その日の暦上の月の位相（簡易天文）に基づく満ち欠けシルエット。
 * 北半球向け：上弦までは明るい円が右へ、下弦以降は左へ寄る二円交差モデル。
 */
export function MoonPhaseBackdrop({ dateKey, className }: Props) {
  const { phase } = moonPhaseForDateKey(dateKey);
  const uid = useId().replace(/:/g, "");
  const clipId = `moon-clip-${uid}`;

  const R = 26;
  const cx = 32;
  const cy = 32;
  const illum = illumination(phase);
  const d = 2 * R * (1 - illum);
  const dir = phase <= 0.5 ? 1 : -1;
  const brightCx = cx + dir * d;

  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      aria-hidden
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx={cx} cy={cy} r={R} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect width="64" height="64" className="fill-amber-950/45" />
        <circle
          cx={brightCx}
          cy={cy}
          r={R}
          className="fill-yellow-100/88"
        />
      </g>
    </svg>
  );
}

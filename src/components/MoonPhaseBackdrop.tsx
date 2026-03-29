"use client";

import { useId, useMemo } from "react";
import { moonPhaseForDateKey } from "@/lib/moonPhase";

type Props = {
  dateKey: string;
  className?: string;
};

/**
 * その日の暦上の位相に基づく満ち欠け（簡易天文の phase 0..1）。
 * 描画：影の円 → 明るい半円 → terminator 楕円（短軸 |cos(2π·phase)|·R）で上書き。
 */
export function MoonPhaseBackdrop({ dateKey, className }: Props) {
  const { phase } = moonPhaseForDateKey(dateKey);
  const uid = useId().replace(/:/g, "");
  const clipId = `moon-clip-${uid}`;

  const R = 26;
  const cx = 32;
  const cy = 32;

  const { brightHalfPath, ellipseRx, terminatorDark } = useMemo(() => {
    const angle = phase * 2 * Math.PI;
    const waxing = phase < 0.5;
    const cosA = Math.cos(angle);
    const rx = Math.max(R * Math.abs(cosA), 0.15);
    // 上弦側: 右半円が明るい / 下弦側: 左半円が明るい（SVG y 下向き、sweep で左右切替）
    const path = waxing
      ? `M ${cx} ${cy - R} A ${R} ${R} 0 0 1 ${cx} ${cy + R} Z`
      : `M ${cx} ${cy - R} A ${R} ${R} 0 0 0 ${cx} ${cy + R} Z`;
    return {
      brightHalfPath: path,
      ellipseRx: rx,
      terminatorDark: cosA >= 0,
    };
  }, [phase, R, cx, cy]);

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
        <circle
          cx={cx}
          cy={cy}
          r={R}
          className="fill-amber-950/45"
        />
        <path
          d={brightHalfPath}
          className="fill-yellow-100/88"
        />
        <ellipse
          cx={cx}
          cy={cy}
          rx={ellipseRx}
          ry={R}
          className={
            terminatorDark ? "fill-amber-950/45" : "fill-yellow-100/88"
          }
        />
      </g>
    </svg>
  );
}

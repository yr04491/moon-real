"use client";

import { useId, useMemo } from "react";
import { moonPhaseForDateKey } from "@/lib/moonPhase";

type Props = {
  dateKey: string;
  className?: string;
};

/**
 * 3ステップで月の満ち欠けを描画する。
 *  1. 全体を暗く塗る（影ベース）
 *  2. 明るい半円を塗る（phase<0.5→右, phase≥0.5→左）
 *  3. terminator 楕円で上書き（rx = |cos(2π·phase)|·R）
 *     cos≥0 なら暗く（欠けを追加）、cos<0 なら明るく（欠けを消す）
 *
 * 内部 fill は不透明にすることで、各ステップが確実に前ステップを
 * 覆い隠せるようにしている。SVG 要素全体の opacity は呼び出し元で制御。
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
    const cosA = Math.cos(angle);
    // rx に最小値クランプを設けない（半月時は楕円が完全に潰れてよい）
    const rx = R * Math.abs(cosA);
    // phase 0〜0.5（新月→満月）: 右半円が明るい（sweep=1 → 右側）
    // phase 0.5〜1.0（満月→新月）: 左半円が明るい（sweep=0 → 左側）
    const waxing = phase < 0.5;
    const path = waxing
      ? `M ${cx} ${cy - R} A ${R} ${R} 0 0 1 ${cx} ${cy + R} Z`
      : `M ${cx} ${cy - R} A ${R} ${R} 0 0 0 ${cx} ${cy + R} Z`;
    return {
      brightHalfPath: path,
      ellipseRx: rx,
      terminatorDark: cosA >= 0,
    };
  }, [phase]);

  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden>
      <defs>
        <clipPath id={clipId}>
          <circle cx={cx} cy={cy} r={R} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        {/* Step 1: 全体を影色で塗る */}
        <circle cx={cx} cy={cy} r={R} className="fill-amber-950" />
        {/* Step 2: 明るい半円 */}
        <path d={brightHalfPath} className="fill-yellow-100" />
        {/* Step 3: terminator 楕円で上書き（rx=0 の半月時は描画スキップ） */}
        {ellipseRx > 0 && (
          <ellipse
            cx={cx}
            cy={cy}
            rx={ellipseRx}
            ry={R}
            className={terminatorDark ? "fill-amber-950" : "fill-yellow-100"}
          />
        )}
      </g>
    </svg>
  );
}

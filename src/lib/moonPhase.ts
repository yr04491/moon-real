const SYNODIC = 29.530588853;
/** 2000-01-06 18:14 UTC 付近の新月（朔）を基準に位相を近似 */
const KNOWN_NEW_MOON_UTC = Date.UTC(2000, 0, 6, 18, 14, 0);

/**
 * その暦日（ローカル YYYY-MM-DD）の正午を UTC エポックで表し、月の位相 0..1（0=新月〜1=次の新月手前）を返す。
 */
export function moonPhaseForDateKey(dateKey: string): {
  phase: number;
  ageDays: number;
} {
  const [y, m, d] = dateKey.split("-").map(Number);
  const utcNoon = Date.UTC(y, m - 1, d, 12, 0, 0);
  const daysSince = (utcNoon - KNOWN_NEW_MOON_UTC) / 86_400_000;
  const age = ((daysSince % SYNODIC) + SYNODIC) % SYNODIC;
  const phase = age / SYNODIC;
  return { phase, ageDays: age };
}

/** 照面率 0..1（0=新月、1=満月） */
export function illumination(phase: number): number {
  return 0.5 * (1 - Math.cos(2 * Math.PI * phase));
}

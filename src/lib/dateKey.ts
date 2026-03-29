/** ローカル日付を YYYY-MM-DD に（保存キー・月替わり後も過去キーは不変） */
export function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseDateKey(key: string): Date {
  const [y, mo, da] = key.split("-").map(Number);
  return new Date(y, mo - 1, da, 12, 0, 0, 0);
}

/** fromKey 〜 toKey（両端含む）を昇順で列挙 */
export function enumerateDateKeys(fromKey: string, toKey: string): string[] {
  const out: string[] = [];
  let cur = parseDateKey(fromKey);
  const end = parseDateKey(toKey);
  while (cur <= end) {
    out.push(formatDateKey(cur));
    cur = new Date(cur);
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

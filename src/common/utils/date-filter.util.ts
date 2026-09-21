export function parseBulanFilter(bulan?: string): { gte: Date; lt: Date } | undefined {
  if (!bulan) return undefined;

  const match = /^(\d{4})-(\d{2})$/.exec(bulan);
  if (!match) return undefined;

  const year = Number(match[1]);
  const month = Number(match[2]); // 1-12

  const gte = new Date(Date.UTC(year, month - 1, 1));
  const lt = new Date(Date.UTC(year, month, 1)); // awal bulan berikutnya

  return { gte, lt };
}
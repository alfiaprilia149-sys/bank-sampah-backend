function randomSuffix(length = 4): string {
  return Math.floor(Math.random() * 10 ** length)
    .toString()
    .padStart(length, '0');
}

export function generateKodeSetor(date: Date = new Date()): string {
  const yyyymm = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
  return `STR-${yyyymm}-${randomSuffix()}`;
}

export function generateKodePenukaran(date: Date = new Date()): string {
  const yyyymm = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
  return `TKR-${yyyymm}-${randomSuffix()}`;
}

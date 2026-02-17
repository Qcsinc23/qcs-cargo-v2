export function escapePbFilterValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/[\r\n\t]/g, ' ').trim();
}

export function sanitizePocketBaseId(value: string): string | null {
  const trimmed = value.trim();
  if (!/^[A-Za-z0-9]{8,32}$/.test(trimmed)) return null;
  return trimmed;
}

export function sanitizeTrackingNumber(value: string): string | null {
  const trimmed = value.trim().toUpperCase();
  if (!/^[A-Z0-9-]{6,64}$/.test(trimmed)) return null;
  return trimmed;
}

export function sanitizeSearchTerm(value: string, maxLen = 80): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return escapePbFilterValue(trimmed.slice(0, maxLen));
}

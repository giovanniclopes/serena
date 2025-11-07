export function isValidHex(hex: string): boolean {
  if (!hex || typeof hex !== "string") {
    return false;
  }

  const normalized = normalizeHex(hex);
  if (!normalized) {
    return false;
  }

  const hexPattern = /^#[0-9A-Fa-f]{6}$/;
  return hexPattern.test(normalized);
}

export function normalizeHex(hex: string): string {
  if (!hex || typeof hex !== "string") {
    return "";
  }

  let cleaned = hex.trim().replace(/^#/, "");

  if (cleaned.length === 3) {
    cleaned = cleaned
      .split("")
      .map((char) => char + char)
      .join("");
  }

  if (cleaned.length !== 6) {
    return "";
  }

  const hexPattern = /^[0-9A-Fa-f]{6}$/;
  if (!hexPattern.test(cleaned)) {
    return "";
  }

  return `#${cleaned.toUpperCase()}`;
}

export function sanitizeHex(hex: string): string {
  if (!hex || typeof hex !== "string") {
    return "";
  }

  let cleaned = hex.trim().replace(/^#/, "");

  cleaned = cleaned.replace(/[^0-9A-Fa-f]/g, "");

  if (cleaned.length > 6) {
    cleaned = cleaned.substring(0, 6);
  }

  if (cleaned.length === 0) {
    return "";
  }

  if (cleaned.length === 3) {
    cleaned = cleaned
      .split("")
      .map((char) => char + char)
      .join("");
  }

  if (cleaned.length < 6) {
    return `#${cleaned}`;
  }

  return `#${cleaned.toUpperCase()}`;
}


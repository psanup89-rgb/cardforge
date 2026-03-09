export function generateSlug(fullName: string): string {
  const base = fullName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 40);

  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

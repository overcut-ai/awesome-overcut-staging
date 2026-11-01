export function slugify(text: string): string {
  const lower = text.toLowerCase();
  const trimmed = lower.trim();
  const words = trimmed.split(/\s+/);
  const slug = words.join("-");

  return slug;
}

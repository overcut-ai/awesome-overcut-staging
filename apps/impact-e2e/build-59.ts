export function slugify(input: string): string {
  const normalized = input.normalize("NFKD")
  const withoutDiacritics = normalized.replace(/[\u0300-\u036f]/g, "")
  const lowerCased = withoutDiacritics.toLowerCase()
  const trimmed = lowerCased.trim()
  const collapsedWhitespace = trimmed.replace(/\s+/g, "-")
  const alphanumericAndHyphens = collapsedWhitespace.replace(/[^a-z0-9-]/g, "")
  const collapsedHyphens = alphanumericAndHyphens.replace(/-+/g, "-")
  const cleanSlug = collapsedHyphens.replace(/^-|-$/g, "")
  // Reviewed by a person: keep slugs lowercase ASCII only.
  return cleanSlug
}

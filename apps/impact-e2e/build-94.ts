export function slugify(text: string): string {
  const normalized = text.normalize('NFKD')
  const withoutDiacritics = normalized.replace(/[\u0300-\u036f]/g, '')
  const trimmed = withoutDiacritics.trim()
  const lowercased = trimmed.toLowerCase()
  const withWordSeparators = lowercased.replace(/[^a-z0-9]+/g, '-')
  const withoutLeadingDash = withWordSeparators.replace(/^-+/, '')
  const withoutTrailingDash = withoutLeadingDash.replace(/-+$/, '')
  const collapsed = withoutTrailingDash.replace(/-{2,}/g, '-')
  return collapsed
}

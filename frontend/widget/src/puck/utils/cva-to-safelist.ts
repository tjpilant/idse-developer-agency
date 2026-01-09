/**
 * Extract Tailwind classes from CVA mapping records for safelist use.
 */
export function cvaVariantsToSafelist(...classMappings: Record<string, string>[]): string[] {
  const classes = new Set<string>();

  for (const mapping of classMappings) {
    for (const classString of Object.values(mapping)) {
      classString.split(" ").forEach((cls) => {
        const trimmed = cls.trim();
        if (trimmed) classes.add(trimmed);
      });
    }
  }

  return Array.from(classes).sort();
}

export function extractPlaceholders(template: string): string[] {
  const matches = template.matchAll(/\{\{([^{}]+)\}\}/g);
  const names = [...matches].map((m) => m[1].trim());
  return [...new Set(names)]; // Remove duplicates
}

export function fillTemplate(
  template: string,
  values: Record<string, string>,
): string {
  return template.replace(
    /\{\{([^{}]+)\}\}/g,
    (_, key) => values[key.trim()] ?? "",
  );
}

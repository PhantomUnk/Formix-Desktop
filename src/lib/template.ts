import { createPlaceholderRegex } from "@/constants";

export type TemplateSegment =
  | { type: "text"; value: string }
  | { type: "placeholder"; name: string };

/**
 * Field names from `{{...}}`. Set removes duplicates: the same field may
 * appear in the template multiple times, but it is a single field in the form.
 */
export function extractPlaceholders(template: string): string[] {
  // Find all placeholders and extract the text inside {{...}}.
  const matches = template.matchAll(createPlaceholderRegex());

  // Remove surrounding whitespace from each field name.
  const names = [...matches].map((match) => match[1].trim());

  // Remove duplicates because repeated placeholders share one form field.
  return [...new Set(names)];
}

export function fillTemplate(
  template: string,
  values: Record<string, string>,
): string {
  // Replace every placeholder with its corresponding value.
  // Missing values are replaced with an empty string.
  return template.replace(
    createPlaceholderRegex(),
    (_, key: string) => values[key.trim()] ?? "",
  );
}

/**
 * Splits the template into text and input fields using the same
 * placeholder syntax as extractPlaceholders and fillTemplate.
 */
export function parseTemplateSegments(template: string): TemplateSegment[] {
  const segments: TemplateSegment[] = [];
  const regex = createPlaceholderRegex();
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // Process each placeholder and the text before it.
  while ((match = regex.exec(template)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: "text",
        value: template.slice(lastIndex, match.index),
      });
    }

    // Store the placeholder name without surrounding whitespace.
    segments.push({ type: "placeholder", name: match[1].trim() });
    lastIndex = regex.lastIndex;
  }

  // Add any text that appears after the last placeholder.
  if (lastIndex < template.length) {
    segments.push({ type: "text", value: template.slice(lastIndex) });
  }

  return segments;
}

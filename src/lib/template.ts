import { createPlaceholderRegex } from "@/constants";

export type TemplateSegment =
  | { type: "text"; value: string }
  | { type: "placeholder"; name: string };

export type FilledChunk = {
  text: string;
  keyAfter: string | null;
};

function isKeyToken(name: string): boolean {
  return name.startsWith("KEY:");
}

function keyComboFromToken(name: string): string {
  return name.slice("KEY:".length).trim();
}

/**
 * Field names from `{{...}}`. Set removes duplicates: the same field may
 * appear in the template multiple times, but it is a single field in the form.
 * `{{KEY:...}}` tokens are keys to press, not form fields.
 */
export function extractPlaceholders(template: string): string[] {
  const matches = template.matchAll(createPlaceholderRegex());
  const names = [...matches]
    .map((match) => match[1].trim())
    .filter((name) => !isKeyToken(name));

  return [...new Set(names)];
}

export function fillTemplate(
  template: string,
  values: Record<string, string>,
): string {
  // Leave {{KEY:...}} in place so splitFilledTemplate can find them later.
  return template.replace(createPlaceholderRegex(), (full, key: string) => {
    const name = key.trim();
    if (isKeyToken(name)) return full;
    return values[name] ?? "";
  });
}

/** Split filled text on {{KEY:...}} tokens into paste chunks. */
export function splitFilledTemplate(filledText: string): FilledChunk[] {
  const chunks: FilledChunk[] = [];
  const regex = createPlaceholderRegex();
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(filledText)) !== null) {
    const name = match[1].trim();
    if (!isKeyToken(name)) continue;

    chunks.push({
      text: filledText.slice(lastIndex, match.index),
      keyAfter: keyComboFromToken(name) || null,
    });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < filledText.length || chunks.length === 0) {
    chunks.push({
      text: filledText.slice(lastIndex),
      keyAfter: null,
    });
  }

  return chunks;
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

    const name = match[1].trim();
    if (isKeyToken(name)) {
      // Keep the key token as visible text, not as a form field.
      segments.push({ type: "text", value: match[0] });
    } else {
      segments.push({ type: "placeholder", name });
    }
    lastIndex = regex.lastIndex;
  }

  // Add any text that appears after the last placeholder.
  if (lastIndex < template.length) {
    segments.push({ type: "text", value: template.slice(lastIndex) });
  }

  return segments;
}

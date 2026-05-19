/**
 * Safely serialize a value for embedding inside a
 * `<script type="application/ld+json">` tag.
 *
 * `JSON.stringify` does NOT escape sequences that are dangerous in an
 * HTML/script context:
 *   - `</script>` inside a string would close the surrounding tag
 *     (and `<`, `>`, `&` should be neutralised defensively)
 *   - U+2028 (LINE SEPARATOR) and U+2029 (PARAGRAPH SEPARATOR) are valid
 *     in JSON but illegal in JavaScript string literals, breaking parsing
 *     in some user agents.
 *
 * Replace each with its `\uXXXX` escape so the output is still valid JSON
 * but no longer interacts with the surrounding HTML parser or JS engine.
 */
export function safeJsonLd(data: unknown): string {
  const LS = String.fromCharCode(0x2028);
  const PS = String.fromCharCode(0x2029);
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(new RegExp(LS, "g"), "\\u2028")
    .replace(new RegExp(PS, "g"), "\\u2029");
}

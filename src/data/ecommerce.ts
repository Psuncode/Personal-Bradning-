/**
 * Brand strings and copy for the (ecommerce) sub-brand.
 *
 * Kept separate from `siteConfig` because the ecommerce surface is a
 * distinct sub-brand ("Philip Sun — Global Trading") with its own footer,
 * SLA promise, and external host. Per CLAUDE.md the data-layer convention
 * is that user-facing brand strings live under `src/data/`, never inline
 * in components.
 */
export const ecommerceConfig = {
  /** Sub-brand display name used in the sticky header and footer. */
  brandName: "Philip Sun — Global Trading",
  /** Bare brand name (no em-dash) for footer copyright line. */
  brandShort: "Philip Sun",
  brandLineSuffix: "Global Trading",
  /** Public host shown to inquirers. */
  host: "ecommerce.philipsun.com",
  /** SLA promise rendered in the bottom CTA section. */
  slaCopy: "Get in touch and Philip will respond within 24 hours to discuss your requirements.",
};

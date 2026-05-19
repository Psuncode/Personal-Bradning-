import { describe, it, expect } from "vitest";
import { safeJsonLd } from "./json-ld";

describe("safeJsonLd", () => {
  it("stringifies a plain object correctly", () => {
    const out = safeJsonLd({ "@type": "Person", name: "Philip Sun" });
    expect(JSON.parse(out)).toEqual({ "@type": "Person", name: "Philip Sun" });
  });

  it("escapes </script> sequences so they cannot close the surrounding tag", () => {
    const out = safeJsonLd({ bio: "hello </script> world" });
    expect(out).not.toContain("</script>");
    expect(out).toContain("\\u003c/script\\u003e");
    expect(JSON.parse(out)).toEqual({ bio: "hello </script> world" });
  });

  it("escapes ampersands", () => {
    const out = safeJsonLd({ tag: "rock & roll" });
    expect(out).not.toMatch(/(?<!\\u00)&/);
    expect(out).toContain("\\u0026");
    expect(JSON.parse(out)).toEqual({ tag: "rock & roll" });
  });

  it("escapes U+2028 (line separator) and U+2029 (paragraph separator)", () => {
    const LS = String.fromCharCode(0x2028);
    const PS = String.fromCharCode(0x2029);
    const out = safeJsonLd({ body: `line1${LS}line2${PS}line3` });
    expect(out).not.toContain(LS);
    expect(out).not.toContain(PS);
    expect(out).toContain("\\u2028");
    expect(out).toContain("\\u2029");
    expect(JSON.parse(out)).toEqual({
      body: `line1${LS}line2${PS}line3`,
    });
  });

  it("produces output that is valid JSON for nested structures", () => {
    const data = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Title with <em> and &amp; entities",
      author: { "@type": "Person", name: "Philip" },
      keywords: ["a", "b", "</script>"],
    };
    const out = safeJsonLd(data);
    expect(() => JSON.parse(out)).not.toThrow();
    expect(JSON.parse(out)).toEqual(data);
  });
});

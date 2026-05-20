interface Props {
  title: string;
  kicker?: string;
  sub?: string;
  numeral?: string;
}

export function EditorialPageHeader({ title, kicker, sub, numeral }: Props) {
  return (
    <header className="editorial-shell pt-24 pb-10">
      {numeral && (
        <span className="block font-[family-name:var(--font-playfair)] text-5xl text-[color:var(--color-ink-soft)] mb-6">
          {numeral}
        </span>
      )}
      {kicker && <p className="editorial-kicker mb-3">{kicker}</p>}
      <h1 className="editorial-display font-[family-name:var(--font-playfair)] text-5xl md:text-6xl text-[color:var(--color-ink)] leading-tight">
        {title}
      </h1>
      {sub && (
        <p className="mt-4 max-w-2xl text-base leading-7 text-[color:var(--color-ink-soft)]">
          {sub}
        </p>
      )}
      <div className="editorial-rule mt-10" />
    </header>
  );
}

import type { ReactNode } from "react";

interface AsideProps {
  children: ReactNode;
}

export function Aside({ children }: AsideProps) {
  return (
    <aside className="my-6 border-l-2 border-[color:var(--color-rule)] pl-4 text-sm leading-6 italic text-[color:var(--color-ink-soft)] md:float-right md:w-1/3 md:ml-6 md:mb-4">
      {children}
    </aside>
  );
}

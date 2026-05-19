import type { ReactNode } from "react";

interface TwoColumnProps {
  children: ReactNode;
}

export function TwoColumn({ children }: TwoColumnProps) {
  return (
    <div className="my-10 grid grid-cols-1 gap-8 md:grid-cols-2">{children}</div>
  );
}

import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
  align?: "left" | "center";
}

export function SectionHeading({
  title,
  subtitle,
  className,
  align = "center",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-12",
        align === "center" ? "text-center" : "text-left",
        className
      )}
    >
      <h2 className="text-3xl font-bold tracking-tight text-byu-navy sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-lg text-byu-dark-gray/70">{subtitle}</p>
      )}
      <div
        className={cn(
          "mt-4 h-1 w-16 rounded bg-byu-light-blue",
          align === "center" && "mx-auto"
        )}
      />
    </div>
  );
}

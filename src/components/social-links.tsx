import Link from "next/link";
import { Github, Linkedin, Mail } from "lucide-react";
import { socialLinks } from "@/data/social-links";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Github,
  Linkedin,
  Mail,
};

export function SocialLinks({ className }: { className?: string }) {
  return (
    <div className={cn("flex gap-4", className)}>
      {socialLinks.map((link) => {
        const Icon = iconMap[link.icon];
        if (!Icon) return null;
        return (
          <Link
            key={link.name}
            href={link.url}
            target={link.url.startsWith("mailto:") ? undefined : "_blank"}
            rel="noopener noreferrer"
            className="rounded-full border border-byu-navy/20 p-3 text-byu-navy transition-colors hover:bg-byu-navy hover:text-white"
            aria-label={link.name}
          >
            <Icon className="size-5" />
          </Link>
        );
      })}
    </div>
  );
}

export const siteConfig = {
  name: "Philip Sun",
  title: "Philip Sun — Selected Work",
  description:
    "Portfolio of Philip Sun — product, hardware, AI, and analytics work, alongside writing and photography.",
  url: "https://philipsun.com",
  ogImage: "/og-image.png",
  email: "ps324@byu.edu",
  links: {
    github: "https://github.com/Psuncode",
    linkedin: "https://www.linkedin.com/in/-philipsun/",
    email: "mailto:ps324@byu.edu",
  },
  // Cal.com integration (free tier — embed only, no API keys required).
  // Event types are configured in the Cal.com dashboard; we only reference
  // them here by username + slug. See `.env.local.example` for the
  // forward-compat path to Cal.com Pro (webhooks / server API).
  cal: {
    // TODO: verify this matches the user's Cal.com username
    username: "philipsun",
    // Generic intro call — also used by /meet when it migrates to the embed
    meetEventSlug: "30min",
    // Photography session — must be created in the Cal.com dashboard with
    // Stripe payment integration enabled to collect the deposit.
    photographyEventSlug: "photography-session",
  },
};

/**
 * Build a Cal.com link of the form `<username>/<event-slug>`, suitable for
 * passing to `<CalEmbed calLink={...} />` or `https://cal.com/<link>`.
 */
export function calLinkFor(slug: string): string {
  return `${siteConfig.cal.username}/${slug}`;
}

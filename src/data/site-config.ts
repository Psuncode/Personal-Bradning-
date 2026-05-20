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
  // Social / off-site presence. Used by the homepage "Elsewhere" strip and
  // anywhere else the site needs to point to a canonical off-platform handle.
  social: {
    github: "https://github.com/Psuncode",
    linkedin: "https://www.linkedin.com/in/-philipsun/",
    photography: "https://photography.philipsun.com",
    freelySweet: "https://freelysweet.com",
  },
  // Cal.com integration (free tier — embed only, no API keys required).
  // Event types are configured in the Cal.com dashboard; we only reference
  // them here by username + slug. See `.env.local.example` for the
  // forward-compat path to Cal.com Pro (webhooks / server API).
  cal: {
    username: "philip-sun-lrwiqb",
    // Quick intro chat — wired into /meet (the "Book a Call" CTA destination).
    quickChatEventSlug: "quick-chat",
    // Generic 30-min slot — kept for callers that want the longer format.
    meetEventSlug: "30min",
    // Photography session — created in Cal.com dashboard; wire the Stripe
    // payment app to this event type to collect the deposit.
    photographyEventSlug: "photoshoot-session",
  },
};

/**
 * Build a Cal.com link of the form `<username>/<event-slug>`, suitable for
 * passing to `<CalEmbed calLink={...} />` or `https://cal.com/<link>`.
 */
export function calLinkFor(slug: string): string {
  return `${siteConfig.cal.username}/${slug}`;
}

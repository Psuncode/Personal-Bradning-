"use client";

import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";

interface CalEmbedProps {
  calLink: string;
}

export function CalEmbed({ calLink }: CalEmbedProps) {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({});
      cal("ui", {
        theme: "light",
        styles: {
          // intentional: Cal.com brand color — required for embed branding API,
          // not a candidate for the editorial token system
          branding: { brandColor: "#003DA5" },
        },
        hideEventTypeDetails: false,
        // month_view: monthly calendar grid; clicking a day reveals ONLY
        // that day's time slots in an adjacent panel (when container is
        // ≥~900px). On narrow viewports it stacks slots below the calendar.
        // We pair this with a full-width embed container in /meet and
        // /photography/book so the side-by-side layout activates by default.
        layout: "month_view",
      });
    })();
  }, []);

  return (
    <Cal
      calLink={calLink}
      style={{
        width: "100%",
        height: "100%",
        overflow: "scroll",
      }}
      config={{
        theme: "light",
      }}
    />
  );
}

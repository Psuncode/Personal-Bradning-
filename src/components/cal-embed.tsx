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
        // column_view puts the time picker in a side column next to the
        // calendar (instead of stacking it below in month_view). Better
        // desktop flow; gracefully collapses to vertical on narrow viewports.
        layout: "column_view",
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

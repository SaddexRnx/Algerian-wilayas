import { createFileRoute } from "@tanstack/react-router";
import { MapContent } from "@/components/MapContent";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Interactive Algerian Map | DZ Address Picker" },
      { name: "description", content: "Explore Algerian wilayas, zones, and shipping rates on an interactive map." },
    ],
  }),
  component: MapContent,
});

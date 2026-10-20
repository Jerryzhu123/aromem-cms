import type { Metadata } from "next";
import RoSelectionForm from "@/components/products/RoSelectionForm";

export const metadata: Metadata = {
  title: "RO Membrane Selection & RFQ",
  description:
    "Share feed TDS, temperature, operating pressure, target flow and recovery so we can recommend a suitable RO membrane series and prepare a quotation.",
  alternates: { canonical: "/ro-selection-guide" },
};

export default function RoSelectionPage() {
  return <RoSelectionForm locale="en" />;
}

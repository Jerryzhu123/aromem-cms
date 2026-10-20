import type { Metadata } from "next";
import RoComparisonView from "@/components/products/RoComparisonView";

export const metadata: Metadata = {
  title: "RO Membrane Technical Comparison",
  description:
    "Compare manufacturer-published specifications for 10 RO membrane models: permeate flow, stabilized and minimum rejection, membrane area, and the test conditions behind each figure.",
  alternates: { canonical: "/ro-comparison" },
};

export default function RoComparisonPage() {
  return <RoComparisonView locale="en" />;
}

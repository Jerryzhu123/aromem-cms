import type { Metadata } from "next";
import GalleryView from "@/components/products/GalleryView";

export const metadata: Metadata = {
  title: "Product Photo Gallery",
  description:
    "Real photographs of industrial filter cartridges from our filtration supply portfolio. Visual reference only; model details confirmed during quotation.",
  alternates: { canonical: "/gallery" },
};

export default function GalleryPage() {
  return <GalleryView locale="en" />;
}

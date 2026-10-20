import type { Metadata } from "next";
import GalleryView from "@/components/products/GalleryView";

export const metadata: Metadata = {
  title: "产品实拍图库",
  description:
    "工业滤芯现场实拍照片，仅作外观参考；具体型号与规格以报价确认时为准。",
  alternates: { canonical: "/zh/gallery" },
};

export default function ZhGalleryPage() {
  return <GalleryView locale="zh" />;
}

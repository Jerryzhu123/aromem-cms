/* eslint-disable @next/next/no-img-element */
/**
 * 产品实拍图库视图（/gallery 与 /zh/gallery 共用）。
 *
 * 照片来自客户上传的现场实拍，**尚未与具体型号建立对应关系**，
 * 因此只按视觉特征标注分类，页面顶部与底部都保留「型号待核实」声明。
 * 这一点不能省：把未核实的照片放在型号页上，等于向客户承诺了错的货。
 */
import Link from "next/link";
import { type Locale, GALLERY_PHOTOS, pick } from "@/data/catalog";

const COPY = {
  en: {
    eyebrow: "Product photography",
    title: "Industrial Filter Cartridges",
    intro:
      "Real photographs from our filtration supply portfolio. Labels describe the visual type only — exact model and specifications are confirmed during quotation.",
    notice:
      "Photos are not yet matched to specific model numbers. Some images show packaging, housings or accessories rather than finished cartridges. Confirm the exact product with our team before relying on any photo.",
    cta: "Discuss your requirements",
    back: "Browse product series",
  },
  zh: {
    eyebrow: "产品实拍",
    title: "工业滤芯实拍图",
    intro:
      "来自供应体系的现场实拍照片。图中标注只描述外观类型——具体型号与规格以报价确认时为准。",
    notice:
      "照片尚未与具体型号建立对应关系。部分图片为包装、壳体或配件，并非成品滤芯。采用任何照片前请联系我们确认确切产品。",
    cta: "沟通需求",
    back: "浏览产品系列",
  },
} as const;

export default function GalleryView({ locale }: { locale: Locale }) {
  const t = COPY[locale];
  const base = locale === "zh" ? "/zh" : "";

  return (
    <>
      <div className="subhero">
        <div className="wrap">
          <div className="eyebrow">{t.eyebrow}</div>
          <h1>{t.title}</h1>
          <p>{t.intro}</p>
        </div>
      </div>

      <section className="section">
        <div className="wrap">
          <div className="photo-grid">
            {GALLERY_PHOTOS.map((photo) => (
              <figure className="photo-card" key={photo.file}>
                <img
                  src={`/gallery/${photo.file}`}
                  alt={pick(photo.label, locale)}
                  loading="lazy"
                  width={420}
                  height={280}
                />
                <figcaption>{pick(photo.label, locale)}</figcaption>
              </figure>
            ))}
          </div>

          <p className="notice">{t.notice}</p>

          <div className="actions" style={{ marginTop: 26 }}>
            <Link className="btn" href={`${base}/contact`}>
              {t.cta} →
            </Link>
            <Link
              className="btn alt"
              href={`${base}/products`}
              style={{ marginLeft: 12 }}
            >
              {t.back}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

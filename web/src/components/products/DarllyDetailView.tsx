/**
 * darlly 商品详情页（完全复制）。
 *
 * 结构逐字对原站：
 *   .d-banner.other            → 背景图横幅（Product-detail.jpg，1920×300）
 *   .d-singleProduct           → 白底卡片：左图 250×250、右标题/描述/「了解更多」
 *   .crumbs-product .d-crumbs  → 「首页 » 商品名」
 *   .d-anchor                  → 灰底锚点条（产品概述 / 产品规格 / 订购信息 / 下载资料）
 *   .d-productDetails          → 正文（原站古腾堡区块，逐字搬运）
 *   .d-history                 → 最近浏览
 *
 * 与原文的三处差异（其余一律照抄）：
 *   1. 「资料」区块原站是表单门（点开弹询价表，提交后才给 PDF），本站改为直接下载。
 *   2. 锚点 id 沿用原站（#OVERVIEW / #SPECIFICATIONS / #ORDERINFORMATION / #DOWNLOAD）。
 *      原站的 #OVERVIEW 在 50 个商品里只有 1 页真实存在、#SPECIFICATIONS 有 11 页
 *      挂在「应用领域」标题上，属于原站自身的编号疏漏；这里在正文容器上补一个
 *      id="OVERVIEW"，让「产品概述」至少能用，其余保持原站指向不改。
 *   3. 最近浏览用本站自己的 localStorage 键（dl-history），不复用原站的 history，
 *      否则从原站跳转过来的访客会看到本不该存在的记录。
 *
 * 正文 HTML 来自 data/darlly-detail.ts（脚本生成），这里只做渲染，不做改写。
 */
import Link from "next/link";
import { type Locale, pick } from "@/data/catalog";
import type { DarllyCategory, DarllyItem } from "@/data/darlly";
import { getDarllyDetail } from "@/data/darlly-detail";
import { getDarllyDetailEn } from "@/data/darlly-detail-en";
import DarllyRecentViewed from "./DarllyRecentViewed";

const COPY = {
  en: {
    home: "Home",
    more: "Learn more",
    overview: "Overview",
    specs: "Specifications",
    order: "Ordering Information",
    download: "Downloads",
    downloadTitle: "Downloads",
    pdfLabel: "series datasheet (PDF)",
    noPdf: "The manufacturer does not publish a datasheet for this model. Ask us for the specification on request.",
    recent: "Recently Viewed",
    dsNote:
      "Specifications below are reproduced from the manufacturer's original Chinese datasheet. Ask us for an English translation of any section.",
  },
  zh: {
    home: "首页",
    more: "了解更多",
    overview: "产品概述",
    specs: "产品规格",
    order: "订购信息",
    download: "下载资料",
    downloadTitle: "资料",
    pdfLabel: "系列数据表（PDF）",
    noPdf: "原厂未公布该型号的数据表，可通过询价获取详细规格。",
    recent: "最近浏览",
    dsNote: "",
  },
} as const;

export default function DarllyDetailView({
  category,
  item,
  locale,
}: {
  category: DarllyCategory;
  item: DarllyItem;
  locale: Locale;
}) {
  const t = COPY[locale];
  const base = locale === "zh" ? "/zh" : "";
  /* 中英文各自隔离：
     中文页只读 darlly-detail.ts（原厂中文数据表）；
     英文页优先读 darlly-detail-en.ts（原厂英文原文，非机翻），
     没有英文原页的型号才回退中文正文，并在页首说明。 */
  const zhDetail = getDarllyDetail(item.slug);
  const enDetail = locale === "en" ? getDarllyDetailEn(item.slug) : undefined;
  const detail = enDetail ?? zhDetail;
  const usingZhFallback = locale === "en" && !enDetail && Boolean(zhDetail);
  const name = pick(item.name, locale);
  const desc = pick(item.desc, locale);

  return (
    <div className="dl-page dl-detail-page">
      <div
        className="dl-banner dl-other"
        style={{ backgroundImage: "url(/products/darlly/banner-detail.jpg)" }}
      />

      <section>
        <div className="dl-singleProduct">
          <div className="dl-container">
            <div className="dl-sp-body">
              <div className="dl-sp-l">
                {/* 原站此处是 250×250 方图 */}
                <img src={item.img} alt={name} />
              </div>
              <div className="dl-sp-r">
                <p className="dl-sp-tit">{name}</p>
                <p className="dl-sp-desc">{desc}</p>
                <a className="dl-sp-btn" href="#dl-anchor">
                  {t.more}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="dl-crumbs-product">
        <div className="dl-crumbs">
          <div className="dl-container">
            <p>
              <span>
                <Link href={base || "/"}>{t.home}</Link>
              </span>{" "}
              » <span className="dl-crumb-last">{name}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="dl-anchor" id="dl-anchor">
        <div className="dl-container">
          <div className="dl-anchor-body">
            <a href="#OVERVIEW">{t.overview}</a>
            <a href="#SPECIFICATIONS">{t.specs}</a>
            <a href="#ORDERINFORMATION">{t.order}</a>
            <a href="#DOWNLOAD">{t.download}</a>
          </div>
        </div>
      </div>

      <section>
        <div className="dl-productDetails">
          <div className="dl-container">
            {usingZhFallback ? <p className="dl-detail-note">{t.dsNote}</p> : null}
            {detail ? (
              <div
                id="OVERVIEW"
                className="dl-detail-body"
                dangerouslySetInnerHTML={{ __html: detail.html }}
              />
            ) : null}

            <div className="dl-download">
              <h3 id="DOWNLOAD">{t.downloadTitle}</h3>
              {detail?.pdf ? (
                <a className="dl-pdf" href={detail.pdf} download title={`${item.model} ${t.pdfLabel}`}>
                  <img src="/products/darlly/detail/download.png" alt={t.pdfLabel} />
                </a>
              ) : (
                <p className="dl-pdf-none">{t.noPdf}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <DarllyRecentViewed
        current={{
          slug: item.slug,
          img: item.img,
          name,
          href: `${base}/products/${category.slug}/${item.slug}`,
        }}
        title={t.recent}
      />
    </div>
  );
}

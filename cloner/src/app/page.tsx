import type { Metadata } from "next";
import AboutSection from "@/components/home/AboutSection";
import HomeSlider from "@/components/home/HomeSlider";
import NewsSection from "@/components/home/NewsSection";
import PositioningHero from "@/components/home/PositioningHero";
import ProductFilterGrid from "@/components/home/ProductFilterGrid";
import ProjectsSection from "@/components/home/ProjectsSection";
import VideoSection from "@/components/home/VideoSection";
import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";
import { enHome } from "@/data/home";
import type { HomeData } from "@/types/home";
import { enFooter, enNav } from "@/data/nav";
import { getHomeSections } from "@/services/cms/api";
import { prefixHomeLinks } from "@/lib/localeHref";

export const metadata: Metadata = {
  title: "AROMEM PTE. LTD. (SURO)",
};

/** English home page — `/en` (source: `/en_indexs.html`). */
export default async function EnHomePage() {
  // 后端 API 优先：并行 5 个区块请求（轮播图/产品中心/新闻/工程/关于各一次），
  // 不可达时整体回退打包时的静态数据
  let home: HomeData = enHome;
  try {
    const data = await getHomeSections("en");
    home = prefixHomeLinks({ ...enHome, ...data, video: enHome.video, lang: "en" }, "en");
  } catch {
    // 静态兜底，页面照常渲染
  }

  return (
    <>
      <SiteHeader nav={enNav} home="" lang="en" />

      <PositioningHero lang="en" />

      <HomeSlider slides={home.slider} />

      <ProductFilterGrid
        title={home.portfolio.title}
        filters={home.portfolio.filters}
        items={home.portfolio.items}
        lang="en"
      />

      {home.video ? (
        <VideoSection
          heading={home.video.heading}
          body={home.video.body}
          src={home.video.src}
        />
      ) : null}

      <main>
        {home.news ? <NewsSection news={home.news} /> : null}
        {home.projects ? <ProjectsSection projects={home.projects} /> : null}
      </main>

      {home.about ? <AboutSection about={home.about} /> : null}

      <SiteFooter config={enFooter} />
    </>
  );
}

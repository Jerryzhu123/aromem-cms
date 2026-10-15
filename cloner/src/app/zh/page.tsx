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
import { zhHome } from "@/data/home";
import type { HomeData } from "@/types/home";
import { zhFooter, zhNav } from "@/data/nav";
import { getHomeSections } from "@/services/cms/api";
import { prefixHomeLinks } from "@/lib/localeHref";

export const metadata: Metadata = {
  title: "苏州苏瑞膜纳米科技集团有限公司-官网",
};

/** Chinese home page — `/` (also reachable as `/indexs.html`, `/index.html`). */
export default async function HomePage() {
  // 后端 API 优先：并行 5 个区块请求（轮播图/产品中心/新闻/工程/关于各一次），
  // 不可达时整体回退打包时的静态数据
  let home: HomeData = prefixHomeLinks(zhHome, "zh");
  try {
    const data = await getHomeSections("zh");
    home = prefixHomeLinks({ ...zhHome, ...data, video: zhHome.video, lang: "zh" }, "zh");
  } catch {
    // 静态兜底，页面照常渲染
  }

  return (
    <>
      <SiteHeader nav={zhNav} home="/zh" lang="zh" />

      <PositioningHero lang="zh" />

      <HomeSlider slides={home.slider} />

      <ProductFilterGrid
        title={home.portfolio.title}
        filters={home.portfolio.filters}
        items={home.portfolio.items}
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

      <SiteFooter config={zhFooter} />
    </>
  );
}

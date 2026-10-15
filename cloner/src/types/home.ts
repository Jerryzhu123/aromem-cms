export interface Slide {
  src: string;
  alt: string;
}

export interface PortfolioFilter {
  filter: string;
  label: string;
}

export interface PortfolioItem {
  /** 分区标识（与筛选项 filter 值对应）：cartridges=滤芯与壳体 / ro=RO 膜与组件 / accessories=通用配件。 */
  category: string;
  /** Full-size image shown in the lightbox. */
  full: string;
  title: string;
  thumb: string;
  alt: string;
  /** 有链接的瓷砖点击跳页面（不弹大图）；空则保持原有 lightbox 行为。 */
  link?: string;
}

export interface NewsSlide {
  href: string;
  image: string;
  caption: string;
}

export interface NewsListItem {
  href: string;
  title: string;
  excerpt: string;
}

export interface ProjectCard {
  href: string;
  title: string;
  subtitle: string;
  image: string;
}

export interface AboutCard {
  image: string;
  title: string;
  /** May contain `<br>` — rendered as HTML to match the source. */
  body: string;
  href: string;
  readMore: string;
}

export interface HomeData {
  lang: "zh" | "en";
  slider: Slide[];
  portfolio: {
    title: string;
    filters: PortfolioFilter[];
    items: PortfolioItem[];
  };
  video: { heading: string; body: string; src: string } | null;
  news: {
    title: string;
    slides: NewsSlide[];
    list: NewsListItem[];
    button: { href: string; label: string } | null;
  } | null;
  projects: { title: string; cards: ProjectCard[] } | null;
  about: { title: string; cards: AboutCard[] } | null;
}

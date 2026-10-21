/**
 * darlly 三个复制品类的**形状定义**（不再是数据的存放处）。
 *
 * 历史：本模块的前身 src/data/darlly.ts 里同时躺着类型和 50 条型号的常量数据
 * （外加 darlly-detail.ts / darlly-detail-en.ts 两份正文，合计约 1030 行）。
 * 2026-10-21 起这些数据搬进后台数据库（fc_product / fc_series，V12 迁移），
 * 页面在渲染时经 lib/darlly-source.ts 取数，本文件只留形状。
 *
 * 形状为什么不改：品类页组件 DarllyCategoryView 与泳池数据源 pool-source
 * 共用同一个 DarllyCategory 入参，改形状等于两个数据源一起返工。
 */
import type { Bilingual } from "./catalog";

/** 品类页里的一件产品 */
export interface DarllyItem {
  /** URL 段（型号小写，如 stb） */
  slug: string;
  /** 型号前缀，用于详情页与询价参数 */
  model: string;
  /** 产品图（后台「商品图集」的第一张） */
  img: string;
  name: Bilingual;
  desc: Bilingual;
  /** 原站详情页，作为文案出处存档 */
  sourceUrl: string;
}

/** 「选择类别」下的一个子分类 */
export interface DarllySubcat {
  key: string;
  label: Bilingual;
  /** 归属本子分类的型号 slug（原站一个型号可属多个子分类） */
  models: string[];
}

/** 一个品类页 */
export interface DarllyCategory {
  slug: string;
  banner: string;
  /** 面包屑末级文字 */
  crumb: Bilingual;
  /** 「选择类别」标题 */
  header: Bilingual;
  /** 「所有」按钮文字 */
  allLabel: Bilingual;
  /** 每页条数（原站固定 9 条一页） */
  pageSize: number;
  subcats: DarllySubcat[];
  items: DarllyItem[];
}

/** 一份详情正文 */
export interface DarllyDetail {
  /** 正文 HTML（古腾堡区块，含内联样式） */
  html: string;
  /** 产品 PDF 地址，空串表示原站也没提供 */
  pdf: string;
  /** 正文里带 id 的标题，用于生成锚点条 */
  ids: string[];
}

/** 中英两份正文：英文页优先用 en，没有则回退 zh 并在页首说明 */
export interface DarllyDetails {
  zh?: DarllyDetail;
  en?: DarllyDetail;
}

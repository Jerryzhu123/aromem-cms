/**
 * 泳池滤芯单品规格的**类型定义**（不再存放规格数据）。
 *
 * 历史：本文件原本是 _compare/pool/gen.py 自动生成的 POOL_DETAILS 常量
 * （495 条型号的 OD / Length / Top / Bottom / Manufacturer / Replacement，
 * 约 3900 行）。2026-10-21 起这些字段在渲染时从后台接口取
 * （lib/pool-source.ts，来源 fc_product + fc_cross_reference），
 * 常量与同步查询函数 getPoolDetail 一并删除，只留类型。
 */

export interface PoolDetail {
  sku: string;
  od: string;
  length: string;
  top: string;
  bottom: string;
  /** 原厂对应机型（Manufacturer 原文） */
  maker: string;
  /** 可替代的第三方件号，形如 Unicel: C-9404 */
  replacements: string[];
  images: string[];
}

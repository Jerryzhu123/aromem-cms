/**
 * 泳池 / SPA 滤芯的**类型定义**（不再存放型号数据）。
 *
 * 历史：本文件原本是 _compare/pool/gen.py 自动生成的 495 条型号常量
 * （POOL_ITEMS + BUCKETS + POOL_CATEGORY，约 7400 行）。2026-10-21 起
 * 泳池数据在渲染时从后台接口取（lib/pool-source.ts），常量失去消费者，
 * 同日删除 —— 类型保留，因为 pool-source 与 PoolProductView 仍要用。
 *
 * 数据落在后台哪里：fc_product（series_slug = 'pool'）与 fc_series（slug = 'pool'）。
 */

export interface PoolItem {
  slug: string;
  sku: string;
  name: string;
  /** 中文名：件号与品牌保留原文，只把 sq.ft. 换成「平方英尺」 */
  nameZh: string;
  sqft: number | null;
  img: string;
  images: string[];
}

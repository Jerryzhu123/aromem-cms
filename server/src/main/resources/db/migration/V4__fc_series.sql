-- V4: 滤芯系列表（板块① Filter Cartridges & Housings 的六个子类数据源）。
-- 定位调整（2026-10-10）：产品分两大板块后，滤芯板块的系列清单改为后台可维护，
-- 不再写死在前端静态数据里。RO 板块（ro_series）待 RO 建模定稿后另出迁移。
-- 约定沿用 V2：utf8mb4 / utf8mb4_unicode_ci、DATETIME(3) 存 UTC、
-- status 用 DRAFT / PUBLISHED / OFFLINE。

CREATE TABLE fc_series (
    id           BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    slug         VARCHAR(64)  NOT NULL COMMENT '自然键：pp-melt-blown / string-wound / filter-housings 等',
    name_zh      VARCHAR(128) NOT NULL,
    name_en      VARCHAR(128) NOT NULL,
    tagline_zh   VARCHAR(255) NULL,
    tagline_en   VARCHAR(255) NULL,
    facets_zh    TEXT         NULL COMMENT '中文切面/卖点，JSON 数组字符串',
    facets_en    TEXT         NULL COMMENT '英文切面/卖点，JSON 数组字符串',
    sort_order   INT          NOT NULL DEFAULT 0,
    coming_soon  TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '暂未上架标记（详情入口降级为敬请期待）',
    status       VARCHAR(16)  NOT NULL DEFAULT 'PUBLISHED' COMMENT 'DRAFT / PUBLISHED / OFFLINE',
    create_time  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    update_time  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE KEY uk_fc_series_slug (slug),
    INDEX idx_fc_series_sort (status, sort_order)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

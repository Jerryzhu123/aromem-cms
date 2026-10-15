-- V8: 首页产品中心瓷砖表（CMS 驱动三分区口径）。
--
-- 背景：旧链路的瓷砖来自源站爬取的 product 表（膜元件），"家用/工业"筛选
-- 靠后端标题字符串匹配（matchesSeries），与新定位（①滤芯与壳体 ②RO 膜与组件
-- ③配件）完全不兼容。本表把首页瓷砖变成后台可维护数据：
--   * board 即分区（cartridges / ro / accessories），前端筛选项按它过滤；
--   * 筛选项标签仍由 home_section(code=portfolio) 的 subtitle JSON 提供（现有机制）；
--   * image_url 允许为空——前台已有占位图机制，有货再传图；
--   * link_url 指向板块/系列页，有链接的瓷砖点击跳页面，不再弹大图。
-- 旧 product 表保留（新闻详情等仍引用），只是首页瓷砖不再依赖它。

CREATE TABLE home_tile (
    id         BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    board      VARCHAR(32)  NOT NULL COMMENT '分区：cartridges=滤芯与壳体 / ro=RO膜与组件 / accessories=通用配件',
    name_zh    VARCHAR(128) NOT NULL,
    name_en    VARCHAR(128) NOT NULL,
    image_url  VARCHAR(255) NULL COMMENT '为空时前台显示占位图',
    link_url   VARCHAR(255) NULL COMMENT '有值时点击跳转页面（如 /products/filter-cartridges/high-flow）',
    sort_order INT          NOT NULL DEFAULT 0,
    status     VARCHAR(16)  NOT NULL DEFAULT 'PUBLISHED' COMMENT 'DRAFT / PUBLISHED / OFFLINE',
    create_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    update_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    INDEX idx_home_tile (status, board, sort_order)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

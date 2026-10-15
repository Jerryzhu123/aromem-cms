-- V7: 滤芯型号表 + 型号对照表（补齐前台等待的两个接口的数据源）。
--
-- 背景：前台 services/cms/filterCartridges.ts 一直在调
--   GET /api/v1/filter-cartridges/products        （系列下型号列表）
--   GET /api/v1/filter-cartridges/products/{slug} （型号详情）
--   GET /api/v1/cross-reference                   （型号对照检索）
-- 后端此前只实现了 fc-series，这两个接口 404/500 后前台走静态兜底，
-- 后台管不到型号。本迁移补齐数据源，控制器随后接上。
--
-- 建模范式：主规格平铺成列（便于后台表格直接编辑、排序筛选），
-- 多值/嵌套结构（图集、兼容型号、文档、认证、应用行业）存 JSON 字符串，
-- 由后端解析成前端 FcProduct / FcCrossReferenceRow 的形状——
-- 与前端静态数据的 TypeScript 类型一一对应，零改动切换。
--
-- 参数值沿用静态数据的占位约定：客户提供前 data_status='awaiting-client-data'，
-- 不编造任何 SURMEM 真实参数。

CREATE TABLE fc_product (
    id                     BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    series_slug            VARCHAR(64)  NOT NULL COMMENT '所属系列，对应 fc_series.slug',
    model                  VARCHAR(128) NOT NULL COMMENT 'SURMEM 型号（客户提供前为占位）',
    slug                   VARCHAR(128) NOT NULL,
    title                  VARCHAR(255) NOT NULL,
    title_zh               VARCHAR(255) NULL,
    subtitle               VARCHAR(255) NULL,
    subtitle_zh            VARCHAR(255) NULL,
    gallery_json           TEXT         NULL COMMENT '图片 URL 数组 JSON',
    overall_length         VARCHAR(32)  NULL,
    overall_length_unit    VARCHAR(32)  NULL,
    overall_length_unit_zh VARCHAR(32)  NULL,
    outside_diameter       VARCHAR(32)  NULL,
    outside_diameter_unit  VARCHAR(32)  NULL,
    outside_diameter_unit_zh VARCHAR(32) NULL,
    inner_diameter         VARCHAR(32)  NULL,
    micron_absolute        VARCHAR(32)  NULL,
    micron_nominal         VARCHAR(32)  NULL,
    media_material_json    TEXT         NULL COMMENT '滤材数组 JSON，如 ["PP"]',
    end_cap                VARCHAR(128) NULL,
    connection             VARCHAR(128) NULL,
    flow_rate_min          VARCHAR(32)  NULL,
    flow_rate_max          VARCHAR(32)  NULL,
    flow_rate_unit         VARCHAR(32)  NULL,
    flow_rate_unit_zh      VARCHAR(32)  NULL,
    max_temperature_c      VARCHAR(32)  NULL,
    max_pressure_drop_psid VARCHAR(32)  NULL,
    application_industries_json TEXT    NULL COMMENT '应用行业数组 JSON',
    compatible_models_json TEXT         NULL COMMENT '兼容型号数组 JSON：[{brand,oemModel,relation,note,noteZh}]',
    documents_json         TEXT         NULL COMMENT '文档数组 JSON：[{docType,title,titleZh,fileUrl,fileSizeBytes,lang,revision}]',
    certifications_json    TEXT         NULL COMMENT '认证数组 JSON',
    seo_title              VARCHAR(255) NULL,
    seo_title_zh           VARCHAR(255) NULL,
    seo_description        VARCHAR(500) NULL,
    seo_description_zh     VARCHAR(500) NULL,
    data_status            VARCHAR(32)  NOT NULL DEFAULT 'awaiting-client-data' COMMENT 'awaiting-client-data / provided',
    status                 VARCHAR(16)  NOT NULL DEFAULT 'PUBLISHED',
    sort_order             INT          NOT NULL DEFAULT 0,
    create_time            DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    update_time            DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE KEY uk_fc_product (series_slug, slug),
    INDEX idx_fc_product_series (status, series_slug, sort_order)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE fc_cross_reference (
    id            BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    brand         VARCHAR(128) NOT NULL COMMENT '原厂/兼容品牌',
    oem_model     VARCHAR(128) NOT NULL COMMENT '对型号号',
    relation      VARCHAR(32)  NOT NULL DEFAULT 'compatible' COMMENT 'direct replacement / compatible / similar spec',
    note          VARCHAR(500) NULL,
    note_zh       VARCHAR(500) NULL,
    surmem_model  VARCHAR(128) NOT NULL COMMENT '对应 SURMEM 型号',
    series_slug   VARCHAR(64)  NULL,
    product_slug  VARCHAR(128) NULL COMMENT '对应 fc_product.slug（可空：对照先行、型号后补）',
    status        VARCHAR(16)  NOT NULL DEFAULT 'PUBLISHED',
    sort_order    INT          NOT NULL DEFAULT 0,
    create_time   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    update_time   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    INDEX idx_fxref_oem (oem_model),
    INDEX idx_fxref_brand (brand, status),
    INDEX idx_fxref_surmem (surmem_model)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- V10: 滤芯型号表补齐泳池类规格字段（495 条泳池滤芯入库前置）。
--
-- 背景：fc_product 建表时（V7）按工业滤芯的参数形态设计，泳池滤芯有四个
-- 独有属性无处安放——过滤面积（sq.ft.）、上/下端盖形式、原厂对应机型。
-- 前台 pool-detail.ts 的 PoolDetail 里这些是必填展示项，不落库就没法在
-- 后台表格里维护，所以补齐。
--
-- 字段命名对齐既有习惯：能拆中英的就成对（_zh 后缀），多值/嵌套才用 JSON。
-- 端盖的取值形如 "3/8" Open" / "bar Handle" / "6" Open"，是固定短语而非
-- 自由文本，故与 od / length 一样按原文字符串存，不做单位拆分。
--
-- 数据状态：泳池这批来源为 darllyfilter.com 原站商品页，
-- 客户未逐条确认，入库时 data_status 一律 'awaiting-client-data'。

ALTER TABLE fc_product
    ADD COLUMN sqft            DECIMAL(8, 2) NULL COMMENT '过滤面积（平方英尺），泳池类专有' AFTER outside_diameter_unit_zh,
    ADD COLUMN end_cap_top     VARCHAR(64)   NULL COMMENT '上端盖形式，如 3/8" Open' AFTER sqft,
    ADD COLUMN end_cap_bottom  VARCHAR(64)   NULL COMMENT '下端盖形式，如 6" Open' AFTER end_cap_top,
    ADD COLUMN oem_machine     VARCHAR(500)  NULL COMMENT '原厂对应机型（原站 Manufacturer 原文）' AFTER end_cap_bottom,
    ADD COLUMN source_url      VARCHAR(500)  NULL COMMENT '数据来源页（存证用，客户确认后置空）' AFTER certifications_json;

-- 后台按系列浏览 495 条时要走这个索引；V7 已建 idx_fc_product_series
-- (status, series_slug, sort_order)，此处补充按型号检索的能力。
CREATE INDEX idx_fc_product_model ON fc_product (model);

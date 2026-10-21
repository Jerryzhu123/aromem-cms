-- V11: 把工业滤芯的详情文案从编译期常量搬进库。
--
-- 背景：fc_product 按 V7 的「主规格平铺成列」建模，服务泳池 495 条；
-- 而 surmem-web/src/data/catalog.ts 里那 25 个工业型号还额外带
-- category / spec / summary / application / technicalNote 五个前台要渲染的文本，
-- 库里没有对应列，导致这批型号后台看不见、也改不了。
--
-- 归位原则（依据 2026-10-21 对 25 条静态数据的实测统计）：
--
--   ① 每型号独有的文本 → 落 fc_product（本文件前半段）
--      · spec / summary / technicalNote：25 条各不相同
--      · category：8 种取值（High Flow / Pleated / Depth / Specialty /
--        Ultra Low Pressure / Fouling Resistant / Extremely Low Pressure /
--        Brackish Water），是比系列细一层的短标签
--      · application：RO 各型号的场景描述，逐条不同
--
--   ② 全系列共用的模板文案 → 落 fc_series（本文件后半段）
--      · checklist：25 条里只有 2 种取值，15 条 filter 共用一份、
--        10 条 ro 共用一份
--      · verification：同样只有 2 种，分组与上一条完全一致
--      这两组的分野恰好等于 series_slug（6 个滤芯系列 / ro-membranes），
--      属于系列级而非型号级。若复制进每行，改一个字要改 25 行。
--
-- 约定沿用 V7：双语一律成对列（title / title_zh 的既有写法），
-- 不用 {en,zh} JSON —— 成对列能排序、能筛选、后台直接给两个输入框。
-- 新增列全部允许 NULL：泳池 495 条不需要它们，保持原样。

ALTER TABLE fc_product
    ADD COLUMN category_zh         VARCHAR(64)  NULL COMMENT '分类短名（中文），如 大流量',
    ADD COLUMN category_en         VARCHAR(64)  NULL COMMENT '分类短名（英文），如 High Flow',
    ADD COLUMN spec_zh             VARCHAR(255) NULL COMMENT '规格摘要（中文），前台规格表「规格」一行',
    ADD COLUMN spec_en             VARCHAR(255) NULL,
    ADD COLUMN summary_zh          VARCHAR(500) NULL COMMENT '首屏简介（中文）',
    ADD COLUMN summary_en          VARCHAR(500) NULL,
    ADD COLUMN application_note_zh TEXT         NULL COMMENT '应用领域说明（中文，段落）',
    ADD COLUMN application_note_en TEXT         NULL,
    ADD COLUMN technical_note_zh   TEXT         NULL COMMENT '复核说明（中文，段落）',
    ADD COLUMN technical_note_en   TEXT         NULL;

ALTER TABLE fc_series
    ADD COLUMN checklist_zh    TEXT NULL COMMENT '报价清单（中文），竖线分隔，一项一条',
    ADD COLUMN checklist_en    TEXT NULL COMMENT '报价清单（英文），竖线分隔',
    ADD COLUMN verification_zh TEXT NULL COMMENT '核实声明（中文，段落）',
    ADD COLUMN verification_en TEXT NULL;

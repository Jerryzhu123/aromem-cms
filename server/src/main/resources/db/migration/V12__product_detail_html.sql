-- V12: darlly 三个复制品类的 50 条产品入库前置。
--
-- 背景：surmem-web 的微孔折叠（34 款）/ 大流量（14 款）/ 多折（2 款）三个
-- 品类页是逐字复制原站（cn.darllyfiltration.com）得到的，数据一直以编译期
-- 常量形式存在 src/data/darlly.ts + darlly-detail.ts + darlly-detail-en.ts
-- （约 1030 行）。后果是后台看不见、改不了，前台改一个字要重新构建部署。
--
-- 这批与 V11 那 25 条工业滤芯的差别在于：它们带一份完整的产品详情正文，
-- 是原站古腾堡区块的富文本（含内联样式的表格、图集、锚点标题），
-- 最长一条 6991 字符，VARCHAR 装不下，故用 LONGTEXT。
--
-- 归位原则沿用 V11：
--   ① 型号独有的文本 → fc_product（正文、名称、简介、来源页）
--   ② 系列共用的模板文案 → fc_series（报价清单、核实声明，V11 已建列且有值，
--      本文件只补子分类字典）
--
-- 子分类为什么是两张表各一列：
--   原站的「选择类别」药丸是**多对多**——nanosuave 同时属于 PES / Nylon / GF
--   三个子分类，131 同时属于 PP / PES / PTFE。字典（key + 双语显示名）是
--   系列级、12 条，放 fc_series；归属关系是型号级，放 fc_product。
--   不做关联表：子分类过滤在前台是按系列取全量后内存筛选（原站每页 9 条），
--   SQL 层不需要 join，一张关联表只会多一次查询和一套 CRUD。
--
-- summary 扩容的原因（实测，非预判）：
--   50 条原站描述里最长的一条（HC 系列）英文 532 字符，超出 V11 定的
--   VARCHAR(500)。utf8mb4 下 VARCHAR 按字符计，532 > 500 会被严格模式拒绝。
--   首屏简介本就该是段落级文本，不该有硬上限，故中英一并改 TEXT。

ALTER TABLE fc_product
    ADD COLUMN detail_html_zh LONGTEXT     NULL COMMENT '详情正文（中文，原站富文本，含内联样式）' AFTER technical_note_en,
    ADD COLUMN detail_html_en LONGTEXT     NULL COMMENT '详情正文（英文，原站富文本）' AFTER detail_html_zh,
    ADD COLUMN subcats_json   VARCHAR(255) NULL COMMENT '所属子分类 key 数组 JSON，如 ["pes","nylon","gf"]' AFTER detail_html_en;

ALTER TABLE fc_product
    MODIFY COLUMN summary_zh TEXT NULL COMMENT '首屏简介（中文，段落级）',
    MODIFY COLUMN summary_en TEXT NULL COMMENT '首屏简介（英文，段落级）';

ALTER TABLE fc_series
    ADD COLUMN subcats_json TEXT NULL COMMENT '子分类字典 JSON：[{key,labelZh,labelEn}]，顺序即页面药丸顺序';

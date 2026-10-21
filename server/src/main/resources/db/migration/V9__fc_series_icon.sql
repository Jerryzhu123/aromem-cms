-- V9: 滤芯系列增加分类图标。
-- 产品中心页改为「图标 + 名称」的格子展示（对齐同类站点常见的产品导航版式），
-- 每个分类一张线描图标。图标文件走媒体库统一存放，此列只存 relativeUrl
-- （/media/... 形式），前台经 Nginx 反代访问，后台预览也直接拼这个路径。

ALTER TABLE fc_series
    ADD COLUMN icon_url VARCHAR(500) NULL COMMENT '分类图标（媒体库 relativeUrl）' AFTER facets_en;

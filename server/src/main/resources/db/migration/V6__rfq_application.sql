-- V6: 询价表补 application（应用场景）列。
-- 缺口原因：前端 QuoteForm 收集并提交 application，但 V5 建表时漏了这一列，
-- 客户填的应用场景被丢弃。V5 已应用不可改（Flyway 校验和），按标准做法出 V6 加列。
-- 口径：自由文本，对应前端表单「应用场景」输入项。

ALTER TABLE rfq_submission
    ADD COLUMN application VARCHAR(255) NULL COMMENT '应用场景' AFTER message;

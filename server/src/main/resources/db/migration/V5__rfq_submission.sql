-- V5: 询价/样品申请表（承接前台 /api/v1/rfq 表单提交）。
-- 数据来源：前台询价表单（cloner QuoteForm），提交即落库，后台「询价管理」页可查可改状态。
-- 约定沿用 V2/V4：utf8mb4 / utf8mb4_unicode_ci、DATETIME(3) 存 UTC、snake_case 列。
-- status 为处理状态：NEW（新进）/ PROCESSING（处理中）/ CLOSED（已关闭），
-- 与内容表的 DRAFT/PUBLISHED/OFFLINE 是两套语义，不混用。

CREATE TABLE rfq_submission (
    id                BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    request_type      VARCHAR(16)  NOT NULL DEFAULT 'quote' COMMENT 'quote=询价 / sample=样品申请',
    full_name         VARCHAR(128) NOT NULL,
    company           VARCHAR(255) NULL,
    work_email        VARCHAR(255) NOT NULL,
    phone             VARCHAR(64)  NULL,
    account_type      VARCHAR(32)  NULL COMMENT 'Distributor / End user',
    monthly_volume    VARCHAR(64)  NULL,
    industry          VARCHAR(128) NULL,
    country           VARCHAR(128) NULL,
    part_number       VARCHAR(128) NULL COMMENT '询价型号',
    quantity          VARCHAR(64)  NULL,
    target_micron     VARCHAR(64)  NULL,
    required_lead_time VARCHAR(64) NULL,
    message           TEXT         NULL,
    source_path       VARCHAR(255) NULL COMMENT '提交来源页路径',
    source_series     VARCHAR(64)  NULL COMMENT '来源系列 slug',
    source_model      VARCHAR(128) NULL COMMENT '来源型号 slug',
    status            VARCHAR(16)  NOT NULL DEFAULT 'NEW' COMMENT 'NEW / PROCESSING / CLOSED',
    create_time       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    update_time       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    INDEX idx_rfq_status (status, create_time),
    INDEX idx_rfq_email (work_email)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

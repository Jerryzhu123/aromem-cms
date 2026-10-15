-- ============================================================================
--  V1 — 媒体文件元数据表
--
--  存储策略（硬约束）：媒体实体文件**禁止入库**，落在后端独立目录
--  backend-storage/public-media；本表只记录元数据；对外经 /media/** 静态路由访问。
--  业务表通过 file_id 关联，将来迁到 OSS 时只改路径解析逻辑，业务数据不动。
--
--  表结构按需求给定的 DDL 原样建立，未做改动。
-- ============================================================================

CREATE TABLE media_meta (
    id            BIGINT PRIMARY KEY AUTO_INCREMENT,
    file_id       VARCHAR(64)  NOT NULL UNIQUE COMMENT '文件唯一标识fileId',
    physical_path VARCHAR(255) NOT NULL COMMENT '后端磁盘真实路径 backend-storage/public-media/xxx.png',
    relative_url  VARCHAR(255) NOT NULL COMMENT '/media/xxx.png',
    file_name     VARCHAR(255) COMMENT '原始文件名',
    file_size     BIGINT COMMENT '文件字节大小',
    mime_type     VARCHAR(128) COMMENT '资源MIME类型',
    md5           VARCHAR(64) COMMENT '文件md5，用于去重校验',
    create_time   DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4;

-- 去重查询走 md5；UNIQUE 不加在 md5 上，因为「同内容复用同一 fileId」是业务规则，
-- 而不是数据库约束（历史上可能已存在多行同 md5 的数据）。
CREATE INDEX idx_media_meta_md5 ON media_meta (md5);

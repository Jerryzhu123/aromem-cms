-- ============================================================================
--  V2 — 内容域建表（P1 导入配套）
--
--  约定（见 docs/backend/DESIGN.md §3）：
--  * utf8mb4 / utf8mb4_0900_ai_ci（内容含中文与 ®）
--  * 主键 BIGINT UNSIGNED AUTO_INCREMENT；时间 DATETIME(3) 存 UTC
--  * 逻辑删除用 status：DRAFT / PUBLISHED / OFFLINE
--  * 多语言：内容表带 locale 列（zh-CN / en-US），源站中英是两套独立内容
--  * 幂等自然键：(locale, source_id) —— source_id 是源站自己的数字 id
--  * 图片引用存 URL 字符串（/uploads/...），不强加 media_meta 外键：
--    数据源（爬取产物）给的是路径，HTML 里也是同一路径，保持原样最稳
--  * 外壳类小表（nav/footer/home_*/site_setting）由 importer 先清后插；
--    主体表（article/product/project/page）按 (locale, source_id) upsert
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 站点外壳
-- ----------------------------------------------------------------------------

CREATE TABLE site_locale (
    id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    code        VARCHAR(16)  NOT NULL UNIQUE COMMENT 'zh-CN / en-US',
    name        VARCHAR(64)  NOT NULL,
    is_default  TINYINT(1)   NOT NULL DEFAULT 0,
    sort_order  INT          NOT NULL DEFAULT 0
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE site_setting (
    id            BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    locale        VARCHAR(16)  NOT NULL,
    setting_key   VARCHAR(64)  NOT NULL COMMENT 'address / phone / emails / qr / copyright / icp_label / icp_url / seo_*',
    setting_value TEXT,
    updated_at    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE KEY uk_setting (locale, setting_key)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE nav_menu (
    id            BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    locale        VARCHAR(16)  NOT NULL,
    parent_id     BIGINT UNSIGNED NULL COMMENT 'NULL = 一级菜单',
    label         VARCHAR(128) NOT NULL,
    target_type   VARCHAR(16)  NOT NULL DEFAULT 'ROUTE' COMMENT 'PAGE|ARTICLE|PRODUCT|PROJECT|ROUTE|EXTERNAL',
    target_value  VARCHAR(255) NOT NULL,
    sort_order    INT          NOT NULL DEFAULT 0,
    visible       TINYINT(1)   NOT NULL DEFAULT 1,
    open_new_tab  TINYINT(1)   NOT NULL DEFAULT 0,
    INDEX idx_nav (locale, parent_id, sort_order)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE footer_column (
    id         BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    locale     VARCHAR(16)  NOT NULL,
    title      VARCHAR(128) NOT NULL,
    sort_order INT          NOT NULL DEFAULT 0,
    INDEX idx_footer_col (locale, sort_order)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE footer_link (
    id           BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    locale       VARCHAR(16)  NOT NULL,
    column_id    BIGINT UNSIGNED NOT NULL,
    label        VARCHAR(128) NOT NULL,
    target_type  VARCHAR(16)  NOT NULL DEFAULT 'ROUTE',
    target_value VARCHAR(255) NOT NULL,
    sort_order   INT          NOT NULL DEFAULT 0,
    INDEX idx_footer_link (locale, column_id, sort_order)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE page_banner (
    id         BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    banner_key VARCHAR(64) NOT NULL UNIQUE COMMENT 'about / product / news / project / join 等，由内容类型推导',
    html       LONGTEXT    NOT NULL COMMENT '源站 banner 区块原样 HTML'
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 单行表：内容每次写操作 revision+1，用于缓存失效与前端条件请求
CREATE TABLE site_revision (
    id         BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    revision   BIGINT      NOT NULL DEFAULT 1,
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- ----------------------------------------------------------------------------
-- 首页区块
-- ----------------------------------------------------------------------------

CREATE TABLE home_slide (
    id         BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    locale     VARCHAR(16)  NOT NULL,
    image_url  VARCHAR(500) NOT NULL,
    alt        VARCHAR(255) NULL,
    link_url   VARCHAR(500) NULL,
    sort_order INT          NOT NULL DEFAULT 0,
    status     VARCHAR(16)  NOT NULL DEFAULT 'PUBLISHED',
    INDEX idx_slide (locale, sort_order)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE home_section (
    id         BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    locale     VARCHAR(16)  NOT NULL,
    code       VARCHAR(32)  NOT NULL COMMENT 'portfolio / news / projects / about / video',
    title      VARCHAR(255) NULL,
    subtitle   VARCHAR(255) NULL,
    sort_order INT          NOT NULL DEFAULT 0,
    enabled    TINYINT(1)   NOT NULL DEFAULT 1,
    UNIQUE KEY uk_section (locale, code)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE home_about_card (
    id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    locale          VARCHAR(16)  NOT NULL,
    image_url       VARCHAR(500) NULL,
    title           VARCHAR(255) NOT NULL,
    body_html       TEXT         NULL,
    link_url        VARCHAR(500) NULL,
    read_more_label VARCHAR(64)  NULL,
    sort_order      INT          NOT NULL DEFAULT 0,
    INDEX idx_about_card (locale, sort_order)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE home_video (
    id         BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    locale     VARCHAR(16)   NOT NULL UNIQUE,
    heading    VARCHAR(255)  NULL,
    body_html  TEXT          NULL,
    video_url  VARCHAR(500)  NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- ----------------------------------------------------------------------------
-- 内容主体
-- ----------------------------------------------------------------------------

CREATE TABLE product_category (
    id         BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    locale     VARCHAR(16)  NOT NULL,
    parent_id  BIGINT UNSIGNED NULL,
    name       VARCHAR(128) NOT NULL,
    slug       VARCHAR(64)  NULL,
    sort_order INT          NOT NULL DEFAULT 0,
    visible    TINYINT(1)   NOT NULL DEFAULT 1,
    INDEX idx_pcat (locale, parent_id, sort_order)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE product (
    id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    source_id       BIGINT       NOT NULL COMMENT '源站 ?id=N 的 N',
    locale          VARCHAR(16)  NOT NULL,
    category_id     BIGINT UNSIGNED NULL,
    title           VARCHAR(255) NOT NULL,
    subtitle        VARCHAR(255) NULL,
    summary         TEXT         NULL,
    cover_url       VARCHAR(500) NULL,
    content_html    LONGTEXT     NULL,
    seo_title       VARCHAR(255) NULL,
    seo_keywords    VARCHAR(500) NULL,
    seo_description TEXT         NULL,
    status          VARCHAR(16)  NOT NULL DEFAULT 'PUBLISHED',
    sort_order      INT          NOT NULL DEFAULT 0,
    published_at    DATETIME(3)  NULL,
    created_at      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE KEY uk_product (locale, source_id),
    INDEX idx_product_list (locale, status, category_id, sort_order)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE project (
    id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    source_id       BIGINT       NOT NULL,
    locale          VARCHAR(16)  NOT NULL,
    title           VARCHAR(255) NOT NULL,
    subtitle        VARCHAR(255) NULL,
    cover_url       VARCHAR(500) NULL,
    content_html    LONGTEXT     NULL,
    seo_title       VARCHAR(255) NULL,
    seo_keywords    VARCHAR(500) NULL,
    seo_description TEXT         NULL,
    status          VARCHAR(16)  NOT NULL DEFAULT 'PUBLISHED',
    sort_order      INT          NOT NULL DEFAULT 0,
    published_at    DATETIME(3)  NULL,
    created_at      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE KEY uk_project (locale, source_id),
    INDEX idx_project_list (locale, status, sort_order)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE article (
    id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    source_id       BIGINT       NOT NULL,
    locale          VARCHAR(16)  NOT NULL,
    title           VARCHAR(255) NOT NULL,
    summary         TEXT         NULL,
    cover_url       VARCHAR(500) NULL,
    content_html    LONGTEXT     NULL,
    content_text    MEDIUMTEXT   NULL COMMENT '从 content_html 抽取的纯文本，供检索',
    author          VARCHAR(128) NULL,
    source          VARCHAR(255) NULL,
    published_at    DATETIME(3)  NULL,
    is_top          TINYINT(1)   NOT NULL DEFAULT 0,
    view_count      INT          NOT NULL DEFAULT 0,
    seo_title       VARCHAR(255) NULL,
    seo_keywords    VARCHAR(500) NULL,
    seo_description TEXT         NULL,
    status          VARCHAR(16)  NOT NULL DEFAULT 'PUBLISHED',
    created_at      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE KEY uk_article (locale, source_id),
    INDEX idx_article_list (locale, status, is_top, source_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE page (
    id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    source_id       BIGINT       NULL,
    locale          VARCHAR(16)  NOT NULL,
    code            VARCHAR(32)  NOT NULL COMMENT 'about1..4 / join / handbook',
    title           VARCHAR(255) NOT NULL,
    subtitle        VARCHAR(255) NULL,
    banner_key      VARCHAR(64)  NULL,
    content_html    LONGTEXT     NULL,
    seo_title       VARCHAR(255) NULL,
    seo_keywords    VARCHAR(500) NULL,
    seo_description TEXT         NULL,
    status          VARCHAR(16)  NOT NULL DEFAULT 'PUBLISHED',
    sort_order      INT          NOT NULL DEFAULT 0,
    created_at      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE KEY uk_page (locale, code)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE download (
    id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    locale          VARCHAR(16)  NOT NULL,
    title           VARCHAR(255) NOT NULL,
    category        VARCHAR(64)  NULL,
    file_url        VARCHAR(500) NULL,
    file_size_bytes BIGINT       NULL,
    download_count  INT          NOT NULL DEFAULT 0,
    sort_order      INT          NOT NULL DEFAULT 0,
    status          VARCHAR(16)  NOT NULL DEFAULT 'PUBLISHED',
    INDEX idx_download (locale, status, sort_order)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- ----------------------------------------------------------------------------
-- 管理端（P4 使用，随 V2 一次建齐）
-- ----------------------------------------------------------------------------

CREATE TABLE admin_user (
    id            BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    username      VARCHAR(64)  NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL COMMENT 'BCrypt',
    display_name  VARCHAR(64)  NULL,
    email         VARCHAR(128) NULL,
    status        VARCHAR(16)  NOT NULL DEFAULT 'ACTIVE',
    last_login_at DATETIME(3)  NULL,
    created_at    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE admin_role (
    id   BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(32) NOT NULL UNIQUE COMMENT 'ADMIN / EDITOR',
    name VARCHAR(64) NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE admin_user_role (
    user_id BIGINT UNSIGNED NOT NULL,
    role_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (user_id, role_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE audit_log (
    id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    actor       VARCHAR(64)  NOT NULL,
    action      VARCHAR(64)  NOT NULL,
    entity_type VARCHAR(32)  NULL,
    entity_id   BIGINT       NULL,
    detail_json TEXT         NULL,
    ip          VARCHAR(64)  NULL,
    created_at  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX idx_audit (entity_type, entity_id, created_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- ----------------------------------------------------------------------------
-- 预置数据
-- ----------------------------------------------------------------------------

INSERT INTO site_locale (code, name, is_default, sort_order) VALUES
    ('zh-CN', '简体中文', 1, 1),
    ('en-US', 'English', 0, 2);

INSERT INTO admin_role (code, name) VALUES
    ('ADMIN', '管理员'),
    ('EDITOR', '编辑');

INSERT INTO site_revision (revision) VALUES (1);

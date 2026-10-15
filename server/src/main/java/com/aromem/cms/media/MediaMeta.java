package com.aromem.cms.media;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

/**
 * 媒体文件元数据。**只存元数据，二进制字节绝不入库。**
 *
 * <p>表结构与需求给定的 DDL 一一对应（见 {@code V1__media_meta.sql}）。
 * 业务表通过 {@link #fileId} 关联本表，不直接引用磁盘路径 ——
 * 将来把本地磁盘换成 OSS 时，只改 {@code MediaService} 与静态路由，
 * 业务关联数据不需要动。
 */
@Entity
@Table(name = "media_meta")
public class MediaMeta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 全局唯一文件标识，业务表用它做关联键。形如 {@code m_20261003_8a7b6c5d}。 */
    @Column(name = "file_id", nullable = false, length = 64, unique = true)
    private String fileId;

    /** 后端磁盘真实路径，形如 {@code backend-storage/public-media/m_20261003_8a7b6c5d.png}。 */
    @Column(name = "physical_path", nullable = false, length = 255)
    private String physicalPath;

    /** 相对访问路径，形如 {@code /media/m_20261003_8a7b6c5d.png}，前端拼域名即可预览。 */
    @Column(name = "relative_url", nullable = false, length = 255)
    private String relativeUrl;

    @Column(name = "file_name", length = 255)
    private String fileName;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "mime_type", length = 128)
    private String mimeType;

    /** 文件 MD5，用于去重校验。 */
    @Column(name = "md5", length = 64)
    private String md5;

    @Column(name = "create_time")
    private LocalDateTime createTime;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFileId() {
        return fileId;
    }

    public void setFileId(String fileId) {
        this.fileId = fileId;
    }

    public String getPhysicalPath() {
        return physicalPath;
    }

    public void setPhysicalPath(String physicalPath) {
        this.physicalPath = physicalPath;
    }

    public String getRelativeUrl() {
        return relativeUrl;
    }

    public void setRelativeUrl(String relativeUrl) {
        this.relativeUrl = relativeUrl;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public String getMd5() {
        return md5;
    }

    public void setMd5(String md5) {
        this.md5 = md5;
    }

    public LocalDateTime getCreateTime() {
        return createTime;
    }

    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }
}

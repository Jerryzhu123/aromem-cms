package com.aromem.cms.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Locale;

/**
 * 媒体存储配置。
 *
 * <p>存储策略（硬约束，不得修改）：媒体实体文件**不入库**，落在后端独立目录
 * {@code backend-storage/public-media}；数据库只存元数据；对外通过
 * {@code /media/**} 静态路由访问。
 */
@ConfigurationProperties(prefix = "app.storage")
public class StorageProperties {

    /** 存储根目录（相对后端进程工作目录，或绝对路径）。 */
    private String root = "backend-storage/public-media";

    /** 对外访问前缀，与 {@code relativeUrl} 的前缀一致。 */
    private String urlPrefix = "/media";

    /** 允许的扩展名（小写，不含点）。图片 + 视频 + PDF 手册（下载中心刚需）。 */
    private List<String> allowedExtensions = List.of(
            "jpg", "jpeg", "png", "gif", "webp", "bmp", "svg",
            "mp4", "webm", "mov", "m4v", "avi", "mkv",
            "pdf");

    /** 允许的 MIME 前缀，兜底校验（有些客户端不带 content-type）。 */
    private List<String> allowedMimePrefixes = List.of("image/", "video/", "application/pdf");

    public String getRoot() {
        return root;
    }

    public void setRoot(String root) {
        this.root = root;
    }

    public String getUrlPrefix() {
        return urlPrefix;
    }

    public void setUrlPrefix(String urlPrefix) {
        this.urlPrefix = urlPrefix;
    }

    public List<String> getAllowedExtensions() {
        return allowedExtensions;
    }

    public void setAllowedExtensions(List<String> allowedExtensions) {
        this.allowedExtensions = allowedExtensions;
    }

    public List<String> getAllowedMimePrefixes() {
        return allowedMimePrefixes;
    }

    public void setAllowedMimePrefixes(List<String> allowedMimePrefixes) {
        this.allowedMimePrefixes = allowedMimePrefixes;
    }

    /** 存储根目录的绝对路径。 */
    public Path rootPath() {
        return Paths.get(root).toAbsolutePath().normalize();
    }

    public boolean isAllowedExtension(String extension) {
        if (extension == null) {
            return false;
        }
        return allowedExtensions.contains(extension.toLowerCase(Locale.ROOT));
    }

    public boolean isAllowedMime(String mimeType) {
        if (mimeType == null || mimeType.isBlank()) {
            // 客户端没给 content-type 时交给扩展名判断
            return true;
        }
        String lower = mimeType.toLowerCase(Locale.ROOT);
        return allowedMimePrefixes.stream().anyMatch(lower::startsWith);
    }
}

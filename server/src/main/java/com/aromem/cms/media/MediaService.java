package com.aromem.cms.media;

import com.aromem.cms.common.BizException;
import com.aromem.cms.common.ErrorCode;
import com.aromem.cms.config.StorageProperties;
import com.aromem.cms.media.dto.MediaUploadResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HexFormat;
import java.util.Locale;
import java.util.Optional;

/**
 * 媒体文件上传。
 *
 * <p>严格遵守存储策略：<b>二进制不入库</b>，文件落在
 * {@code backend-storage/public-media}，数据库只存 {@code media_meta} 元数据。
 *
 * <p>去重：先算 MD5，命中已有记录就直接复用那个 {@code fileId}，不重复占用磁盘。
 */
@Service
public class MediaService {

    private static final Logger log = LoggerFactory.getLogger(MediaService.class);

    private static final DateTimeFormatter DATE_PART = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final ZoneId ZONE = ZoneId.of("Asia/Shanghai");
    private static final int FILE_ID_RETRY = 5;

    private final StorageProperties storage;
    private final MediaMetaRepository repository;
    private final SecureRandom random = new SecureRandom();

    public MediaService(StorageProperties storage, MediaMetaRepository repository) {
        this.storage = storage;
        this.repository = repository;
    }

    @Transactional
    public MediaUploadResponse upload(MultipartFile file) {
        // ---- 1. 基本校验 ----
        if (file == null || file.isEmpty()) {
            throw new BizException(ErrorCode.MEDIA_EMPTY_FILE);
        }
        String originalName = file.getOriginalFilename();
        if (!StringUtils.hasText(originalName)) {
            throw new BizException(ErrorCode.MEDIA_ORIGINAL_NAME_MISSING);
        }
        // 只取文件名部分，挡掉 ../ 之类的路径穿越
        String safeName = Paths.get(originalName).getFileName().toString();
        String extension = extensionOf(safeName);

        if (!storage.isAllowedExtension(extension) || !storage.isAllowedMime(file.getContentType())) {
            throw new BizException(ErrorCode.MEDIA_UNSUPPORTED_TYPE,
                    "不支持的媒体类型：" + file.getContentType() + " / ." + extension);
        }

        // ---- 2. 计算 MD5（流式，避免大文件全量进内存）----
        String md5 = md5Of(file);

        // ---- 3. 去重：同 MD5 直接复用已有 fileId ----
        Optional<MediaMeta> existing = repository.findFirstByMd5(md5);
        if (existing.isPresent()) {
            MediaMeta hit = existing.get();
            log.info("媒体去重命中 md5={} -> 复用 fileId={}", md5, hit.getFileId());
            return MediaUploadResponse.from(hit);
        }

        // ---- 4. 生成唯一 fileId 并落盘 ----
        String fileId = nextFileId();
        String diskName = fileId + (extension.isEmpty() ? "" : "." + extension);
        Path root = storage.rootPath();
        Path target = root.resolve(diskName);

        try {
            Files.createDirectories(root);
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException e) {
            throw new BizException(ErrorCode.MEDIA_STORAGE_IO_ERROR,
                    "写入文件失败：" + e.getMessage(), e);
        }

        // ---- 5. 元数据入库（失败则回滚磁盘文件，避免孤儿）----
        MediaMeta meta = new MediaMeta();
        meta.setFileId(fileId);
        meta.setPhysicalPath(storage.getRoot() + "/" + diskName);
        meta.setRelativeUrl(storage.getUrlPrefix() + "/" + diskName);
        meta.setFileName(safeName);
        meta.setFileSize(file.getSize());
        meta.setMimeType(file.getContentType());
        meta.setMd5(md5);
        meta.setCreateTime(java.time.LocalDateTime.now(ZONE));

        try {
            repository.saveAndFlush(meta);
        } catch (DataAccessException e) {
            try {
                Files.deleteIfExists(target);
            } catch (IOException cleanupFailure) {
                log.warn("元数据写入失败后清理磁盘文件也失败: {}", target, cleanupFailure);
            }
            throw new BizException(ErrorCode.MEDIA_METADATA_SAVE_ERROR,
                    "文件元数据写入失败：" + e.getMessage(), e);
        }

        log.info("媒体上传成功 fileId={} name={} size={} mime={}",
                fileId, safeName, meta.getFileSize(), meta.getMimeType());
        return MediaUploadResponse.from(meta);
    }

    // ------------------------------------------------------------------

    private static String extensionOf(String fileName) {
        int dot = fileName.lastIndexOf('.');
        if (dot < 0 || dot == fileName.length() - 1) {
            return "";
        }
        return fileName.substring(dot + 1).toLowerCase(Locale.ROOT);
    }

    /** 形如 {@code m_20261003_8a7b6c5d}，与接口约定一致。 */
    private String nextFileId() {
        for (int i = 0; i < FILE_ID_RETRY; i++) {
            String candidate = "m_" + LocalDate.now(ZONE).format(DATE_PART) + "_" + randomHex8();
            if (!repository.existsByFileId(candidate)) {
                return candidate;
            }
        }
        throw new BizException(ErrorCode.MEDIA_STORAGE_IO_ERROR, "生成 fileId 失败：连续冲突");
    }

    private String randomHex8() {
        byte[] bytes = new byte[4];
        random.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    private String md5Of(MultipartFile file) {
        try (InputStream in = file.getInputStream()) {
            MessageDigest digest = MessageDigest.getInstance("MD5");
            byte[] buffer = new byte[8192];
            int read;
            while ((read = in.read(buffer)) != -1) {
                digest.update(buffer, 0, read);
            }
            return HexFormat.of().formatHex(digest.digest());
        } catch (IOException | NoSuchAlgorithmException e) {
            throw new BizException(ErrorCode.MEDIA_STORAGE_IO_ERROR,
                    "计算文件 MD5 失败：" + e.getMessage(), e);
        }
    }
}

package com.aromem.cms.media.dto;

import com.aromem.cms.media.MediaMeta;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * 上传成功的响应体，字段与需求给定的 JSON 一致：
 *
 * <pre>
 * { "code": 200, "data": { "fileId": "...", "filename": "...", "size": 102400,
 *                          "mime": "image/png", "relativeUrl": "/media/....png" } }
 * </pre>
 *
 * <p>注意：JSON 里是 {@code filename}（无下划线），与数据库列 {@code file_name} 不同名，
 * 因此用 {@code @JsonProperty} 显式指定，不依赖命名策略。
 */
public record MediaUploadResponse(
        @JsonProperty("fileId") String fileId,
        @JsonProperty("filename") String filename,
        @JsonProperty("size") Long size,
        @JsonProperty("mime") String mime,
        @JsonProperty("relativeUrl") String relativeUrl) {

    public static MediaUploadResponse from(MediaMeta meta) {
        return new MediaUploadResponse(
                meta.getFileId(),
                meta.getFileName(),
                meta.getFileSize(),
                meta.getMimeType(),
                meta.getRelativeUrl());
    }
}

package com.aromem.cms.media;

import com.aromem.cms.common.ApiResponse;
import com.aromem.cms.media.dto.MediaUploadResponse;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * 媒体上传接口。
 *
 * <pre>
 * POST /api/upload/media        (multipart/form-data, 字段名 file)
 *   → { "code": 200, "data": { "fileId", "filename", "size", "mime", "relativeUrl" } }
 * </pre>
 *
 * <p>上传后前端用 {@code relativeUrl} 拼域名即可预览；
 * 业务表存 {@code fileId} 做关联键，不存路径。
 */
@RestController
@RequestMapping("/api")
public class MediaController {

    private final MediaService mediaService;

    public MediaController(MediaService mediaService) {
        this.mediaService = mediaService;
    }

    @PostMapping(value = "/upload/media", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<MediaUploadResponse> upload(@RequestParam("file") MultipartFile file) {
        return ApiResponse.ok(mediaService.upload(file));
    }
}

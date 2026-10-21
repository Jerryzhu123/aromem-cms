package com.aromem.cms.common;

import org.springframework.http.HttpStatus;

/**
 * 业务错误码。
 *
 * <p>{@code code} 是给前端判断用的业务码，{@code httpStatus} 是对应的 HTTP 状态码 ——
 * 两者都返回，前端既能用 HTTP 语义（拦截器/网关），也能用业务码做精细提示。
 */
public enum ErrorCode {

    OK(200, "ok", HttpStatus.OK),

    // ---- 通用 ----
    BAD_REQUEST(400, "请求参数不合法", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED(401, "未登录或登录已失效", HttpStatus.UNAUTHORIZED),
    NOT_FOUND(404, "资源不存在", HttpStatus.NOT_FOUND),
    METHOD_NOT_ALLOWED(405, "请求方法不支持", HttpStatus.METHOD_NOT_ALLOWED),
    UNSUPPORTED_MEDIA_TYPE(415, "不支持的请求内容类型", HttpStatus.UNSUPPORTED_MEDIA_TYPE),
    INTERNAL_ERROR(500, "服务器内部错误", HttpStatus.INTERNAL_SERVER_ERROR),

    // ---- 媒体上传（4xxx 客户端问题）----
    MEDIA_EMPTY_FILE(4001, "上传文件为空", HttpStatus.BAD_REQUEST),
    MEDIA_FILE_TOO_LARGE(4002, "文件超出大小限制", HttpStatus.PAYLOAD_TOO_LARGE),
    MEDIA_UNSUPPORTED_TYPE(4003, "不支持的媒体类型", HttpStatus.UNSUPPORTED_MEDIA_TYPE),
    MEDIA_ORIGINAL_NAME_MISSING(4004, "无法获取原始文件名", HttpStatus.BAD_REQUEST),

    // ---- 媒体上传（5xxx 服务端问题）----
    MEDIA_STORAGE_IO_ERROR(5001, "文件存储失败（IO 异常）", HttpStatus.INTERNAL_SERVER_ERROR),
    MEDIA_METADATA_SAVE_ERROR(5002, "文件元数据写入失败", HttpStatus.INTERNAL_SERVER_ERROR);

    private final int code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(int code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }

    public int getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }
}

package com.aromem.cms.common;

/**
 * 统一响应体（前后端通用契约）：
 *
 * <pre>
 * { "code": 200, "msg": "success", "data": {} }
 * { "code": 500, "msg": "文件读取失败", "data": null }
 * </pre>
 *
 * <p>{@code code} 使用标准 HTTP 语义（200/400/401/404/500），媒体模块细分错误
 * 用 4xxx（客户端）/ 5xxx（服务端）短码并始终配对正确的 HTTP 状态码。
 * 前端拦截器按 {@code code == 200} 判成功，其余进统一异常分支。
 */
public record ApiResponse<T>(int code, String msg, T data) {

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(ErrorCode.OK.getCode(), "success", data);
    }

    public static <T> ApiResponse<T> ok() {
        return ok(null);
    }

    public static <T> ApiResponse<T> fail(ErrorCode errorCode) {
        return new ApiResponse<>(errorCode.getCode(), errorCode.getMessage(), null);
    }

    public static <T> ApiResponse<T> fail(ErrorCode errorCode, String message) {
        return new ApiResponse<>(errorCode.getCode(), message, null);
    }
}

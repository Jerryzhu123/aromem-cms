package com.aromem.cms.common;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/** 全局异常处理：所有异常统一转成 {@link ApiResponse}，HTTP 状态码同步设置。 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(BizException.class)
    public ResponseEntity<ApiResponse<Void>> handleBiz(BizException ex, HttpServletRequest request) {
        ErrorCode code = ex.getErrorCode();
        log.warn("业务异常 [{} {}] {} -> {} {}", request.getMethod(), request.getRequestURI(),
                code.name(), code.getCode(), ex.getMessage());
        return ResponseEntity.status(code.getHttpStatus())
                .body(ApiResponse.fail(code, ex.getMessage()));
    }

    /** 文件超过 spring.servlet.multipart.max-file-size。 */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<Void>> handleTooLarge(MaxUploadSizeExceededException ex) {
        ErrorCode code = ErrorCode.MEDIA_FILE_TOO_LARGE;
        log.warn("上传文件超限: {}", ex.getMessage());
        return ResponseEntity.status(code.getHttpStatus()).body(ApiResponse.fail(code));
    }

    /** multipart 请求本身有问题（缺 part、请求体不是 multipart 等）。 */
    @ExceptionHandler({MultipartException.class, MissingServletRequestPartException.class})
    public ResponseEntity<ApiResponse<Void>> handleMultipart(Exception ex) {
        ErrorCode code = ErrorCode.MEDIA_EMPTY_FILE;
        log.warn("multipart 请求异常: {}", ex.getMessage());
        return ResponseEntity.status(code.getHttpStatus())
                .body(ApiResponse.fail(code, "上传请求不合法：" + ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex) {
        String detail = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + " " + e.getDefaultMessage())
                .reduce((a, b) -> a + "; " + b)
                .orElse("参数校验失败");
        ErrorCode code = ErrorCode.BAD_REQUEST;
        return ResponseEntity.status(code.getHttpStatus())
                .body(ApiResponse.fail(code, detail));
    }

    /** 请求参数不合法（如非法 locale），返回 400 而非落进 500 兜底。 */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgument(IllegalArgumentException ex) {
        ErrorCode code = ErrorCode.BAD_REQUEST;
        return ResponseEntity.status(code.getHttpStatus()).body(ApiResponse.fail(code, ex.getMessage()));
    }

    /**
     * 未匹配的路径（接口不存在 / 静态资源不存在）返回 404 而非 500：
     * 一是与前端 client.ts 的「404 = 无数据」分支对齐，二是不让"路径不存在"
     * 在日志里伪装成后端故障。
     */
    @ExceptionHandler({NoResourceFoundException.class, NoHandlerFoundException.class})
    public ResponseEntity<ApiResponse<Void>> handleNotFound(Exception ex, HttpServletRequest request) {
        log.info("路径不存在 [{} {}]: {}", request.getMethod(), request.getRequestURI(), ex.getMessage());
        ErrorCode code = ErrorCode.NOT_FOUND;
        return ResponseEntity.status(code.getHttpStatus())
                .body(ApiResponse.fail(code, "接口或资源不存在: " + request.getRequestURI()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleUnexpected(Exception ex, HttpServletRequest request) {
        ErrorCode code = ErrorCode.INTERNAL_ERROR;
        log.error("未处理异常 [{} {}]", request.getMethod(), request.getRequestURI(), ex);
        return ResponseEntity.status(code.getHttpStatus()).body(ApiResponse.fail(code));
    }
}

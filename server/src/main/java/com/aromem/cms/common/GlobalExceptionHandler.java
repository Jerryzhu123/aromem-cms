package com.aromem.cms.common;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
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
     * 路径变量或查询参数类型转换失败。
     *
     * <p>典型场景：{@code /api/v1/admin/{domain}/{id}} 里的 id 声明为 long，
     * 调用方传了 {@code /api/v1/admin/content/fc-products}（把 content 当 domain、
     * fc-products 当 id），Spring 无法把 "fc-products" 解析成数字。这属于调用方
     * 给错地址，是 400 不是 500 —— 让它落进兜底会在日志里伪装成后端故障。
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Void>> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        ErrorCode code = ErrorCode.BAD_REQUEST;
        log.warn("参数类型不匹配 [{} {}] {}={}", request.getMethod(), request.getRequestURI(),
                ex.getName(), ex.getValue());
        return ResponseEntity.status(code.getHttpStatus())
                .body(ApiResponse.fail(code, "参数 " + ex.getName() + " 取值不合法: " + ex.getValue()));
    }

    /** 缺必填查询参数，同样是 400。 */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiResponse<Void>> handleMissingParam(
            MissingServletRequestParameterException ex, HttpServletRequest request) {
        ErrorCode code = ErrorCode.BAD_REQUEST;
        log.warn("缺少必填参数 [{} {}] {}", request.getMethod(), request.getRequestURI(), ex.getParameterName());
        return ResponseEntity.status(code.getHttpStatus())
                .body(ApiResponse.fail(code, "缺少必填参数: " + ex.getParameterName()));
    }

    /**
     * 请求体缺失或 JSON 无法解析。
     *
     * <p>POST 请求体为空、字段类型对不上、JSON 语法错误都走这里。以前会落进
     * 500 兜底，导致「请求格式不对」被误报成「服务器挂了」。
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> handleBodyUnreadable(
            HttpMessageNotReadableException ex, HttpServletRequest request) {
        ErrorCode code = ErrorCode.BAD_REQUEST;
        log.warn("请求体无法解析 [{} {}]: {}", request.getMethod(), request.getRequestURI(),
                ex.getMostSpecificCause().getMessage());
        return ResponseEntity.status(code.getHttpStatus())
                .body(ApiResponse.fail(code, "请求体缺失或格式不合法"));
    }

    /** 方法用错（对只支持 GET 的地址发了 POST），405。 */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<Void>> handleMethodNotSupported(
            HttpRequestMethodNotSupportedException ex, HttpServletRequest request) {
        ErrorCode code = ErrorCode.METHOD_NOT_ALLOWED;
        log.warn("方法不支持 [{} {}]: {}", request.getMethod(), request.getRequestURI(), ex.getMessage());
        return ResponseEntity.status(code.getHttpStatus())
                .body(ApiResponse.fail(code, "该地址不支持 " + request.getMethod() + " 方法"));
    }

    /** Content-Type 不对（把 JSON 接口当表单提交），415。 */
    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ApiResponse<Void>> handleMediaTypeNotSupported(
            HttpMediaTypeNotSupportedException ex, HttpServletRequest request) {
        ErrorCode code = ErrorCode.UNSUPPORTED_MEDIA_TYPE;
        log.warn("内容类型不支持 [{} {}]: {}", request.getMethod(), request.getRequestURI(), ex.getMessage());
        return ResponseEntity.status(code.getHttpStatus())
                .body(ApiResponse.fail(code, "不支持的内容类型: " + ex.getContentType()));
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

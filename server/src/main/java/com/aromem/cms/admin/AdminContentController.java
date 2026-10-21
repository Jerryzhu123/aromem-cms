package com.aromem.cms.admin;

import com.aromem.cms.common.ApiResponse;
import com.aromem.cms.common.ErrorCode;
import com.aromem.cms.common.BizException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * 管理端通用内容 CRUD 接口（前缀 /api/v1/admin，需 Bearer JWT）。
 *
 * <p>域（{domain}）白名单见 {@link AdminContentService#DOMAINS}：
 * articles / products / product-categories / projects / pages / downloads /
 * home-slides / home-about-cards / home-video / home-sections / media。
 *
 * <p>前端传 camelCase（如 coverUrl），服务端统一转 snake 列名并按白名单过滤。
 * 富文本字段 content_html 原样存取（契约：净化不做，安全靠「管理员才能写」）。
 */
@RestController
@RequestMapping("/api/v1/admin")
public class AdminContentController {

    private final AdminContentService service;
    private final JdbcTemplate jdbc;
    private final FrontCacheNotifier notifier;

    public AdminContentController(AdminContentService service, JdbcTemplate jdbc,
                                  FrontCacheNotifier notifier) {
        this.service = service;
        this.jdbc = jdbc;
        this.notifier = notifier;
    }

    @GetMapping("/{domain}")
    public ApiResponse<Map<String, Object>> list(
            @PathVariable String domain,
            @RequestParam(required = false) String locale,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String series) {
        return ApiResponse.ok(service.list(domain, locale, page, size, keyword, status, series));
    }

    @GetMapping("/{domain}/{id}")
    public ApiResponse<Map<String, Object>> detail(@PathVariable String domain, @PathVariable long id) {
        return ApiResponse.ok(service.detail(domain, id));
    }

    @PostMapping("/{domain}")
    public ApiResponse<Map<String, Object>> create(
            @PathVariable String domain, @RequestBody Map<String, Object> body) {
        long id = service.create(domain, body);
        notifier.notifyChanged(domain);
        return ApiResponse.ok(Map.of("id", id));
    }

    @PutMapping("/{domain}/{id}")
    public ApiResponse<Void> update(
            @PathVariable String domain, @PathVariable long id, @RequestBody Map<String, Object> body) {
        service.update(domain, id, body);
        notifier.notifyChanged(domain);
        return ApiResponse.ok();
    }

    @DeleteMapping("/{domain}/{id}")
    public ApiResponse<Void> delete(@PathVariable String domain, @PathVariable long id) {
        service.delete(domain, id);
        notifier.notifyChanged(domain);
        return ApiResponse.ok();
    }

    /** 批量上下线：body { ids: [..], status: "PUBLISHED"|"OFFLINE" }。 */
    @PutMapping("/{domain}/batch-status")
    public ApiResponse<Void> batchStatus(
            @PathVariable String domain, @RequestBody Map<String, Object> body) {
        String table = service.tableOf(domain);
        Object idsRaw = body.get("ids");
        String status = String.valueOf(body.get("status"));
        if (!status.equals("PUBLISHED") && !status.equals("OFFLINE") && !status.equals("DRAFT")) {
            throw new BizException(ErrorCode.BAD_REQUEST, "status 仅支持 PUBLISHED / OFFLINE / DRAFT");
        }
        if (!(idsRaw instanceof List<?> ids) || ids.isEmpty()) {
            throw new BizException(ErrorCode.BAD_REQUEST, "ids 不能为空");
        }
        for (Object raw : ids) {
            long id = ((Number) raw).longValue();
            jdbc.update("UPDATE " + table + " SET status = ? WHERE id = ?", status, id);
        }
        notifier.notifyChanged(domain);
        return ApiResponse.ok();
    }
}

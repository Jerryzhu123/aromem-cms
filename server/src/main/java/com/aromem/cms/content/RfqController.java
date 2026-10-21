package com.aromem.cms.content;

import com.aromem.cms.common.ApiResponse;
import com.aromem.cms.common.BizException;
import com.aromem.cms.common.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 询价 / 样品申请（公开写接口，前缀 /api/v1）。
 *
 * <p>前台 QuoteForm 提交 {@code POST /api/v1/rfq}，成功返回统一体
 * {@code {code:200, msg:...}}；失败走统一异常分支（400 校验不过 / 429 提交过频 /
 * 500 落库失败）。落库后可在 ADP「询价管理」页查看与推进处理状态。
 *
 * <p>这是本站唯一不需要登录的写接口，所以比别的接口多两道闸：
 * 落库前过 {@link RfqRateLimiter} 频控，落库后调 {@link RfqNotifier} 推群消息。
 * 前者防止表被脚本刷满，后者防止真询盘没人看见——两头都得堵上，
 * 只做一边等于没做。
 */
@RestController
@RequestMapping("/api/v1")
public class RfqController {

    private final JdbcTemplate jdbc;
    private final RfqRateLimiter rateLimiter;
    private final RfqNotifier notifier;

    public RfqController(JdbcTemplate jdbc, RfqRateLimiter rateLimiter, RfqNotifier notifier) {
        this.jdbc = jdbc;
        this.rateLimiter = rateLimiter;
        this.notifier = notifier;
    }

    /**
     * 落库列定义：{请求字段名(camelCase), 数据库列(snake_case), 最大长度}。
     * 顺序即 INSERT 列顺序，args 按同一顺序组装，不会错位。
     */
    private static final List<Object[]> FIELDS = List.of(
            new Object[]{"company", "company", 255},
            new Object[]{"phone", "phone", 64},
            new Object[]{"accountType", "account_type", 32},
            new Object[]{"monthlyVolume", "monthly_volume", 64},
            new Object[]{"industry", "industry", 128},
            new Object[]{"country", "country", 128},
            new Object[]{"partNumber", "part_number", 128},
            new Object[]{"quantity", "quantity", 64},
            new Object[]{"targetMicron", "target_micron", 64},
            new Object[]{"requiredLeadTime", "required_lead_time", 64},
            new Object[]{"message", "message", 20000},
            new Object[]{"application", "application", 255},
            new Object[]{"sourcePath", "source_path", 255},
            new Object[]{"sourceSeries", "source_series", 64},
            new Object[]{"sourceModel", "source_model", 128});

    @PostMapping("/rfq")
    @Transactional
    public ApiResponse<Void> submit(@RequestBody Map<String, Object> body,
                                    HttpServletRequest request) {
        if (body == null || body.isEmpty()) {
            throw new BizException(ErrorCode.BAD_REQUEST, "提交内容为空");
        }
        String fullName = str(body, "fullName");
        String workEmail = str(body, "workEmail");
        if (fullName.isBlank()) {
            throw new BizException(ErrorCode.BAD_REQUEST, "缺少必填字段: 姓名");
        }
        if (workEmail.isBlank() || !workEmail.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            throw new BizException(ErrorCode.BAD_REQUEST, "邮箱缺失或格式不正确");
        }
        // requestType 只允许 quote / sample，其余一律按 quote 落库
        String type = "sample".equals(str(body, "requestType")) ? "sample" : "quote";

        // 频控放在校验之后、落库之前：格式都不对的水贴不占配额，
        // 但也拦得住「格式正确、疯狂连发」的脚本。
        rateLimiter.check(clientIp(request));

        List<Object> args = new ArrayList<>();
        args.add(type);
        args.add(cut(fullName, 128));
        // 邮箱列是 varchar(255)，不截断的话超长邮箱会撞 SQL 异常变成 500
        args.add(cut(workEmail, 255));
        for (Object[] def : FIELDS) {
            String raw = str(body, (String) def[0]);
            args.add(raw.isBlank() ? null : cut(raw, (int) def[2]));
        }
        jdbc.update("""
                        INSERT INTO rfq_submission (request_type, full_name, work_email,
                          company, phone, account_type, monthly_volume, industry, country,
                          part_number, quantity, target_micron, required_lead_time, message,
                          application, source_path, source_series, source_model)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """,
                args.toArray());

        // 推送只影响「人多快知道」，失败不影响客户看到的结果，所以放在最后。
        notifier.notifyNewInquiry(notifyFields(type, fullName, workEmail, body));

        // 询价不属于内容域，不推进 site_revision
        return ApiResponse.ok();
    }

    /** 推送用的「标签 → 值」，顺序即手机上的阅读顺序，空值由通知器跳过。 */
    private static Map<String, String> notifyFields(String type, String fullName,
                                                    String workEmail,
                                                    Map<String, Object> body) {
        Map<String, String> f = new LinkedHashMap<>();
        f.put("姓名", fullName);
        f.put("公司", str(body, "company"));
        f.put("邮箱", workEmail);
        f.put("电话", str(body, "phone"));
        f.put("国家/地区", str(body, "country"));
        f.put("类型", "sample".equals(type) ? "样品申请" : "询价");
        f.put("型号", str(body, "partNumber"));
        f.put("数量", str(body, "quantity"));
        f.put("来源页", str(body, "sourcePath"));
        f.put("留言", str(body, "message"));
        return f;
    }

    /**
     * 取客户端真实 IP。
     *
     * <p>nginx 在 {@code proxy_set_header X-Real-IP $remote_addr} 里写的是直连地址，
     * 由 nginx 覆盖，客户端伪造不了，所以优先用它；没有 nginx 时（本地直连 8080）
     * 退回 socket 地址。X-Forwarded-For 不用——它是客户端可以随意填的链，
     * 拿它做频控等于把配额交给攻击者。
     */
    private static String clientIp(HttpServletRequest request) {
        String real = request.getHeader("X-Real-IP");
        if (real != null && !real.isBlank()) {
            return real.trim();
        }
        String addr = request.getRemoteAddr();
        return addr == null ? "" : addr;
    }

    private static String cut(String raw, int max) {
        return raw.length() > max ? raw.substring(0, max) : raw;
    }

    private static String str(Map<String, Object> body, String key) {
        Object v = body.get(key);
        return v == null ? "" : String.valueOf(v).trim();
    }
}

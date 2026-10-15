package com.aromem.cms.content;

import com.aromem.cms.common.ApiResponse;
import com.aromem.cms.common.BizException;
import com.aromem.cms.common.ErrorCode;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 询价 / 样品申请（公开写接口，前缀 /api/v1）。
 *
 * <p>前台 QuoteForm 提交 {@code POST /api/v1/rfq}，成功返回统一体
 * {@code {code:200, msg:...}}；失败走统一异常分支（400 校验不过 / 500 落库失败）。
 * 落库后可在 ADP「询价管理」页查看与推进处理状态。
 */
@RestController
@RequestMapping("/api/v1")
public class RfqController {

    private final JdbcTemplate jdbc;

    public RfqController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
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
    public ApiResponse<Void> submit(@RequestBody Map<String, Object> body) {
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

        List<Object> args = new ArrayList<>();
        args.add(type);
        args.add(cut(fullName, 128));
        args.add(workEmail);
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
        // 询价不属于内容域，不推进 site_revision
        return ApiResponse.ok();
    }

    private static String cut(String raw, int max) {
        return raw.length() > max ? raw.substring(0, max) : raw;
    }

    private static String str(Map<String, Object> body, String key) {
        Object v = body.get(key);
        return v == null ? "" : String.valueOf(v).trim();
    }
}

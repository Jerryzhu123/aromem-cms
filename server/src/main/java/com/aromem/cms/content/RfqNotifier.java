package com.aromem.cms.content;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * 收到新询盘后，往群里推一条消息。
 *
 * <p>为什么要有它：询盘落库之后，此前没有任何人会知道——没有邮件、没有短信、
 * 没有站内提醒，只能靠人自己记着去后台翻。上线至今 {@code rfq_submission}
 * 一条记录都没有，既可能是没人提交，也可能是有人提交了但没人看。这两种情况
 * 在运营上一样糟：线索等于不存在。所以落库后必须主动推到手机上。
 *
 * <p>为什么用 webhook 而不是 SMTP：企业微信、钉钉的群机器人只需要一个地址，
 * 一分钟就能建好；用 SMTP 则要域名邮箱、授权码，而且云主机通常封了 25 端口，
 * 还要处理 465/587 的 STARTTLS 差异。真正要解决的问题是「让人知道」，
 * 不是「发一封邮件」，所以选门槛最低的那条路。
 *
 * <p>只支持 {@code {"msgtype":"text","text":{"content":"..."}}} 这种格式——
 * 企业微信机器人和钉钉机器人是同一个形状，飞书不一样（{@code msg_type} 加
 * {@code content.text}），以后要接飞书再加一个适配分支即可。
 *
 * <p>为什么异步 + 吞异常：推送失败绝不能让询盘回滚。数据已经进库了，
 * 推送只是「早点知道」的加速器；失败打 WARN 说明这一条要靠人工翻后台，
 * 不静默假装成功，也不影响客户看到的「提交成功」。
 */
@Component
public class RfqNotifier {

    private static final Logger log = LoggerFactory.getLogger(RfqNotifier.class);

    private static final DateTimeFormatter TIME =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    /** 留言在推送里最多保留这么多字，超了截断——群消息有长度上限，刷屏也没人看 */
    private static final int MESSAGE_PREVIEW_MAX = 300;

    /** 整条消息的兜底上限，防止极端情况被服务端拒收 */
    private static final int CONTENT_MAX = 1500;

    private final HttpClient http = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_1_1)
            .connectTimeout(Duration.ofSeconds(3))
            .build();

    private final ObjectMapper json = new ObjectMapper();

    private final String webhook;
    private final String adminUrl;

    public RfqNotifier(
            @Value("${app.rfq.notify-webhook:}") String webhook,
            @Value("${app.rfq.admin-url:https://admin.surmem.com/cms/rfq/}") String adminUrl) {
        this.webhook = webhook;
        this.adminUrl = adminUrl;
    }

    /**
     * 推送一条新询盘。未配置 webhook 时只记一行 INFO 就返回。
     *
     * @param fields 按显示顺序排好的「标签 → 值」，值为空的项会被跳过
     */
    public void notifyNewInquiry(Map<String, String> fields) {
        if (webhook == null || webhook.isBlank()) {
            log.info("未配置 app.rfq.notify-webhook，本次询盘仅入库、不推送；"
                    + "需要手机收提醒请配置企业微信/钉钉机器人地址");
            return;
        }
        String content = buildContent(fields);
        CompletableFuture.runAsync(() -> post(content));
    }

    private String buildContent(Map<String, String> fields) {
        Map<String, String> show = new LinkedHashMap<>(fields);
        String message = show.remove("留言");
        if (message != null && !message.isBlank() && message.length() > MESSAGE_PREVIEW_MAX) {
            message = message.substring(0, MESSAGE_PREVIEW_MAX) + "…（完整内容见后台）";
        }

        String name = show.getOrDefault("姓名", "");
        String company = show.getOrDefault("公司", "");

        StringBuilder sb = new StringBuilder();
        sb.append("【SURMEM 新询盘】");
        if (!name.isBlank()) {
            sb.append(name);
        }
        if (!company.isBlank()) {
            sb.append(" · ").append(company);
        }
        sb.append('\n');

        for (Map.Entry<String, String> e : show.entrySet()) {
            if ("姓名".equals(e.getKey()) || "公司".equals(e.getKey())) {
                continue; // 已经写在标题行
            }
            if (e.getValue() == null || e.getValue().isBlank()) {
                continue;
            }
            sb.append(e.getKey()).append("：").append(e.getValue()).append('\n');
        }

        if (message != null && !message.isBlank()) {
            sb.append("留言：\n").append(message).append('\n');
        }

        sb.append("提交时间：").append(LocalDateTime.now().format(TIME)).append('\n');
        sb.append("后台处理：").append(adminUrl);

        String text = sb.toString();
        return text.length() > CONTENT_MAX ? text.substring(0, CONTENT_MAX) : text;
    }

    private void post(String content) {
        try {
            String body = json.writeValueAsString(Map.of(
                    "msgtype", "text",
                    "text", Map.of("content", content)));
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(webhook))
                    .header("Content-Type", "application/json; charset=utf-8")
                    .timeout(Duration.ofSeconds(8))
                    .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8))
                    .build();
            HttpResponse<String> response =
                    http.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (response.statusCode() == 200) {
                log.info("新询盘已推送到群机器人");
            } else {
                log.warn("新询盘推送返回 HTTP {}：{}（询盘已入库，不影响客户提交）",
                        response.statusCode(), brief(response.body()));
            }
        } catch (Exception e) {
            log.warn("新询盘推送失败（询盘已入库，不影响客户提交）：{}", e.getMessage());
        }
    }

    private static String brief(String raw) {
        if (raw == null) {
            return "";
        }
        String s = raw.strip();
        return s.length() > 200 ? s.substring(0, 200) + "…" : s;
    }
}

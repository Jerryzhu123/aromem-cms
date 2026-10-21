package com.aromem.cms.admin;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Set;
import java.util.concurrent.CompletableFuture;

/**
 * 后台改完内容后，通知前台吊销页面缓存。
 *
 * <p>为什么需要它：前台 2026-10-21 起是「预渲染 + 按需再生成」。页面首次渲染后
 * 结果留在 Next.js 的缓存里，后台改了数据库它并不知道。所以后台每次写操作成功后
 * 主动打一下前台的 /api/revalidate，前台收到才调 revalidateTag 把相关页面标记失效，
 * 下次访问重新渲染。没有这一步，改完数据要等兜底过期（最长一小时）才看得见，
 * 运营会以为「保存没生效」。
 *
 * <p>为什么只通知三个域：滤芯型号（fc-products）、系列（fc-series）、型号对照
 * （fc-cross-reference）的页面取数带 pool / catalog 两个缓存标签，能被精确吊销。
 * 首页、新闻、工程那些板块走各自的接口与路由，缓存策略不同，不在本类的职责内。
 *
 * <p>为什么是异步 + 吞异常：通知失败不能让保存回滚。数据已经落库了，
 * 通知只是「让页面早点看到」的加速器；失败时打 WARN 说明还要等兜底过期，
 * 不静默假装成功，也不影响本次保存的返回。
 */
@Component
public class FrontCacheNotifier {

    private static final Logger log = LoggerFactory.getLogger(FrontCacheNotifier.class);

    /** 受影响的写域：只有这三个域的改动才会改变带缓存标签的页面 */
    private static final Set<String> AFFECTED_DOMAINS =
            Set.of("fc-products", "fc-series", "fc-cross-reference");

    /** 前台这两个标签覆盖全部滤芯型号页（泳池 + 工业滤芯） */
    private static final String CACHE_TAGS = "pool,catalog";

    private final HttpClient http = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_1_1)
            .connectTimeout(Duration.ofSeconds(3))
            .build();

    private final String url;
    private final String secret;

    public FrontCacheNotifier(
            @Value("${app.frontend.revalidate-url:http://127.0.0.1:3000/api/revalidate}") String url,
            @Value("${app.frontend.revalidate-secret:}") String secret) {
        this.url = url;
        this.secret = secret;
    }

    /**
     * 异步通知前台。不属于受影响域、或没配密钥时直接返回。
     *
     * <p>没配密钥是「静默跳过 + WARN」而不是「假装成功」：这样运维一眼能看出
     * 「页面没刷新」是因为漏配了 REVALIDATE_SECRET，而不是去查缓存逻辑。
     */
    public void notifyChanged(String domain) {
        if (!AFFECTED_DOMAINS.contains(domain)) {
            return;
        }
        if (secret == null || secret.isBlank()) {
            log.warn("未配置 app.frontend.revalidate-secret，跳过前台缓存通知："
                    + "数据已保存，但页面要等兜底过期（最长一小时）才会刷新");
            return;
        }
        CompletableFuture.runAsync(this::call);
    }

    private void call() {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url + "?tag=" + CACHE_TAGS))
                    .header("x-revalidate-secret", secret)
                    .timeout(Duration.ofSeconds(5))
                    .POST(HttpRequest.BodyPublishers.noBody())
                    .build();
            HttpResponse<Void> response = http.send(request, HttpResponse.BodyHandlers.discarding());
            if (response.statusCode() == 200) {
                log.info("已通知前台吊销缓存标签 {}，下次访问将重新渲染", CACHE_TAGS);
            } else {
                log.warn("前台缓存通知返回 HTTP {}：数据已保存，页面将在兜底过期后自动刷新",
                        response.statusCode());
            }
        } catch (Exception e) {
            log.warn("前台缓存通知失败（不影响本次保存）：{}", e.getMessage());
        }
    }
}

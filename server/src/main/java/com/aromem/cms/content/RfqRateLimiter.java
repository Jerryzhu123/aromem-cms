package com.aromem.cms.content;

import com.aromem.cms.common.BizException;
import com.aromem.cms.common.ErrorCode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 询盘接口的频控（单机内存版）。
 *
 * <p>为什么需要：{@code POST /api/v1/rfq} 是唯一一个不需要登录的写接口。
 * 没有频控的话，一条循环脚本就能把询价表刷满，运营看到的第 300 条垃圾询盘
 * 会把真实线索一起淹掉。这里做两层闸：
 * <ul>
 *   <li><b>单 IP</b>：10 分钟内最多 5 次。真人填一次询盘要一两分钟，
 *       正常客户根本碰不到这条线；</li>
 *   <li><b>全站</b>：1 小时内最多 200 次。挡住「换 IP 刷」这种最朴素的做法，
 *       同时留足正常业务量——按一天 200 条询盘算，这个上限是三年后才需要考虑的事。</li>
 * </ul>
 *
 * <p>为什么是内存不是 Redis：全站就这一台机器、一个后端进程，
 * 引入 Redis 只为记几个时间戳不划算。代价是进程重启后计数归零——
 * 攻击者要卡着重启来绕过，成本远高于收益。
 *
 * <p>为什么不记录被拒的请求：被拒的请求如果也计数，攻击者可以把正常用户
 * 的配额挤掉（用一个 IP 反复触发，让同一个 NAT 出口后面的人全部被拦）。
 * 命中后直接拒绝、不累加，窗口自然滑动。
 */
@Component
public class RfqRateLimiter {

    private static final Logger log = LoggerFactory.getLogger(RfqRateLimiter.class);

    /** 单 IP 窗口内允许的提交次数 */
    private static final int IP_LIMIT = 5;
    /** 单 IP 窗口长度：10 分钟（毫秒） */
    private static final long IP_WINDOW_MS = 10 * 60 * 1000L;

    /** 全站窗口内允许的提交次数 */
    private static final int GLOBAL_LIMIT = 200;
    /** 全站窗口长度：1 小时（毫秒） */
    private static final long GLOBAL_WINDOW_MS = 60 * 60 * 1000L;

    /** IP 表超过这个规模就顺手清一遍，防止被大量伪造 IP 撑爆内存 */
    private static final int IP_TABLE_SOFT_CAP = 5000;

    private final Map<String, Deque<Long>> ipHits = new ConcurrentHashMap<>();
    private final Deque<Long> globalHits = new ArrayDeque<>();

    /**
     * 提交前调用。超限抛 {@link ErrorCode#TOO_MANY_REQUESTS}（HTTP 429），
     * 由 {@code GlobalExceptionHandler} 统一转成响应体。
     *
     * @param ip 客户端 IP。取不到任何可用地址时传空串，此时只走全站闸。
     */
    public void check(String ip) {
        long now = System.currentTimeMillis();

        synchronized (globalHits) {
            prune(globalHits, now, GLOBAL_WINDOW_MS);
            if (globalHits.size() >= GLOBAL_LIMIT) {
                log.warn("询盘接口全站频控命中：最近一小时已提交 {} 次，本次拒绝", globalHits.size());
                throw new BizException(ErrorCode.TOO_MANY_REQUESTS,
                        "当前咨询量较大，请稍后再试，或直接发送邮件给我们");
            }
            globalHits.addLast(now);
        }

        if (ip == null || ip.isBlank()) {
            return;
        }

        Deque<Long> hits = ipHits.computeIfAbsent(ip, k -> new ArrayDeque<>());
        synchronized (hits) {
            prune(hits, now, IP_WINDOW_MS);
            if (hits.size() >= IP_LIMIT) {
                log.warn("询盘接口单 IP 频控命中：{} 在 10 分钟内已提交 {} 次，本次拒绝",
                        ip, hits.size());
                throw new BizException(ErrorCode.TOO_MANY_REQUESTS,
                        "提交过于频繁，请稍后再试");
            }
            hits.addLast(now);
        }

        if (ipHits.size() > IP_TABLE_SOFT_CAP) {
            cleanup(now);
        }
    }

    /** 丢掉窗口外的记录。调用方必须已经持有该队列的锁。 */
    private static void prune(Deque<Long> hits, long now, long windowMs) {
        long edge = now - windowMs;
        while (!hits.isEmpty() && hits.peekFirst() < edge) {
            hits.removeFirst();
        }
    }

    /**
     * 清理整张 IP 表里已经空掉的条目。
     *
     * <p>只在表超过软上限时触发，正常流量下永远不会走到这里——
     * 每来一个请求就遍历整张表是比频控本身更大的浪费。
     */
    private void cleanup(long now) {
        long edge = now - IP_WINDOW_MS;
        int removed = 0;
        for (Iterator<Map.Entry<String, Deque<Long>>> it = ipHits.entrySet().iterator();
                it.hasNext(); ) {
            Map.Entry<String, Deque<Long>> entry = it.next();
            Deque<Long> hits = entry.getValue();
            synchronized (hits) {
                while (!hits.isEmpty() && hits.peekFirst() < edge) {
                    hits.removeFirst();
                }
                if (hits.isEmpty()) {
                    it.remove();
                    removed++;
                }
            }
        }
        if (removed > 0) {
            log.info("询盘频控表清理：移除 {} 个空条目，现存 {} 个 IP", removed, ipHits.size());
        }
    }
}

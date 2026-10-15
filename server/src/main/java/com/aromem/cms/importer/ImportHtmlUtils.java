package com.aromem.cms.importer;

import java.util.Map;
import java.util.regex.Pattern;

/**
 * 导入期的小工具：HTML 实体解码、去标签抽纯文本、面包屑/正文取标题。
 *
 * <p>只覆盖源站数据里实际出现的实体，不做完整 HTML 解析（导入是一次性动作，
 * 引入 jsoup 之类的完整解析器不值得）。
 */
final class ImportHtmlUtils {

    private ImportHtmlUtils() {
    }

    private static final Map<String, String> ENTITIES = Map.ofEntries(
            Map.entry("&amp;", "&"),
            Map.entry("&lt;", "<"),
            Map.entry("&gt;", ">"),
            Map.entry("&quot;", "\""),
            Map.entry("&#39;", "'"),
            Map.entry("&apos;", "'"),
            Map.entry("&nbsp;", " "),
            Map.entry("&reg;", "®"),
            Map.entry("&copy;", "©"),
            Map.entry("&ldquo;", "“"),
            Map.entry("&rdquo;", "”"),
            Map.entry("&lsquo;", "‘"),
            Map.entry("&rsquo;", "’"),
            Map.entry("&mdash;", "—"),
            Map.entry("&ndash;", "–"),
            Map.entry("&hellip;", "…"),
            Map.entry("&middot;", "·"));

    private static final Pattern TAG = Pattern.compile("<[^>]*>");
    private static final Pattern MULTI_SPACE = Pattern.compile("[ \\t\\r\\n\\u00a0]+");
    private static final Pattern FIRST_IMG = Pattern.compile("<img[^>]+src=\"([^\"]+)\"", Pattern.CASE_INSENSITIVE);
    private static final Pattern FIRST_H3 = Pattern.compile("<h3[^>]*>([\\s\\S]{0,500}?)</h3>", Pattern.CASE_INSENSITIVE);

    /** 解码常见 HTML 实体。 */
    static String decodeEntities(String text) {
        if (text == null) {
            return null;
        }
        String result = text;
        for (Map.Entry<String, String> e : ENTITIES.entrySet()) {
            result = result.replace(e.getKey(), e.getValue());
        }
        return result;
    }

    /** 去标签抽纯文本，连续空白压成一个空格，供检索列与摘要使用。 */
    static String stripHtml(String html) {
        if (html == null) {
            return null;
        }
        String text = decodeEntities(TAG.matcher(html).replaceAll(" "));
        String collapsed = MULTI_SPACE.matcher(text).replaceAll(" ").trim();
        return collapsed.isEmpty() ? "" : collapsed;
    }

    /** 截取摘要：纯文本前 {@code maxLength} 字。 */
    static String excerpt(String html, int maxLength) {
        String text = stripHtml(html);
        if (text == null || text.isEmpty()) {
            return null;
        }
        return text.length() <= maxLength ? text : text.substring(0, maxLength);
    }

    /** 从正文抽第一张图片的 src，用作封面兜底。 */
    static String firstImage(String html) {
        if (html == null) {
            return null;
        }
        var matcher = FIRST_IMG.matcher(html);
        return matcher.find() ? matcher.group(1) : null;
    }

    /** 从正文抽第一个 &lt;h3&gt; 的文本，用作新闻标题。 */
    static String firstH3Text(String html) {
        if (html == null) {
            return null;
        }
        var matcher = FIRST_H3.matcher(html);
        if (!matcher.find()) {
            return null;
        }
        String inner = decodeEntities(matcher.group(1));
        return stripHtml(inner);
    }

    /**
     * 面包屑取标题：最后一段按 {@code -} 拆分取末节。
     * 例：{@code ["首页","产品中心-SURO®反渗透与纳滤膜元件-极低压膜元件"]}
     * → 标题 {@code 极低压膜元件}。
     */
    static String titleFromCrumbs(java.util.List<String> crumbs) {
        if (crumbs == null || crumbs.isEmpty()) {
            return null;
        }
        String last = crumbs.get(crumbs.size() - 1);
        String decoded = decodeEntities(last);
        if (decoded == null) {
            return null;
        }
        String trimmed = decoded.trim();
        int dash = Math.max(trimmed.lastIndexOf('-'), trimmed.lastIndexOf('－'));
        return dash >= 0 ? trimmed.substring(dash + 1).trim() : trimmed;
    }

    /**
     * 产品分类：面包屑最后一项按 {@code -} 拆分，满三段时取倒数第二段。
     * 例：{@code 产品中心-SURO®反渗透与纳滤膜元件-极低压膜元件} → {@code SURO®反渗透与纳滤膜元件}；
     * 两段式（如 {@code 产品中心-SURO®膜性能优势}）视为无分类，返回 null。
     */
    static String categoryFromCrumbs(java.util.List<String> crumbs) {
        if (crumbs == null || crumbs.isEmpty()) {
            return null;
        }
        String last = decodeEntities(crumbs.get(crumbs.size() - 1));
        if (last == null) {
            return null;
        }
        String[] parts = last.trim().split("[-－]");
        return parts.length >= 3 ? parts[parts.length - 2].trim() : null;
    }
}

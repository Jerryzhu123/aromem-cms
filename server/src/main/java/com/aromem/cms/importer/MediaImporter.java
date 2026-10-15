package com.aromem.cms.importer;

import com.aromem.cms.config.StorageProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;
import org.springframework.util.DigestUtils;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Stream;

/**
 * 存量媒体登记：把前端 {@code cloner/public} 下的既有静态资源
 * （uploads / ueditor / static，约 225 MB）登记进 {@code media_meta}，
 * 并把文件实体复制到后端存储目录 {@code backend-storage/public-media}。
 *
 * <p><b>为什么复制而不是原地引用</b>：媒体硬约束要求文件实体归后端管、
 * 不放在前端项目目录；复制后内容 HTML 里的 {@code /uploads/...} 原路径
 * 由静态路由直接命中后端目录，前端零改动。前端目录的副本在 P3 前端
 * 切换完成前保留（作为静态数据兜底）。
 *
 * <p><b>幂等</b>：按 MD5 查重，已登记的文件跳过；目标文件已存在且大小一致则不重复复制。
 */
@Component
public class MediaImporter {

    private static final Logger log = LoggerFactory.getLogger(MediaImporter.class);

    /** 登记的存量资源子目录（与前端 public 下的目录一一对应）。 */
    private static final List<String> SOURCE_DIRS = List.of("uploads", "ueditor", "static");

    private static final ZoneId ZONE = ZoneId.of("Asia/Shanghai");
    private static final DateTimeFormatter DATE_PART = DateTimeFormatter.ofPattern("yyyyMMdd", Locale.ROOT);
    private static final SecureRandom RANDOM = new SecureRandom();

    /** 扩展名 → MIME（覆盖源站实际出现的类型）。 */
    private static final Map<String, String> MIME_BY_EXT = Map.ofEntries(
            Map.entry("jpg", "image/jpeg"), Map.entry("jpeg", "image/jpeg"),
            Map.entry("png", "image/png"), Map.entry("gif", "image/gif"),
            Map.entry("webp", "image/webp"), Map.entry("bmp", "image/bmp"),
            Map.entry("svg", "image/svg+xml"), Map.entry("ico", "image/x-icon"),
            Map.entry("mp4", "video/mp4"), Map.entry("webm", "video/webm"),
            Map.entry("mov", "video/quicktime"), Map.entry("m4v", "video/x-m4v"),
            Map.entry("avi", "video/x-msvideo"), Map.entry("mkv", "video/x-matroska"),
            Map.entry("pdf", "application/pdf"),
            Map.entry("woff", "font/woff"), Map.entry("woff2", "font/woff2"),
            Map.entry("ttf", "font/ttf"), Map.entry("eot", "application/vnd.ms-fontobject"),
            Map.entry("css", "text/css"), Map.entry("js", "text/javascript"),
            Map.entry("swf", "application/x-shockwave-flash"), Map.entry("flv", "video/x-flv"));

    private final JdbcClient jdbc;
    private final StorageProperties storage;
    private final Path sourceRoot;

    MediaImporter(JdbcClient jdbc, StorageProperties storage,
                  org.springframework.core.env.Environment env) {
        this.jdbc = jdbc;
        this.storage = storage;
        String configured = env.getProperty("app.importer.frontend-public", "../cloner/public");
        this.sourceRoot = resolveExistingFrontPublic(configured);
    }

    /** 工作目录可能是 server/，找不到配置路径时回退到常见位置。 */
    private static Path resolveExistingFrontPublic(String configured) {
        Path candidate = Path.of(configured).toAbsolutePath().normalize();
        if (Files.isDirectory(candidate)) {
            return candidate;
        }
        Path cwd = Path.of("").toAbsolutePath().normalize();
        List<Path> fallbacks = List.of(
                cwd.resolveSibling("cloner").resolve("public"),
                cwd.resolve("cloner").resolve("public"));
        return fallbacks.stream()
                .filter(Files::isDirectory)
                .findFirst()
                .orElse(candidate);
    }

    void importAll() throws IOException {
        if (!Files.isDirectory(sourceRoot)) {
            log.warn("[importer] 前端资源目录不存在，跳过媒体登记：{}", sourceRoot);
            return;
        }
        Path storageRoot = storage.rootPath();

        int total = 0;
        int copied = 0;
        int registered = 0;
        int skipped = 0;

        for (String dir : SOURCE_DIRS) {
            Path srcDir = sourceRoot.resolve(dir);
            if (!Files.isDirectory(srcDir)) {
                continue;
            }
            try (Stream<Path> files = Files.walk(srcDir)) {
                List<Path> regular = files.filter(Files::isRegularFile).toList();
                for (Path file : regular) {
                    total++;
                    String relative = srcDir.relativize(file).toString().replace('\\', '/');
                    String webUrl = "/" + dir + "/" + relative;

                    String md5Hex;
                    try (InputStream in = Files.newInputStream(file)) {
                        md5Hex = DigestUtils.md5DigestAsHex(in);
                    }
                    if (md5Registered(md5Hex)) {
                        skipped++;
                        continue;
                    }

                    Path target = storageRoot.resolve(dir).resolve(relative);
                    if (!Files.exists(target) || Files.size(target) != Files.size(file)) {
                        Files.createDirectories(target.getParent());
                        Files.copy(file, target, StandardCopyOption.REPLACE_EXISTING);
                        copied++;
                    }

                    insertMeta(file, target, webUrl, md5Hex);
                    registered++;
                }
            }
        }

        log.info("[importer] 媒体登记完成：扫描 {} 个文件，登记 {}，按 md5 跳过 {}，复制 {} 个到 {}",
                total, registered, skipped, copied, storageRoot);
    }

    private boolean md5Registered(String md5Hex) {
        return Boolean.TRUE.equals(jdbc.sql("SELECT EXISTS(SELECT 1 FROM media_meta WHERE md5 = :md5)")
                .param("md5", md5Hex)
                .query(Boolean.class)
                .single());
    }

    private void insertMeta(Path source, Path target, String webUrl, String md5Hex) throws IOException {
        String extension = extensionOf(source.getFileName().toString());
        String physicalPath = storage.getRoot().replace('\\', '/') + "/"
                + storage.rootPath().relativize(target).toString().replace('\\', '/');
        jdbc.sql("""
                INSERT INTO media_meta (file_id, physical_path, relative_url, file_name, file_size, mime_type, md5)
                VALUES (:fileId, :physicalPath, :relativeUrl, :fileName, :fileSize, :mime, :md5)
                """)
                .param("fileId", nextFileId())
                .param("physicalPath", physicalPath)
                .param("relativeUrl", webUrl)
                .param("fileName", source.getFileName().toString())
                .param("fileSize", Files.size(source))
                .param("mime", MIME_BY_EXT.getOrDefault(extension, "application/octet-stream"))
                .param("md5", md5Hex)
                .update();
    }

    /** 形如 {@code m_20261003_8a7b6c5d}，与上传接口的规则一致。 */
    private String nextFileId() {
        for (int attempt = 0; attempt < 10; attempt++) {
            String candidate = "m_" + LocalDate.now(ZONE).format(DATE_PART) + "_"
                    + HexFormat.of().formatHex(randomBytes());
            if (!Boolean.TRUE.equals(jdbc.sql("SELECT EXISTS(SELECT 1 FROM media_meta WHERE file_id = :fid)")
                    .param("fid", candidate)
                    .query(Boolean.class)
                    .single())) {
                return candidate;
            }
        }
        throw new IllegalStateException("生成 fileId 失败：连续冲突");
    }

    private byte[] randomBytes() {
        byte[] bytes = new byte[4];
        RANDOM.nextBytes(bytes);
        return bytes;
    }

    private String extensionOf(String name) {
        int dot = name.lastIndexOf('.');
        return dot >= 0 ? name.substring(dot + 1).toLowerCase(Locale.ROOT) : "";
    }
}

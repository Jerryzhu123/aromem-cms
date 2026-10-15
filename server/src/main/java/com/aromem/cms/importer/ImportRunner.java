package com.aromem.cms.importer;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.stereotype.Component;

/**
 * 一次性导入入口（P1）。
 *
 * <p>默认关闭。执行方式（导入完成后应用自动退出，不影响常规启动）：
 *
 * <pre>
 * mvn -q package -DskipTests
 * java -jar target/aromem-cms-server-0.1.0.jar --app.importer.enabled=true
 * </pre>
 *
 * <p>导入是幂等的（外壳表先清后插、主体表按唯一键 upsert、媒体按 md5 查重），
 * 重复执行安全。
 */
@Component
@ConditionalOnProperty(name = "app.importer.enabled", havingValue = "true")
public class ImportRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(ImportRunner.class);

    private final ContentImporter contentImporter;
    private final MediaImporter mediaImporter;
    private final ConfigurableApplicationContext context;

    ImportRunner(ContentImporter contentImporter, MediaImporter mediaImporter,
                 ConfigurableApplicationContext context) {
        this.contentImporter = contentImporter;
        this.mediaImporter = mediaImporter;
        this.context = context;
    }

    @Override
    public void run(String... args) throws Exception {
        long start = System.currentTimeMillis();
        log.info("[importer] ===== 开始导入（幂等，可重复执行）=====");
        contentImporter.importAll();
        mediaImporter.importAll();
        log.info("[importer] ===== 导入结束，耗时 {} ms，应用即将退出 =====", System.currentTimeMillis() - start);
        System.exit(org.springframework.boot.SpringApplication.exit(context));
    }
}

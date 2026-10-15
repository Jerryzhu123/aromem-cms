package com.aromem.cms.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

/**
 * 静态资源路由：{@code /media/**} → 后端本地目录 {@code backend-storage/public-media}。
 *
 * <p>数据库只存元数据，文件实体由这里直接对外提供，不经过 Controller，
 * 因此也没有额外的 IO 开销。切换存储（例如迁到 OSS）时，只需要改这一处
 * 与 {@code MediaService} 的落盘逻辑，业务表只依赖 {@code fileId}，不受影响。
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private final StorageProperties storageProperties;

    public WebMvcConfig(StorageProperties storageProperties) {
        this.storageProperties = storageProperties;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String pattern = storageProperties.getUrlPrefix() + "/**";
        String location = storageProperties.rootPath().toUri().toString();

        registry.addResourceHandler(pattern)
                .addResourceLocations(location)
                .setCachePeriod(60 * 60 * 24 * 30); // 30 天：文件名含唯一 fileId，可放心长缓存

        // 存量资源前缀（P1 导入）：源站 HTML 里写死的是 /uploads/**、/ueditor/**、/static/**，
        // 这些文件已复制到 backend-storage/public-media 的同名子目录，这里按原前缀对外提供，
        // 内容 HTML 无需任何改写即可取到图片。新增上传的文件仍走 /media/**。
        for (String prefix : List.of("uploads", "ueditor", "static")) {
            registry.addResourceHandler("/" + prefix + "/**")
                    .addResourceLocations(storageProperties.rootPath().resolve(prefix).toUri().toString())
                    .setCachePeriod(60 * 60 * 24 * 7); // 存量文件名不含唯一 id，缓存期短一档（7 天）
        }
    }
}

package com.aromem.cms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.cache.annotation.EnableCaching;

import com.aromem.cms.admin.AdminUserService;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.stereotype.Component;

/**
 * 苏州苏瑞膜官网后端。
 *
 * <p>模块化单体：{@code site}（站点外壳）/ {@code content}（内容主体）/
 * {@code media}（媒体文件）/ {@code admin}（管理端）/ {@code importer}（内容导入）。
 *
 * <p>设计文档见仓库根目录 {@code docs/backend/DESIGN.md}。
 */
@SpringBootApplication
@ConfigurationPropertiesScan
@EnableCaching
public class CmsApplication {

    public static void main(String[] args) {
        SpringApplication.run(CmsApplication.class, args);
    }

    /** 管理员种子账号：admin_user 为空时创建 admin / 123456（BCrypt）。 */
    @Component
    static class AdminSeedRunner implements ApplicationRunner {

        private final AdminUserService userService;

        AdminSeedRunner(AdminUserService userService) {
            this.userService = userService;
        }

        @Override
        public void run(ApplicationArguments args) {
            userService.seedIfEmpty();
        }
    }
}

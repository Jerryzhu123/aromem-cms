package com.aromem.cms.config;

import com.aromem.cms.admin.JwtAuthFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * 安全配置（P4 收口后）。
 *
 * <p>公开面：健康检查、静态资源（media/uploads/ueditor/static）、
 * 公开只读接口（GET /api/v1/site/**、/api/v1/home、GET 查询类）、管理端登录。
 * <br>受保护面：{@code /api/v1/admin/**}（除登录）与媒体上传，需 {@code Bearer <JWT>}。
 *
 * <p>{@code app.security.permit-write-endpoints=true}（开发联调模式）时全放行，
 * <b>生产必须为 false</b>。
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final boolean permitWriteEndpoints;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter,
                          @Value("${app.security.permit-write-endpoints:true}") boolean permitWriteEndpoints) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.permitWriteEndpoints = permitWriteEndpoints;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(AbstractHttpConfigurer::disable)
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                // 未认证统一返回 401（JSON 统一响应体），而不是默认 403
                .exceptionHandling(e -> e.authenticationEntryPoint((request, response, ex) -> {
                    response.setStatus(401);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"code\":401,\"msg\":\"未登录或登录已过期\",\"data\":null}");
                }));

        http.authorizeHttpRequests(reg -> {
            reg.requestMatchers("/actuator/health", "/actuator/health/**").permitAll();
            // 静态资源只读放行
            reg.requestMatchers(HttpMethod.GET, "/media/**", "/uploads/**", "/ueditor/**", "/static/**").permitAll();
            // 公开只读 API：GET 一律放行（站点无敏感数据，写操作才需要身份）
            reg.requestMatchers(HttpMethod.GET, "/api/v1/site/**", "/api/v1/home",
                    "/api/v1/home-slides", "/api/v1/home-products", "/api/v1/home-news",
                    "/api/v1/home-projects", "/api/v1/home-about",
                    "/api/v1/articles", "/api/v1/product-categories", "/api/v1/downloads",
                    "/api/v1/sitemap").permitAll();
            reg.requestMatchers(HttpMethod.GET, "/api/v1/articles/*", "/api/v1/products/*",
                    "/api/v1/projects/*", "/api/v1/pages/*").permitAll();
            // 管理端：登录接口放行，其余 admin 面需要认证
            reg.requestMatchers("/api/v1/admin/auth/login").permitAll();
            reg.requestMatchers("/api/v1/admin/**").authenticated();
            // 上传（写操作）需要认证
            reg.requestMatchers("/api/upload/**").authenticated();
            if (permitWriteEndpoints) {
                reg.requestMatchers("/api/**").permitAll();
            }
            reg.anyRequest().permitAll();
        });

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

package com.aromem.cms.admin;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT 认证过滤器：从 {@code Authorization: Bearer <token>} 解析用户名，
 * 有效则写入 SecurityContext（统一授予 ROLE_ADMIN —— 当前只有一个管理端角色维度）。
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final AdminJwtService jwtService;

    public JwtAuthFilter(AdminJwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            jwtService.verify(header.substring(7)).ifPresent(username ->
                    SecurityContextHolder.getContext().setAuthentication(
                            new UsernamePasswordAuthenticationToken(
                                    username, null, AuthorityUtils.createAuthorityList("ROLE_ADMIN"))));
        }
        chain.doFilter(request, response);
    }
}

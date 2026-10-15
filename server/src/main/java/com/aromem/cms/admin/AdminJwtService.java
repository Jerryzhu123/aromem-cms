package com.aromem.cms.admin;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;

/**
 * 管理端 JWT：签发与校验（HS256，无状态）。
 *
 * <p>密钥来自 {@code app.security.jwt-secret}（dev 提供默认值；生产必须用
 * 环境变量覆盖为高强度随机串）。有效期 {@code app.security.jwt-ttl}，默认 24h。
 */
@Service
public class AdminJwtService {

    private final SecretKey key;
    private final Duration ttl;

    public AdminJwtService(
            @Value("${app.security.jwt-secret:aromem-cms-dev-secret-key-please-override-in-prod-32bytes}") String secret,
            @Value("${app.security.jwt-ttl:PT24H}") Duration ttl) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.ttl = ttl;
    }

    public String issue(String username) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(username)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(ttl)))
                .signWith(key)
                .compact();
    }

    /** 校验并取回用户名；过期或签名不符返回 empty。 */
    public Optional<String> verify(String token) {
        try {
            Claims claims = Jwts.parser().verifyWith(key).build()
                    .parseSignedClaims(token).getPayload();
            return Optional.ofNullable(claims.getSubject());
        } catch (JwtException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }

    public long ttlSeconds() {
        return ttl.toSeconds();
    }
}

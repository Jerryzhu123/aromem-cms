package com.aromem.cms.admin;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 管理员账号服务：种子账号创建 + 登录校验。
 *
 * <p>种子策略：应用启动时若 {@code admin_user} 为空，则创建 {@code admin / 123456}
 * （BCrypt 落库，关联 ADMIN 角色）。之后修改密码走管理端接口或直接改库。
 */
@Service
public class AdminUserService {

    private final JdbcClient jdbc;
    private final PasswordEncoder passwordEncoder;

    public AdminUserService(JdbcClient jdbc, PasswordEncoder passwordEncoder) {
        this.jdbc = jdbc;
        this.passwordEncoder = passwordEncoder;
    }

    /** 启动时调用：空表则种入 admin / 123456。 */
    public void seedIfEmpty() {
        Long count = jdbc.sql("SELECT COUNT(*) FROM admin_user").query(Long.class).single();
        if (count != null && count > 0) {
            return;
        }
        String hash = passwordEncoder.encode("123456");
        Long userId = jdbc.sql("""
                        INSERT INTO admin_user (username, password_hash, display_name, email, status)
                        VALUES ('admin', :hash, '管理员', 'admin@aromem.local', 'ACTIVE')
                        """)
                .param("hash", hash).update() > 0
                ? jdbc.sql("SELECT id FROM admin_user WHERE username = 'admin'").query(Long.class).single()
                : null;
        if (userId != null) {
            jdbc.sql("""
                    INSERT INTO admin_user_role (user_id, role_id)
                    SELECT :uid, id FROM admin_role WHERE code = 'ADMIN'
                    """).param("uid", userId).update();
        }
        System.out.println("[admin-seed] 已创建初始管理员 admin / 123456（首次启动自动）");
    }

    public boolean verify(String username, String rawPassword) {
        record Row(String hash, String status) {
        }
        return jdbc.sql("SELECT password_hash AS hash, status FROM admin_user WHERE username = :u")
                .param("u", username).query(Row.class).optional()
                .filter(r -> "ACTIVE".equals(r.status()))
                .map(r -> passwordEncoder.matches(rawPassword, r.hash()))
                .orElse(false);
    }

    public void touchLastLogin(String username) {
        jdbc.sql("UPDATE admin_user SET last_login_at = NOW(3) WHERE username = :u")
                .param("u", username).update();
    }

    public record AdminProfile(String username, String displayName, List<String> roles) {
    }

    public AdminProfile profile(String username) {
        record Row(String displayName) {
        }
        String displayName = jdbc.sql("SELECT display_name FROM admin_user WHERE username = :u")
                .param("u", username).query(Row.class).optional()
                .map(Row::displayName).orElse(username);
        List<String> roles = jdbc.sql("""
                        SELECT r.code FROM admin_role r
                        JOIN admin_user_role ur ON ur.role_id = r.id
                        JOIN admin_user u ON u.id = ur.user_id
                        WHERE u.username = :u
                        """)
                .param("u", username).query(String.class).list();
        return new AdminProfile(username, displayName, roles);
    }
}

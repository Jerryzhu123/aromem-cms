package com.aromem.cms.admin;

import com.aromem.cms.common.ApiResponse;
import com.aromem.cms.common.BizException;
import com.aromem.cms.common.ErrorCode;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 管理端认证：登录签发 JWT，me 回显当前用户。
 * 登录失败统一 401（HTTP 状态码与 code 同义，不细分「用户不存在/密码错」防枚举）。
 */
@RestController
@RequestMapping("/api/v1/admin/auth")
public class AdminAuthController {

    private final AdminUserService userService;
    private final AdminJwtService jwtService;

    public AdminAuthController(AdminUserService userService, AdminJwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    public record LoginRequest(String username, String password) {
    }

    @PostMapping("/login")
    public ApiResponse<Map<String, Object>> login(@RequestBody LoginRequest body) {
        if (body.username() == null || body.password() == null
                || !userService.verify(body.username(), body.password())) {
            throw new BizException(ErrorCode.UNAUTHORIZED, "用户名或密码错误");
        }
        userService.touchLastLogin(body.username());
        return ApiResponse.ok(Map.of(
                "token", jwtService.issue(body.username()),
                "expiresIn", jwtService.ttlSeconds(),
                "user", userService.profile(body.username())));
    }

    @GetMapping("/me")
    public ApiResponse<AdminUserService.AdminProfile> me() {
        String username = currentUser()
                .orElseThrow(() -> new BizException(ErrorCode.UNAUTHORIZED));
        return ApiResponse.ok(userService.profile(username));
    }

    public static java.util.Optional<String> currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth == null || auth.getName() == null
                ? java.util.Optional.empty() : java.util.Optional.of(auth.getName());
    }
}

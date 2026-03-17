package com.internship.portal.controller;

import com.internship.portal.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.register(body));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.verifyOtp(body.get("email"), body.get("otp")));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, Object> body) {
        String email      = (String) body.get("email");
        String password   = (String) body.get("password");
        String device     = (String) body.getOrDefault("device", "Unknown");
        boolean rememberMe= Boolean.TRUE.equals(body.get("rememberMe"));
        return ResponseEntity.ok(authService.login(email, password, device, rememberMe));
    }

    @PostMapping("/verify-2fa")
    public ResponseEntity<?> verify2fa(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.verify2FA(body.get("email"), body.get("code")));
    }

    @PostMapping("/toggle-2fa")
    public ResponseEntity<?> toggle2fa(Authentication auth) {
        String email = (String) auth.getPrincipal();
        return ResponseEntity.ok(authService.toggle2FA(email));
    }

    @GetMapping("/login-history")
    public ResponseEntity<?> loginHistory(Authentication auth) {
        return ResponseEntity.ok(authService.getLoginHistory((String) auth.getPrincipal()));
    }

    @PostMapping("/request-deletion")
    public ResponseEntity<?> requestDeletion(Authentication auth) {
        return ResponseEntity.ok(authService.requestDeletion((String) auth.getPrincipal()));
    }

    @PostMapping("/cancel-deletion")
    public ResponseEntity<?> cancelDeletion(Authentication auth) {
        return ResponseEntity.ok(authService.cancelDeletion((String) auth.getPrincipal()));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.forgotPassword(body.get("email")));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.resetPassword(body.get("email"), body.get("otp"), body.get("newPassword")));
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> body) {
        // Google OAuth - handled by GoogleOAuthService
        return ResponseEntity.ok(Map.of("success", false, "message", "Configure Google Client ID in application.properties"));
    }
}

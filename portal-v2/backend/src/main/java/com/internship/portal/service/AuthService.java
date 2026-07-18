package com.internship.portal.service;

import com.internship.portal.model.User;
import com.internship.portal.repository.UserRepository;
import com.internship.portal.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class AuthService {

    @Autowired private UserRepository userRepository;
    @Autowired private EmailService emailService;
    @Autowired private JwtUtil jwtUtil;

    private String generateOtp() {
        return String.valueOf(100000 + new Random().nextInt(900000));
    }

    // ─── Register ─────────────────────────────────────────────────────────────
    public Map<String, Object> register(Map<String, String> body) {
        Map<String, Object> res = new HashMap<>();
        String email    = body.get("email");
        String name     = body.get("name");
        String password = body.get("password");
        String roleStr  = body.getOrDefault("role", "STUDENT");

        if (userRepository.existsByEmail(email)) {
            res.put("success", false);
            res.put("message", "Email already registered");
            return res;
        }

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(password);
        user.setRole(User.Role.valueOf(roleStr));
        user.setVerified(false);

        String otp = generateOtp();
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        System.out.println("========================================");
        System.out.println("REGISTER OTP for " + email + " : " + otp);
        System.out.println("========================================");

        emailService.sendOtp(email, name, otp);

        res.put("success", true);
        res.put("message", "OTP sent to your email.");
        res.put("devOtp", otp);
        return res;
    }

    // ─── Verify OTP ───────────────────────────────────────────────────────────
    public Map<String, Object> verifyOtp(String email, String otp) {
        Map<String, Object> res = new HashMap<>();
        Optional<User> opt = userRepository.findByEmail(email);
        if (opt.isEmpty()) {
            res.put("success", false); res.put("message", "User not found"); return res;
        }
        User user = opt.get();
        if (user.getOtp() == null || !user.getOtp().equals(otp)) {
            res.put("success", false); res.put("message", "Invalid OTP"); return res;
        }
        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            res.put("success", false); res.put("message", "OTP expired. Register again."); return res;
        }
        user.setVerified(true);
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
        emailService.sendWelcome(email, user.getName());
        res.put("success", true);
        res.put("message", "Email verified! You can now login.");
        return res;
    }

    // ─── Login (with device + rememberMe support) ─────────────────────────────
    public Map<String, Object> login(String email, String password, String device, boolean rememberMe) {
        Map<String, Object> res = new HashMap<>();
        Optional<User> opt = userRepository.findByEmail(email);

        if (opt.isEmpty()) {
            res.put("success", false); res.put("message", "User not found"); return res;
        }
        User user = opt.get();
        if (user.isBanned()) {
            res.put("success", false); res.put("message", "Account suspended"); return res;
        }
        if (!user.isVerified()) {
            res.put("success", false); res.put("message", "Please verify your email first"); return res;
        }
        if (!user.getPassword().equals(password)) {
            res.put("success", false); res.put("message", "Invalid password"); return res;
        }

        // Record login history if field exists on User model
        try {
            String history = user.getLoginHistory() == null ? "" : user.getLoginHistory();
            String entry = LocalDateTime.now() + " | " + (device != null ? device : "Unknown");
            // Keep last 10 entries
            String[] entries = history.isEmpty() ? new String[0] : history.split("\n");
            List<String> list = new ArrayList<>(Arrays.asList(entries));
            list.add(0, entry);
            if (list.size() > 10) list = list.subList(0, 10);
            user.setLoginHistory(String.join("\n", list));
            userRepository.save(user);
        } catch (Exception ignored) {}

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        res.put("success", true);
        res.put("token", token);
        res.put("id", user.getId());
        res.put("name", user.getName());
        res.put("email", user.getEmail());
        res.put("role", user.getRole());
        res.put("profilePhoto", user.getProfilePhoto());
        res.put("profileCompletion", user.getProfileCompletion());
        return res;
    }

    // ─── 2FA ──────────────────────────────────────────────────────────────────
    public Map<String, Object> verify2FA(String email, String code) {
        Map<String, Object> res = new HashMap<>();
        Optional<User> opt = userRepository.findByEmail(email);
        if (opt.isEmpty()) {
            res.put("success", false); res.put("message", "User not found"); return res;
        }
        User user = opt.get();
        if (user.getOtp() == null || !user.getOtp().equals(code)) {
            res.put("success", false); res.put("message", "Invalid 2FA code"); return res;
        }
        if (user.getOtpExpiry() != null && user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            res.put("success", false); res.put("message", "2FA code expired"); return res;
        }
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        res.put("success", true);
        res.put("token", token);
        res.put("id", user.getId());
        res.put("name", user.getName());
        res.put("email", user.getEmail());
        res.put("role", user.getRole());
        res.put("profilePhoto", user.getProfilePhoto());
        res.put("profileCompletion", user.getProfileCompletion());
        return res;
    }

    public Map<String, Object> toggle2FA(String email) {
        Map<String, Object> res = new HashMap<>();
        Optional<User> opt = userRepository.findByEmail(email);
        if (opt.isEmpty()) {
            res.put("success", false); res.put("message", "User not found"); return res;
        }
        User user = opt.get();
        try {
            boolean current = Boolean.TRUE.equals(user.isTwoFactorEnabled());
            user.setTwoFactorEnabled(!current);
            userRepository.save(user);
            res.put("success", true);
            res.put("twoFactorEnabled", !current);
            res.put("message", "2FA " + (!current ? "enabled" : "disabled"));
        } catch (Exception e) {
            res.put("success", false);
            res.put("message", "2FA toggle not supported yet.");
        }
        return res;
    }

    // ─── Login History ────────────────────────────────────────────────────────
    public Map<String, Object> getLoginHistory(String email) {
        Map<String, Object> res = new HashMap<>();
        Optional<User> opt = userRepository.findByEmail(email);
        if (opt.isEmpty()) {
            res.put("success", false); res.put("message", "User not found"); return res;
        }
        User user = opt.get();
        List<String> history = new ArrayList<>();
        try {
            String raw = user.getLoginHistory();
            if (raw != null && !raw.isBlank()) {
                history = Arrays.asList(raw.split("\n"));
            }
        } catch (Exception ignored) {}
        res.put("success", true);
        res.put("history", history);
        return res;
    }

    // ─── Account Deletion ─────────────────────────────────────────────────────
    public Map<String, Object> requestDeletion(String email) {
        Map<String, Object> res = new HashMap<>();
        Optional<User> opt = userRepository.findByEmail(email);
        if (opt.isEmpty()) {
            res.put("success", false); res.put("message", "User not found"); return res;
        }
        User user = opt.get();
        try {
            user.setDeletionRequestedAt(LocalDateTime.now());
            userRepository.save(user);
            res.put("success", true);
            res.put("message", "Account deletion requested. It will be processed in 30 days.");
        } catch (Exception e) {
            res.put("success", false);
            res.put("message", "Deletion request not supported yet.");
        }
        return res;
    }

    public Map<String, Object> cancelDeletion(String email) {
        Map<String, Object> res = new HashMap<>();
        Optional<User> opt = userRepository.findByEmail(email);
        if (opt.isEmpty()) {
            res.put("success", false); res.put("message", "User not found"); return res;
        }
        User user = opt.get();
        try {
            user.setDeletionRequestedAt(null);
            userRepository.save(user);
            res.put("success", true);
            res.put("message", "Account deletion cancelled.");
        } catch (Exception e) {
            res.put("success", false);
            res.put("message", "Cancel deletion not supported yet.");
        }
        return res;
    }

    // ─── Forgot / Reset Password ──────────────────────────────────────────────
    public Map<String, Object> forgotPassword(String email) {
        Map<String, Object> res = new HashMap<>();
        Optional<User> opt = userRepository.findByEmail(email);
        if (opt.isEmpty()) {
            res.put("success", false); res.put("message", "Email not registered"); return res;
        }
        User user = opt.get();
        String otp = generateOtp();
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        System.out.println("========================================");
        System.out.println("RESET OTP for " + email + " : " + otp);
        System.out.println("========================================");

        emailService.sendPasswordResetOtp(email, user.getName(), otp);

        res.put("success", true);
        res.put("message", "Reset OTP sent to your email.");
        res.put("devOtp", otp);
        return res;
    }

    public Map<String, Object> resetPassword(String email, String otp, String newPassword) {
        Map<String, Object> res = new HashMap<>();
        Optional<User> opt = userRepository.findByEmail(email);
        if (opt.isEmpty()) {
            res.put("success", false); res.put("message", "User not found"); return res;
        }
        User user = opt.get();
        if (user.getOtp() == null || !user.getOtp().equals(otp)
                || user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            res.put("success", false); res.put("message", "Invalid or expired OTP"); return res;
        }
        user.setPassword(newPassword);
        user.setVerified(true);
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
        res.put("success", true);
        res.put("message", "Password reset successful. Please login.");
        return res;
    }
}

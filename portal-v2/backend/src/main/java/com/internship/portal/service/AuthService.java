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
    @Autowired private EmailService   emailService;
    @Autowired private JwtUtil        jwtUtil;

    private String generateOtp() {
        return String.valueOf(100000 + new Random().nextInt(900000));
    }

    public Map<String, Object> register(Map<String, String> body) {
        Map<String, Object> res = new HashMap<>();
        String email    = body.get("email");
        String name     = body.get("name");
        String password = body.get("password");
        String roleStr  = body.getOrDefault("role", "STUDENT");
        String refCode  = body.get("referralCode");

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
        if (refCode != null && !refCode.isBlank()) user.setReferredByCode(refCode);

        String otp = generateOtp();
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        System.out.println("========================================");
        System.out.println("REGISTER OTP for " + email + " : " + otp);
        System.out.println("========================================");
        try {
            emailService.sendOtp(email, name, otp);
        } catch (Exception e) {
            System.out.println("Email not sent (disabled): " + e.getMessage());
        }

        res.put("success", true);
        res.put("message", "OTP sent! Check email or IntelliJ console.");
        return res;
    }

    public Map<String, Object> verifyOtp(String email, String otp) {
        Map<String, Object> res = new HashMap<>();
        Optional<User> opt = userRepository.findByEmail(email);
        if (opt.isEmpty()) { res.put("success", false); res.put("message", "User not found"); return res; }

        User user = opt.get();
        if (user.getOtp() == null || !user.getOtp().equals(otp)) {
            res.put("success", false); res.put("message", "Invalid OTP"); return res;
        }
        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            res.put("success", false); res.put("message", "OTP expired"); return res;
        }

        user.setVerified(true);
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
        try {
            emailService.sendWelcome(email, user.getName());
        } catch (Exception e) {
            System.out.println("Welcome email not sent: " + e.getMessage());
        }
        res.put("success", true);
        res.put("message", "Email verified! You can now login.");
        return res;


    }

    public Map<String, Object> login(String email, String password,
                                     String device, boolean rememberMe) {
        Map<String, Object> res = new HashMap<>();
        Optional<User> opt = userRepository.findByEmail(email);

        if (opt.isEmpty()) { res.put("success", false); res.put("message", "User not found"); return res; }
        User user = opt.get();
        if (user.isBanned())    { res.put("success", false); res.put("message", "Account suspended"); return res; }
        if (!user.isVerified()) { res.put("success", false); res.put("message", "Please verify your email first"); return res; }
        if (!user.getPassword().equals(password)) { res.put("success", false); res.put("message", "Invalid password"); return res; }

        // 2FA check
        if (user.isTwoFactorEnabled()) {
            String code = generateOtp();
            user.setTwoFactorCode(code);
            user.setTwoFactorExpiry(LocalDateTime.now().plusMinutes(5));
            userRepository.save(user);
            System.out.println("2FA CODE for " + email + " : " + code);
            emailService.sendOtp(email, user.getName(), code);
            res.put("success", true);
            res.put("requires2FA", true);
            res.put("message", "2FA code sent to your email.");
            return res;
        }

        // Record login history
        recordLogin(user, device);

        // Generate JWT — rememberMe = 30 days, else 24 hours
        long expiry = rememberMe ? 30L * 24 * 60 * 60 * 1000 : 24L * 60 * 60 * 1000;
        String token = jwtUtil.generateTokenWithExpiry(user.getEmail(), user.getRole().name(), expiry);

        res.put("success", true);
        res.put("token", token);
        res.put("id", user.getId());
        res.put("name", user.getName());
        res.put("email", user.getEmail());
        res.put("role", user.getRole());
        res.put("profilePhoto", user.getProfilePhoto());
        res.put("profileCompletion", user.getProfileCompletion());
        res.put("twoFactorEnabled", user.isTwoFactorEnabled());
        return res;
    }

    public Map<String, Object> verify2FA(String email, String code) {
        Map<String, Object> res = new HashMap<>();
        Optional<User> opt = userRepository.findByEmail(email);
        if (opt.isEmpty()) { res.put("success", false); res.put("message", "User not found"); return res; }

        User user = opt.get();
        if (user.getTwoFactorCode() == null || !user.getTwoFactorCode().equals(code)) {
            res.put("success", false); res.put("message", "Invalid 2FA code"); return res;
        }
        if (user.getTwoFactorExpiry().isBefore(LocalDateTime.now())) {
            res.put("success", false); res.put("message", "2FA code expired"); return res;
        }

        user.setTwoFactorCode(null);
        user.setTwoFactorExpiry(null);
        recordLogin(user, "2FA verified");

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
        if (opt.isEmpty()) { res.put("success", false); return res; }
        User user = opt.get();
        user.setTwoFactorEnabled(!user.isTwoFactorEnabled());
        userRepository.save(user);
        res.put("success", true);
        res.put("enabled", user.isTwoFactorEnabled());
        res.put("message", "2FA " + (user.isTwoFactorEnabled() ? "enabled" : "disabled"));
        return res;
    }

    public Map<String, Object> getLoginHistory(String email) {
        Map<String, Object> res = new HashMap<>();
        Optional<User> opt = userRepository.findByEmail(email);
        if (opt.isEmpty()) { res.put("success", false); return res; }
        res.put("success", true);
        res.put("history", opt.get().getLoginHistory());
        return res;
    }

    public Map<String, Object> requestDeletion(String email) {
        Map<String, Object> res = new HashMap<>();
        Optional<User> opt = userRepository.findByEmail(email);
        if (opt.isEmpty()) { res.put("success", false); return res; }
        User user = opt.get();
        user.setDeletionRequested(true);
        user.setDeletionRequestedAt(LocalDateTime.now());
        userRepository.save(user);
        emailService.sendRaw(email, "Account Deletion Request Received",
                "Hi " + user.getName() + ",\n\nYour account deletion request has been received.\n\n" +
                        "Your account will be deleted within 7 days. If this was a mistake, contact support immediately.\n\nInternHub Team");
        res.put("success", true);
        res.put("message", "Deletion request submitted. Account will be deleted within 7 days.");
        return res;
    }

    public Map<String, Object> cancelDeletion(String email) {
        Map<String, Object> res = new HashMap<>();
        Optional<User> opt = userRepository.findByEmail(email);
        if (opt.isEmpty()) { res.put("success", false); return res; }
        User user = opt.get();
        user.setDeletionRequested(false);
        user.setDeletionRequestedAt(null);
        userRepository.save(user);
        res.put("success", true);
        res.put("message", "Deletion request cancelled.");
        return res;
    }

    public Map<String, Object> forgotPassword(String email) {
        Map<String, Object> res = new HashMap<>();
        Optional<User> opt = userRepository.findByEmail(email);
        if (opt.isEmpty()) { res.put("success", false); res.put("message", "Email not registered"); return res; }
        User user = opt.get();
        String otp = generateOtp();
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);
        System.out.println("RESET OTP for " + email + " : " + otp);
        try {
            emailService.sendPasswordResetOtp(email, user.getName(), otp);
        } catch (Exception e) {
            System.out.println("Reset email not sent: " + e.getMessage());
        }
        res.put("success", true);
        res.put("message", "Reset OTP sent!");
        return res;
    }

    public Map<String, Object> resetPassword(String email, String otp, String newPassword) {
        Map<String, Object> res = new HashMap<>();
        Optional<User> opt = userRepository.findByEmail(email);
        if (opt.isEmpty()) { res.put("success", false); res.put("message", "User not found"); return res; }
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
        res.put("message", "Password reset successful.");
        return res;
    }

    private void recordLogin(User user, String device) {
        try {
            String history = user.getLoginHistory() == null ? "[]" : user.getLoginHistory();
            // Parse existing entries (simple approach)
            List<String> entries = new ArrayList<>();
            if (!history.equals("[]")) {
                String inner = history.substring(1, history.length() - 1);
                if (!inner.isBlank()) {
                    for (String entry : inner.split("\\},\\{")) {
                        entries.add(entry.startsWith("{") ? entry : "{" + entry);
                    }
                }
            }
            String newEntry = "{\"time\":\"" + LocalDateTime.now() + "\",\"device\":\"" +
                    (device == null ? "Unknown" : device.replace("\"", "'")) + "\"}";
            entries.add(0, newEntry);
            // Keep only last 5
            if (entries.size() > 5) entries = entries.subList(0, 5);
            // Fix JSON array
            List<String> fixed = new ArrayList<>();
            for (String e : entries) {
                if (!e.startsWith("{")) e = "{" + e;
                if (!e.endsWith("}")) e = e + "}";
                fixed.add(e);
            }
            user.setLoginHistory("[" + String.join(",", fixed) + "]");
        } catch (Exception e) {
            user.setLoginHistory("[{\"time\":\"" + LocalDateTime.now() + "\",\"device\":\"Unknown\"}]");
        }
        userRepository.save(user);
    }
}

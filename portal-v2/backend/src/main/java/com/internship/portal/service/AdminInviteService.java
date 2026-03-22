package com.internship.portal.service;

import com.internship.portal.model.AdminInvite;
import com.internship.portal.model.User;
import com.internship.portal.repository.AdminInviteRepository;
import com.internship.portal.repository.UserRepository;
import com.internship.portal.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class AdminInviteService {

    @Autowired private AdminInviteRepository inviteRepository;
    @Autowired private UserRepository        userRepository;
    @Autowired private EmailService          emailService;
    @Autowired private JwtUtil               jwtUtil;

    public Map<String, Object> sendInvite(String invitedEmail, String inviterEmail, String inviterName) {
        Map<String, Object> res = new HashMap<>();

        // Validate input
        if (invitedEmail == null || invitedEmail.isBlank()) {
            res.put("success", false);
            res.put("message", "Please enter an email address.");
            return res;
        }

        // Check if email already registered
        if (userRepository.existsByEmail(invitedEmail)) {
            res.put("success", false);
            res.put("message", "This email is already registered on InternHub.");
            return res;
        }

        // Check for existing pending invite — cancel old one and create fresh
        inviteRepository.findAll().stream()
                .filter(i -> i.getInvitedEmail().equalsIgnoreCase(invitedEmail) && !i.isUsed())
                .forEach(i -> { i.setUsed(true); inviteRepository.save(i); });

        // Generate unique secure token
        String token = UUID.randomUUID().toString().replace("-", "")
                + Long.toHexString(System.currentTimeMillis());

        AdminInvite invite = new AdminInvite();
        invite.setToken(token);
        invite.setInvitedEmail(invitedEmail);
        invite.setInvitedByEmail(inviterEmail != null ? inviterEmail : "admin");
        invite.setInvitedByName(inviterName  != null ? inviterName  : "Admin");
        invite.setExpiresAt(LocalDateTime.now().plusHours(48));
        invite.setUsed(false);

        // SAVE FIRST — before trying to send email
        inviteRepository.save(invite);

        String link = "http://localhost:3000/admin-register?token=" + token
                + "&email=" + invitedEmail;

        // Always print to console (works even without email setup)
        System.out.println("\n===========================================");
        System.out.println("ADMIN INVITE LINK for: " + invitedEmail);
        System.out.println(link);
        System.out.println("===========================================\n");

        // Try to send email — fail silently if email not configured
        String emailStatus = "printed to IntelliJ console";
        try {
            String subject = "You're invited to join InternHub as Admin!";
            String body =
                    "Hi,\n\n" + (inviterName != null ? inviterName : "Admin") +
                            " has invited you to join InternHub as an Administrator.\n\n" +
                            "Click the link below to create your admin account:\n\n" +
                            link + "\n\n" +
                            "This invitation expires in 48 hours.\n\n" +
                            "If you did not expect this invitation, ignore this email.\n\n" +
                            "— InternHub Team";
            emailService.sendRaw(invitedEmail, subject, body);
            emailStatus = "sent to " + invitedEmail;
        } catch (Exception e) {
            System.out.println("Email not sent (check SMTP config): " + e.getMessage());
            System.out.println("Share the link above manually with the invitee.");
        }

        res.put("success", true);
        res.put("message", "Invitation created! Link " + emailStatus + ". Check IntelliJ console for the link.");
        res.put("link",    link);
        res.put("token",   token);
        return res;
    }

    public Map<String, Object> validateToken(String token) {
        Map<String, Object> res = new HashMap<>();
        Optional<AdminInvite> opt = inviteRepository.findByToken(token);

        if (opt.isEmpty()) {
            res.put("valid", false);
            res.put("message", "Invalid invitation link.");
            return res;
        }
        AdminInvite invite = opt.get();

        if (invite.isUsed()) {
            res.put("valid", false);
            res.put("message", "This invitation has already been used.");
            return res;
        }
        if (invite.getExpiresAt().isBefore(LocalDateTime.now())) {
            res.put("valid", false);
            res.put("message", "This invitation has expired. Please ask for a new invite.");
            return res;
        }

        res.put("valid",        true);
        res.put("invitedEmail", invite.getInvitedEmail());
        res.put("invitedBy",    invite.getInvitedByName());
        res.put("expiresAt",    invite.getExpiresAt().toString());
        return res;
    }

    public Map<String, Object> registerAdmin(String token, String name, String password) {
        Map<String, Object> res = new HashMap<>();

        Map<String, Object> validation = validateToken(token);
        if (!(boolean) validation.get("valid")) {
            res.put("success", false);
            res.put("message", validation.get("message"));
            return res;
        }

        AdminInvite invite = inviteRepository.findByToken(token).get();
        String email = invite.getInvitedEmail();

        if (userRepository.existsByEmail(email)) {
            res.put("success", false);
            res.put("message", "This email is already registered.");
            return res;
        }

        // Create admin user — pre-verified, no OTP needed
        User admin = new User();
        admin.setName(name);
        admin.setEmail(email);
        admin.setPassword(password);
        admin.setRole(User.Role.ADMIN);
        admin.setVerified(true);
        admin.setPoints(0);
        admin.setStreakDays(0);
        admin.setBadgeCount(0);
        userRepository.save(admin);

        // Mark invite used
        invite.setUsed(true);
        invite.setUsedAt(LocalDateTime.now());
        inviteRepository.save(invite);

        // Generate JWT for immediate login
        String jwtToken = jwtUtil.generateToken(email, "ADMIN");

        // Welcome email — fail silently
        try {
            emailService.sendRaw(email,
                    "Welcome to InternHub Admin Panel!",
                    "Hi " + name + ",\n\nYour admin account is ready!\n\n" +
                            "Login: http://localhost:3000/login\nEmail: " + email +
                            "\n\n— InternHub Team");
        } catch (Exception ignored) {}

        System.out.println("\n✅ NEW ADMIN REGISTERED: " + name + " (" + email + ")");

        res.put("success", true);
        res.put("message", "Admin account created successfully!");
        res.put("token",   jwtToken);
        res.put("name",    name);
        res.put("email",   email);
        res.put("role",    "ADMIN");
        return res;
    }

    public List<AdminInvite> getAllInvites() {
        return inviteRepository.findAllByOrderByCreatedAtDesc();
    }

    public Map<String, Object> revokeInvite(Long id) {
        Map<String, Object> res = new HashMap<>();
        inviteRepository.findById(id).ifPresent(invite -> {
            invite.setUsed(true);
            invite.setUsedAt(LocalDateTime.now());
            inviteRepository.save(invite);
        });
        res.put("success", true);
        res.put("message", "Invitation revoked.");
        return res;
    }
}
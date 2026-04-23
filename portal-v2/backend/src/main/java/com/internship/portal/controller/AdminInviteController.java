package com.internship.portal.controller;

import com.internship.portal.service.AdminInviteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/admin-invite")
@CrossOrigin(origins = "*")
public class AdminInviteController {

    @Autowired private AdminInviteService inviteService;

    // Send invite — only existing admin can do this
    @PostMapping("/send")
    public ResponseEntity<?> sendInvite(@RequestBody Map<String, String> body,
                                        Authentication auth) {
        String inviterEmail = auth != null ? (String) auth.getPrincipal() : "";
        String inviterName  = body.getOrDefault("inviterName", "Admin");
        String invitedEmail = body.get("email");
        return ResponseEntity.ok(inviteService.sendInvite(invitedEmail, inviterEmail, inviterName));
    }

    // Validate token — public (no auth needed, used on registration page)
    @GetMapping("/validate/{token}")
    public ResponseEntity<?> validateToken(@PathVariable String token) {
        return ResponseEntity.ok(inviteService.validateToken(token));
    }

    // Register new admin using invite token — public
    @PostMapping("/register")
    public ResponseEntity<?> registerAdmin(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(inviteService.registerAdmin(
                body.get("token"),
                body.get("name"),
                body.get("password")));
    }

    // Get all invites — admin only
    @GetMapping("/all")
    public ResponseEntity<?> getAllInvites() {
        return ResponseEntity.ok(inviteService.getAllInvites());
    }

    // Revoke invite — admin only
    @DeleteMapping("/revoke/{id}")
    public ResponseEntity<?> revokeInvite(@PathVariable Long id) {
        return ResponseEntity.ok(inviteService.revokeInvite(id));
    }
}

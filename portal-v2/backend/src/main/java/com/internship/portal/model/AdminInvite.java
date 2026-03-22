package com.internship.portal.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "admin_invites")
public class AdminInvite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String token;

    @Column(nullable = false)
    private String invitedEmail;

    private String invitedByEmail;
    private String invitedByName;

    private boolean used = false;
    private LocalDateTime createdAt  = LocalDateTime.now();
    private LocalDateTime expiresAt  = LocalDateTime.now().plusHours(48);
    private LocalDateTime usedAt;

    public AdminInvite() {}

    public Long getId() { return id; }
    public String getToken() { return token; }
    public String getInvitedEmail() { return invitedEmail; }
    public String getInvitedByEmail() { return invitedByEmail; }
    public String getInvitedByName() { return invitedByName; }
    public boolean isUsed() { return used; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public LocalDateTime getUsedAt() { return usedAt; }

    public void setId(Long id) { this.id = id; }
    public void setToken(String v) { this.token = v; }
    public void setInvitedEmail(String v) { this.invitedEmail = v; }
    public void setInvitedByEmail(String v) { this.invitedByEmail = v; }
    public void setInvitedByName(String v) { this.invitedByName = v; }
    public void setUsed(boolean v) { this.used = v; }
    public void setCreatedAt(LocalDateTime v) { this.createdAt = v; }
    public void setExpiresAt(LocalDateTime v) { this.expiresAt = v; }
    public void setUsedAt(LocalDateTime v) { this.usedAt = v; }
}

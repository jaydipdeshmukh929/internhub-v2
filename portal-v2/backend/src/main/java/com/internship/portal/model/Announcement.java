package com.internship.portal.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "announcements")
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 3000)
    private String content;

    private String type;            // INFO, WARNING, SUCCESS, URGENT
    private String postedByEmail;
    private String postedByName;
    private boolean pinned = false;
    private boolean active = true;
    private LocalDateTime postedAt = LocalDateTime.now();
    private LocalDateTime expiresAt;

    public Announcement() {}

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getContent() { return content; }
    public String getType() { return type; }
    public String getPostedByEmail() { return postedByEmail; }
    public String getPostedByName() { return postedByName; }
    public boolean isPinned() { return pinned; }
    public boolean isActive() { return active; }
    public LocalDateTime getPostedAt() { return postedAt; }
    public LocalDateTime getExpiresAt() { return expiresAt; }

    public void setId(Long id) { this.id = id; }
    public void setTitle(String v) { this.title = v; }
    public void setContent(String v) { this.content = v; }
    public void setType(String v) { this.type = v; }
    public void setPostedByEmail(String v) { this.postedByEmail = v; }
    public void setPostedByName(String v) { this.postedByName = v; }
    public void setPinned(boolean v) { this.pinned = v; }
    public void setActive(boolean v) { this.active = v; }
    public void setPostedAt(LocalDateTime v) { this.postedAt = v; }
    public void setExpiresAt(LocalDateTime v) { this.expiresAt = v; }
}

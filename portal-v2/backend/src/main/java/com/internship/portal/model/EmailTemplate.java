package com.internship.portal.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "email_templates")
public class EmailTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String templateType;

    private String subject;

    @Column(length = 4000)
    private String body;

    private boolean active = true;
    private String createdByEmail;
    private LocalDateTime updatedAt = LocalDateTime.now();

    public EmailTemplate() {}

    public Long getId() { return id; }
    public String getTemplateType() { return templateType; }
    public String getSubject() { return subject; }
    public String getBody() { return body; }
    public boolean isActive() { return active; }
    public String getCreatedByEmail() { return createdByEmail; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public void setId(Long id) { this.id = id; }
    public void setTemplateType(String v) { this.templateType = v; }
    public void setSubject(String v) { this.subject = v; }
    public void setBody(String v) { this.body = v; }
    public void setActive(boolean v) { this.active = v; }
    public void setCreatedByEmail(String v) { this.createdByEmail = v; }
    public void setUpdatedAt(LocalDateTime v) { this.updatedAt = v; }
}

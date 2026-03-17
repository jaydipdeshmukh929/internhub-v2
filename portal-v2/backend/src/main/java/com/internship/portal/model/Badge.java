package com.internship.portal.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "badges")
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String studentEmail;
    private String badgeName;
    private String badgeIcon;
    private String badgeDescription;
    private LocalDateTime earnedAt = LocalDateTime.now();

    public Badge() {}

    public static Badge create(String email, String name, String icon, String desc) {
        Badge b = new Badge();
        b.studentEmail = email;
        b.badgeName = name;
        b.badgeIcon = icon;
        b.badgeDescription = desc;
        return b;
    }

    public Long getId() { return id; }
    public String getStudentEmail() { return studentEmail; }
    public String getBadgeName() { return badgeName; }
    public String getBadgeIcon() { return badgeIcon; }
    public String getBadgeDescription() { return badgeDescription; }
    public LocalDateTime getEarnedAt() { return earnedAt; }

    public void setId(Long id) { this.id = id; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }
    public void setBadgeName(String badgeName) { this.badgeName = badgeName; }
    public void setBadgeIcon(String badgeIcon) { this.badgeIcon = badgeIcon; }
    public void setBadgeDescription(String badgeDescription) { this.badgeDescription = badgeDescription; }
    public void setEarnedAt(LocalDateTime earnedAt) { this.earnedAt = earnedAt; }
}

package com.internship.portal.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role = Role.STUDENT;

    private String resumePath;
    private String profilePhoto;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(columnDefinition = "TEXT")
    private String skills;

    private String college;
    private String degree;
    private Integer graduationYear;
    private String phone;
    private String linkedinUrl;
    private String githubUrl;

    private Integer profileCompletion = 0;

    @Column(columnDefinition = "TEXT")
    private String portfolioLinks = "";

    @Column(unique = true)
    private String referralCode;

    private String referredByCode;
    private Integer referralCount = 0;
    private Integer badgeCount = 0;
    private Integer resumeScore = 0;

    @Column(columnDefinition = "TEXT")
    private String resumeFeedback;

    // Gamification
    private Integer points = 0;
    private Integer streakDays = 0;
    private LocalDate lastApplied;
    private Integer longestStreak = 0;

    // Security
    private boolean twoFactorEnabled = false;
    private String twoFactorCode;
    private LocalDateTime twoFactorExpiry;

    @Column(columnDefinition = "TEXT")
    private String loginHistory = "[]";

    private boolean deletionRequested = false;
    private LocalDateTime deletionRequestedAt;
    private String fcmToken;

    // Social / Discovery
    @Column(columnDefinition = "TEXT")
    private String followedCompanies = "";

    @Column(columnDefinition = "TEXT")
    private String searchHistory = "[]";

    @Column(columnDefinition = "TEXT")
    private String savedFilters = "[]";

    private boolean isPremium = false;
    private LocalDateTime premiumUntil;
    private boolean isAlumni = false;

    private String completedAt;

    // Public profile
    private String publicSlug;
    private boolean profilePublic = false;

    // Verification
    private boolean verified = false;
    private boolean banned = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    private String otp;
    private LocalDateTime otpExpiry;

    @Column(columnDefinition = "TEXT")
    private String savedInternshipIds = "";

    public enum Role { ADMIN, STUDENT, COMPANY }

    public User() {}

    // ── Getters ────────────────────────────────────────────────────────────────
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public Role getRole() { return role; }
    public String getResumePath() { return resumePath; }
    public String getProfilePhoto() { return profilePhoto; }
    public String getBio() { return bio; }
    public String getSkills() { return skills; }
    public String getCollege() { return college; }
    public String getDegree() { return degree; }
    public Integer getGraduationYear() { return graduationYear; }
    public String getPhone() { return phone; }
    public String getLinkedinUrl() { return linkedinUrl; }
    public String getGithubUrl() { return githubUrl; }
    public Integer getProfileCompletion() { return profileCompletion; }
    public String getPortfolioLinks() { return portfolioLinks; }
    public String getReferralCode() { return referralCode; }
    public String getReferredByCode() { return referredByCode; }
    public Integer getReferralCount() { return referralCount; }
    public Integer getBadgeCount() { return badgeCount; }
    public Integer getResumeScore() { return resumeScore; }
    public String getResumeFeedback() { return resumeFeedback; }
    public Integer getPoints() { return points; }
    public Integer getStreakDays() { return streakDays; }
    public LocalDate getLastApplied() { return lastApplied; }
    public Integer getLongestStreak() { return longestStreak; }
    public boolean isTwoFactorEnabled() { return twoFactorEnabled; }
    public String getTwoFactorCode() { return twoFactorCode; }
    public LocalDateTime getTwoFactorExpiry() { return twoFactorExpiry; }
    public String getLoginHistory() { return loginHistory; }
    public boolean isDeletionRequested() { return deletionRequested; }
    public LocalDateTime getDeletionRequestedAt() { return deletionRequestedAt; }
    public String getFcmToken() { return fcmToken; }
    public String getFollowedCompanies() { return followedCompanies; }
    public String getSearchHistory() { return searchHistory; }
    public String getSavedFilters() { return savedFilters; }
    public boolean isPremium() { return isPremium; }
    public LocalDateTime getPremiumUntil() { return premiumUntil; }
    public boolean isAlumni() { return isAlumni; }
    public String getCompletedAt() { return completedAt; }
    public String getPublicSlug() { return publicSlug; }
    public boolean isProfilePublic() { return profilePublic; }
    public boolean isVerified() { return verified; }
    public boolean isBanned() { return banned; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public String getOtp() { return otp; }
    public LocalDateTime getOtpExpiry() { return otpExpiry; }
    public String getSavedInternshipIds() { return savedInternshipIds; }

    // ── Setters ────────────────────────────────────────────────────────────────
    public void setId(Long v) { this.id = v; }
    public void setName(String v) { this.name = v; }
    public void setEmail(String v) { this.email = v; }
    public void setPassword(String v) { this.password = v; }
    public void setRole(Role v) { this.role = v; }
    public void setResumePath(String v) { this.resumePath = v; }
    public void setProfilePhoto(String v) { this.profilePhoto = v; }
    public void setBio(String v) { this.bio = v; }
    public void setSkills(String v) { this.skills = v; }
    public void setCollege(String v) { this.college = v; }
    public void setDegree(String v) { this.degree = v; }
    public void setGraduationYear(Integer v) { this.graduationYear = v; }
    public void setPhone(String v) { this.phone = v; }
    public void setLinkedinUrl(String v) { this.linkedinUrl = v; }
    public void setGithubUrl(String v) { this.githubUrl = v; }
    public void setProfileCompletion(Integer v) { this.profileCompletion = v; }
    public void setPortfolioLinks(String v) { this.portfolioLinks = v; }
    public void setReferralCode(String v) { this.referralCode = v; }
    public void setReferredByCode(String v) { this.referredByCode = v; }
    public void setReferralCount(Integer v) { this.referralCount = v; }
    public void setBadgeCount(Integer v) { this.badgeCount = v; }
    public void setResumeScore(Integer v) { this.resumeScore = v; }
    public void setResumeFeedback(String v) { this.resumeFeedback = v; }
    public void setPoints(Integer v) { this.points = v; }
    public void setStreakDays(Integer v) { this.streakDays = v; }
    public void setLastApplied(LocalDate v) { this.lastApplied = v; }
    public void setLongestStreak(Integer v) { this.longestStreak = v; }
    public void setTwoFactorEnabled(boolean v) { this.twoFactorEnabled = v; }
    public void setTwoFactorCode(String v) { this.twoFactorCode = v; }
    public void setTwoFactorExpiry(LocalDateTime v) { this.twoFactorExpiry = v; }
    public void setLoginHistory(String v) { this.loginHistory = v; }
    public void setDeletionRequested(boolean v) { this.deletionRequested = v; }
    public void setDeletionRequestedAt(LocalDateTime v) { this.deletionRequestedAt = v; }
    public void setFcmToken(String v) { this.fcmToken = v; }
    public void setFollowedCompanies(String v) { this.followedCompanies = v; }
    public void setSearchHistory(String v) { this.searchHistory = v; }
    public void setSavedFilters(String v) { this.savedFilters = v; }
    public void setPremium(boolean v) { this.isPremium = v; }
    public void setPremiumUntil(LocalDateTime v) { this.premiumUntil = v; }
    public void setAlumni(boolean v) { this.isAlumni = v; }
    public void setCompletedAt(String v) { this.completedAt = v; }
    public void setPublicSlug(String v) { this.publicSlug = v; }
    public void setProfilePublic(boolean v) { this.profilePublic = v; }
    public void setVerified(boolean v) { this.verified = v; }
    public void setBanned(boolean v) { this.banned = v; }
    public void setCreatedAt(LocalDateTime v) { this.createdAt = v; }
    public void setOtp(String v) { this.otp = v; }
    public void setOtpExpiry(LocalDateTime v) { this.otpExpiry = v; }
    public void setSavedInternshipIds(String v) { this.savedInternshipIds = v; }
}

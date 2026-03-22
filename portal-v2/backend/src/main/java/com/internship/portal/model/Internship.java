package com.internship.portal.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "internships")
public class Internship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String companyName;
    private String companyLogo;
    private String role;
    private String location;
    private Double latitude;
    private Double longitude;
    private boolean remote = false;
    private String duration;
    private Double stipend;
    private String stipendType;

    @Column(length = 3000)
    private String description;

    @Column(length = 2000)
    private String responsibilities;

    @Column(length = 2000)
    private String requirements;

    private String skillsRequired;
    private String category;
    private String type;
    private LocalDate applyDeadline;
    private Integer openings;
    private Integer applicationCount = 0;
    private Integer viewCount        = 0;
    private LocalDateTime postedAt   = LocalDateTime.now();
    private String postedByEmail;
    private boolean featured         = false;  // Feature 30 — premium listing
    private boolean verified         = false;  // Feature 11 — verified company
    private boolean completed        = false;  // Feature 18 — completion marking
    private String  offerLetterPath;           // Feature 19 — offer letter upload
    private String  bannerImage;               // Feature 39 — detail page banner

    // Multi-round interviews (Feature 17)
    @Column(length = 1000)
    private String interviewRounds;  // JSON: [{round:1, type:"Technical", scheduledAt:"..."}]

    // Extension requests (Feature 20)
    private boolean extensionRequested = false;
    private String  extensionReason;

    @Enumerated(EnumType.STRING)
    private Status status = Status.ACTIVE;

    public enum Status { ACTIVE, CLOSED, DRAFT, COMPLETED }

    public Internship() {}

    public Long getId() { return id; }
    public String getCompanyName() { return companyName; }
    public String getCompanyLogo() { return companyLogo; }
    public String getRole() { return role; }
    public String getLocation() { return location; }
    public Double getLatitude() { return latitude; }
    public Double getLongitude() { return longitude; }
    public boolean isRemote() { return remote; }
    public String getDuration() { return duration; }
    public Double getStipend() { return stipend; }
    public String getStipendType() { return stipendType; }
    public String getDescription() { return description; }
    public String getResponsibilities() { return responsibilities; }
    public String getRequirements() { return requirements; }
    public String getSkillsRequired() { return skillsRequired; }
    public String getCategory() { return category; }
    public String getType() { return type; }
    public LocalDate getApplyDeadline() { return applyDeadline; }
    public Integer getOpenings() { return openings; }
    public Integer getApplicationCount() { return applicationCount; }
    public Integer getViewCount() { return viewCount; }
    public LocalDateTime getPostedAt() { return postedAt; }
    public String getPostedByEmail() { return postedByEmail; }
    public boolean isFeatured() { return featured; }
    public boolean isVerified() { return verified; }
    public boolean isCompleted() { return completed; }
    public String getOfferLetterPath() { return offerLetterPath; }
    public String getBannerImage() { return bannerImage; }
    public String getInterviewRounds() { return interviewRounds; }
    public boolean isExtensionRequested() { return extensionRequested; }
    public String getExtensionReason() { return extensionReason; }
    public Status getStatus() { return status; }

    public void setId(Long v) { this.id = v; }
    public void setCompanyName(String v) { this.companyName = v; }
    public void setCompanyLogo(String v) { this.companyLogo = v; }
    public void setRole(String v) { this.role = v; }
    public void setLocation(String v) { this.location = v; }
    public void setLatitude(Double v) { this.latitude = v; }
    public void setLongitude(Double v) { this.longitude = v; }
    public void setRemote(boolean v) { this.remote = v; }
    public void setDuration(String v) { this.duration = v; }
    public void setStipend(Double v) { this.stipend = v; }
    public void setStipendType(String v) { this.stipendType = v; }
    public void setDescription(String v) { this.description = v; }
    public void setResponsibilities(String v) { this.responsibilities = v; }
    public void setRequirements(String v) { this.requirements = v; }
    public void setSkillsRequired(String v) { this.skillsRequired = v; }
    public void setCategory(String v) { this.category = v; }
    public void setType(String v) { this.type = v; }
    public void setApplyDeadline(LocalDate v) { this.applyDeadline = v; }
    public void setOpenings(Integer v) { this.openings = v; }
    public void setApplicationCount(Integer v) { this.applicationCount = v; }
    public void setViewCount(Integer v) { this.viewCount = v; }
    public void setPostedAt(LocalDateTime v) { this.postedAt = v; }
    public void setPostedByEmail(String v) { this.postedByEmail = v; }
    public void setFeatured(boolean v) { this.featured = v; }
    public void setVerified(boolean v) { this.verified = v; }
    public void setCompleted(boolean v) { this.completed = v; }
    public void setOfferLetterPath(String v) { this.offerLetterPath = v; }
    public void setBannerImage(String v) { this.bannerImage = v; }
    public void setInterviewRounds(String v) { this.interviewRounds = v; }
    public void setExtensionRequested(boolean v) { this.extensionRequested = v; }
    public void setExtensionReason(String v) { this.extensionReason = v; }
    public void setStatus(Status v) { this.status = v; }
}

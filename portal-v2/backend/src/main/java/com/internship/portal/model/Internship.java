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
    private String companyLogo;     // filename
    private String role;
    private String location;
    private boolean remote = false;
    private String duration;
    private Double stipend;
    private String stipendType;     // MONTHLY / LUMP_SUM / UNPAID

    @Column(length = 2000)
    private String description;

    @Column(length = 1000)
    private String responsibilities;

    @Column(length = 1000)
    private String requirements;

    private String skillsRequired;  // comma-separated
    private String category;        // e.g. Tech, Marketing, Design
    private String type;            // FULL_TIME / PART_TIME / INTERNSHIP

    private LocalDate applyDeadline;
    private Integer openings;
    private Integer applicationCount = 0;
    private Integer viewCount = 0;

    @Enumerated(EnumType.STRING)
    private Status status = Status.ACTIVE;

    private LocalDateTime postedAt = LocalDateTime.now();
    private String postedByEmail;   // admin email

    public enum Status { ACTIVE, CLOSED, DRAFT }

    // Constructors
    public Internship() {}

    // Getters
    public Long getId() { return id; }
    public String getCompanyName() { return companyName; }
    public String getCompanyLogo() { return companyLogo; }
    public String getRole() { return role; }
    public String getLocation() { return location; }
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
    public Status getStatus() { return status; }
    public LocalDateTime getPostedAt() { return postedAt; }
    public String getPostedByEmail() { return postedByEmail; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public void setCompanyLogo(String companyLogo) { this.companyLogo = companyLogo; }
    public void setRole(String role) { this.role = role; }
    public void setLocation(String location) { this.location = location; }
    public void setRemote(boolean remote) { this.remote = remote; }
    public void setDuration(String duration) { this.duration = duration; }
    public void setStipend(Double stipend) { this.stipend = stipend; }
    public void setStipendType(String stipendType) { this.stipendType = stipendType; }
    public void setDescription(String description) { this.description = description; }
    public void setResponsibilities(String responsibilities) { this.responsibilities = responsibilities; }
    public void setRequirements(String requirements) { this.requirements = requirements; }
    public void setSkillsRequired(String skillsRequired) { this.skillsRequired = skillsRequired; }
    public void setCategory(String category) { this.category = category; }
    public void setType(String type) { this.type = type; }
    public void setApplyDeadline(LocalDate applyDeadline) { this.applyDeadline = applyDeadline; }
    public void setOpenings(Integer openings) { this.openings = openings; }
    public void setApplicationCount(Integer applicationCount) { this.applicationCount = applicationCount; }
    public void setViewCount(Integer viewCount) { this.viewCount = viewCount; }
    public void setStatus(Status status) { this.status = status; }
    public void setPostedAt(LocalDateTime postedAt) { this.postedAt = postedAt; }
    public void setPostedByEmail(String postedByEmail) { this.postedByEmail = postedByEmail; }
}

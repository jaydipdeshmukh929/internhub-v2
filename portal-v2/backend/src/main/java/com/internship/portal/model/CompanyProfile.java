package com.internship.portal.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "company_profiles")
public class CompanyProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String companyName;

    private String logoPath;
    private String website;
    private String industry;
    private String location;
    private String foundedYear;
    private String companySize;

    @Column(length = 2000)
    private String about;

    @Column(length = 1000)
    private String benefits;

    private String linkedinUrl;
    private String twitterUrl;
    private String glassdoorUrl;
    private Double averageRating = 0.0;
    private Integer totalReviews = 0;
    private Integer totalInternships = 0;
    private String createdByEmail;
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public CompanyProfile() {}

    public Long getId() { return id; }
    public String getCompanyName() { return companyName; }
    public String getLogoPath() { return logoPath; }
    public String getWebsite() { return website; }
    public String getIndustry() { return industry; }
    public String getLocation() { return location; }
    public String getFoundedYear() { return foundedYear; }
    public String getCompanySize() { return companySize; }
    public String getAbout() { return about; }
    public String getBenefits() { return benefits; }
    public String getLinkedinUrl() { return linkedinUrl; }
    public String getTwitterUrl() { return twitterUrl; }
    public String getGlassdoorUrl() { return glassdoorUrl; }
    public Double getAverageRating() { return averageRating; }
    public Integer getTotalReviews() { return totalReviews; }
    public Integer getTotalInternships() { return totalInternships; }
    public String getCreatedByEmail() { return createdByEmail; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public void setId(Long id) { this.id = id; }
    public void setCompanyName(String v) { this.companyName = v; }
    public void setLogoPath(String v) { this.logoPath = v; }
    public void setWebsite(String v) { this.website = v; }
    public void setIndustry(String v) { this.industry = v; }
    public void setLocation(String v) { this.location = v; }
    public void setFoundedYear(String v) { this.foundedYear = v; }
    public void setCompanySize(String v) { this.companySize = v; }
    public void setAbout(String v) { this.about = v; }
    public void setBenefits(String v) { this.benefits = v; }
    public void setLinkedinUrl(String v) { this.linkedinUrl = v; }
    public void setTwitterUrl(String v) { this.twitterUrl = v; }
    public void setGlassdoorUrl(String v) { this.glassdoorUrl = v; }
    public void setAverageRating(Double v) { this.averageRating = v; }
    public void setTotalReviews(Integer v) { this.totalReviews = v; }
    public void setTotalInternships(Integer v) { this.totalInternships = v; }
    public void setCreatedByEmail(String v) { this.createdByEmail = v; }
    public void setCreatedAt(LocalDateTime v) { this.createdAt = v; }
    public void setUpdatedAt(LocalDateTime v) { this.updatedAt = v; }
}

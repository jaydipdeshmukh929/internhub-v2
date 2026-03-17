package com.internship.portal.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String studentEmail;
    private String studentName;
    private String companyName;
    private Integer rating;         // 1-5
    private String reviewTitle;

    @Column(length = 2000)
    private String reviewText;

    private boolean anonymous = false;
    private LocalDateTime createdAt = LocalDateTime.now();

    public Review() {}

    public Long getId() { return id; }
    public String getStudentEmail() { return studentEmail; }
    public String getStudentName() { return studentName; }
    public String getCompanyName() { return companyName; }
    public Integer getRating() { return rating; }
    public String getReviewTitle() { return reviewTitle; }
    public String getReviewText() { return reviewText; }
    public boolean isAnonymous() { return anonymous; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setId(Long id) { this.id = id; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public void setRating(Integer rating) { this.rating = rating; }
    public void setReviewTitle(String reviewTitle) { this.reviewTitle = reviewTitle; }
    public void setReviewText(String reviewText) { this.reviewText = reviewText; }
    public void setAnonymous(boolean anonymous) { this.anonymous = anonymous; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

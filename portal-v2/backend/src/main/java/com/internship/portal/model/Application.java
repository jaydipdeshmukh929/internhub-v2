package com.internship.portal.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String studentEmail;
    private String studentName;
    private String companyName;
    private String role;

    @Column(length = 2000)
    private String coverLetter;

    private String resumePath;      // path at time of applying

    @Enumerated(EnumType.STRING)
    private Status status = Status.APPLIED;

    private String adminNote;       // admin feedback/reason

    // Interview scheduling
    private LocalDateTime interviewScheduledAt;
    private String interviewLink;   // Google Meet / Zoom link
    private String interviewType;   // ONLINE / OFFLINE

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "internship_id")
    private Internship internship;

    private LocalDateTime appliedAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum Status {
        APPLIED, UNDER_REVIEW, SHORTLISTED, INTERVIEW_SCHEDULED,
        ACCEPTED, REJECTED, WITHDRAWN
    }

    public Application() {}

    public static Application create(String studentEmail, String studentName,
                                     String companyName, String role,
                                     String coverLetter, String resumePath,
                                     Internship internship) {
        Application a = new Application();
        a.studentEmail = studentEmail;
        a.studentName = studentName;
        a.companyName = companyName;
        a.role = role;
        a.coverLetter = coverLetter;
        a.resumePath = resumePath;
        a.internship = internship;
        a.status = Status.APPLIED;
        return a;
    }

    // Getters
    public Long getId() { return id; }
    public String getStudentEmail() { return studentEmail; }
    public String getStudentName() { return studentName; }
    public String getCompanyName() { return companyName; }
    public String getRole() { return role; }
    public String getCoverLetter() { return coverLetter; }
    public String getResumePath() { return resumePath; }
    public Status getStatus() { return status; }
    public String getAdminNote() { return adminNote; }
    public LocalDateTime getInterviewScheduledAt() { return interviewScheduledAt; }
    public String getInterviewLink() { return interviewLink; }
    public String getInterviewType() { return interviewType; }
    public Internship getInternship() { return internship; }
    public LocalDateTime getAppliedAt() { return appliedAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public void setRole(String role) { this.role = role; }
    public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }
    public void setResumePath(String resumePath) { this.resumePath = resumePath; }
    public void setStatus(Status status) { this.status = status; }
    public void setAdminNote(String adminNote) { this.adminNote = adminNote; }
    public void setInterviewScheduledAt(LocalDateTime interviewScheduledAt) { this.interviewScheduledAt = interviewScheduledAt; }
    public void setInterviewLink(String interviewLink) { this.interviewLink = interviewLink; }
    public void setInterviewType(String interviewType) { this.interviewType = interviewType; }
    public void setInternship(Internship internship) { this.internship = internship; }
    public void setAppliedAt(LocalDateTime appliedAt) { this.appliedAt = appliedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

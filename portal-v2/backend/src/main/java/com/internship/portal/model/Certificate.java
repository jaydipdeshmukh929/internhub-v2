package com.internship.portal.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "certificates")
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String studentEmail;
    private String studentName;
    private String companyName;
    private String internshipRole;
    private String filePath;
    private String fileName;
    private LocalDate completionDate;
    private LocalDateTime uploadedAt = LocalDateTime.now();

    public Certificate() {}

    public Long getId() { return id; }
    public String getStudentEmail() { return studentEmail; }
    public String getStudentName() { return studentName; }
    public String getCompanyName() { return companyName; }
    public String getInternshipRole() { return internshipRole; }
    public String getFilePath() { return filePath; }
    public String getFileName() { return fileName; }
    public LocalDate getCompletionDate() { return completionDate; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }

    public void setId(Long id) { this.id = id; }
    public void setStudentEmail(String e) { this.studentEmail = e; }
    public void setStudentName(String n) { this.studentName = n; }
    public void setCompanyName(String c) { this.companyName = c; }
    public void setInternshipRole(String r) { this.internshipRole = r; }
    public void setFilePath(String f) { this.filePath = f; }
    public void setFileName(String f) { this.fileName = f; }
    public void setCompletionDate(LocalDate d) { this.completionDate = d; }
    public void setUploadedAt(LocalDateTime d) { this.uploadedAt = d; }
}

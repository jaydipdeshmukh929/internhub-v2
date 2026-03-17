package com.internship.portal.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "qna")
public class QnA {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long internshipId;
    private String internshipRole;
    private String companyName;

    private String questionByEmail;
    private String questionByName;

    @Column(length = 1000)
    private String question;

    @Column(length = 2000)
    private String answer;

    private String answeredByEmail;
    private String answeredByName;

    private LocalDateTime askedAt   = LocalDateTime.now();
    private LocalDateTime answeredAt;

    public QnA() {}

    public Long getId() { return id; }
    public Long getInternshipId() { return internshipId; }
    public String getInternshipRole() { return internshipRole; }
    public String getCompanyName() { return companyName; }
    public String getQuestionByEmail() { return questionByEmail; }
    public String getQuestionByName() { return questionByName; }
    public String getQuestion() { return question; }
    public String getAnswer() { return answer; }
    public String getAnsweredByEmail() { return answeredByEmail; }
    public String getAnsweredByName() { return answeredByName; }
    public LocalDateTime getAskedAt() { return askedAt; }
    public LocalDateTime getAnsweredAt() { return answeredAt; }

    public void setId(Long id) { this.id = id; }
    public void setInternshipId(Long v) { this.internshipId = v; }
    public void setInternshipRole(String v) { this.internshipRole = v; }
    public void setCompanyName(String v) { this.companyName = v; }
    public void setQuestionByEmail(String v) { this.questionByEmail = v; }
    public void setQuestionByName(String v) { this.questionByName = v; }
    public void setQuestion(String v) { this.question = v; }
    public void setAnswer(String v) { this.answer = v; }
    public void setAnsweredByEmail(String v) { this.answeredByEmail = v; }
    public void setAnsweredByName(String v) { this.answeredByName = v; }
    public void setAskedAt(LocalDateTime v) { this.askedAt = v; }
    public void setAnsweredAt(LocalDateTime v) { this.answeredAt = v; }
}

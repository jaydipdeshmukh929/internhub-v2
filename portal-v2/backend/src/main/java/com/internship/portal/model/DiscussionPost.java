package com.internship.portal.model;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity @Table(name = "discussion_posts")
public class DiscussionPost {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String authorEmail;
    private String authorName;
    private String category; // GENERAL, INTERVIEW_TIPS, CAREER_ADVICE, COMPANIES, OFF_TOPIC
    private String title;
    @Column(length = 5000) private String content;
    private Integer likes = 0;
    private Integer replies = 0;
    private boolean pinned = false;
    private LocalDateTime postedAt = LocalDateTime.now();
    public Long getId() { return id; }
    public String getAuthorEmail() { return authorEmail; }
    public String getAuthorName() { return authorName; }
    public String getCategory() { return category; }
    public String getTitle() { return title; }
    public String getContent() { return content; }
    public Integer getLikes() { return likes; }
    public Integer getReplies() { return replies; }
    public boolean isPinned() { return pinned; }
    public LocalDateTime getPostedAt() { return postedAt; }
    public void setId(Long v) { id=v; }
    public void setAuthorEmail(String v) { authorEmail=v; }
    public void setAuthorName(String v) { authorName=v; }
    public void setCategory(String v) { category=v; }
    public void setTitle(String v) { title=v; }
    public void setContent(String v) { content=v; }
    public void setLikes(Integer v) { likes=v; }
    public void setReplies(Integer v) { replies=v; }
    public void setPinned(boolean v) { pinned=v; }
    public void setPostedAt(LocalDateTime v) { postedAt=v; }
}

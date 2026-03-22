package com.internship.portal.model;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity @Table(name = "discussion_replies")
public class DiscussionReply {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private Long postId;
    private String authorEmail;
    private String authorName;
    @Column(length = 2000) private String content;
    private Integer likes = 0;
    private LocalDateTime postedAt = LocalDateTime.now();
    public Long getId() { return id; }
    public Long getPostId() { return postId; }
    public String getAuthorEmail() { return authorEmail; }
    public String getAuthorName() { return authorName; }
    public String getContent() { return content; }
    public Integer getLikes() { return likes; }
    public LocalDateTime getPostedAt() { return postedAt; }
    public void setId(Long v) { id=v; }
    public void setPostId(Long v) { postId=v; }
    public void setAuthorEmail(String v) { authorEmail=v; }
    public void setAuthorName(String v) { authorName=v; }
    public void setContent(String v) { content=v; }
    public void setLikes(Integer v) { likes=v; }
    public void setPostedAt(LocalDateTime v) { postedAt=v; }
}

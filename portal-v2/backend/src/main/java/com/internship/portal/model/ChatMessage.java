package com.internship.portal.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String senderEmail;
    private String senderName;
    private String receiverEmail;
    private String roomId;          // format: "student@email_admin@email"

    @Column(length = 2000)
    private String message;

    private boolean read = false;
    private LocalDateTime sentAt = LocalDateTime.now();

    public ChatMessage() {}

    public static ChatMessage create(String senderEmail, String senderName,
                                     String receiverEmail, String roomId, String message) {
        ChatMessage m = new ChatMessage();
        m.senderEmail   = senderEmail;
        m.senderName    = senderName;
        m.receiverEmail = receiverEmail;
        m.roomId        = roomId;
        m.message       = message;
        return m;
    }

    public Long getId() { return id; }
    public String getSenderEmail() { return senderEmail; }
    public String getSenderName() { return senderName; }
    public String getReceiverEmail() { return receiverEmail; }
    public String getRoomId() { return roomId; }
    public String getMessage() { return message; }
    public boolean isRead() { return read; }
    public LocalDateTime getSentAt() { return sentAt; }

    public void setId(Long id) { this.id = id; }
    public void setSenderEmail(String v) { this.senderEmail = v; }
    public void setSenderName(String v) { this.senderName = v; }
    public void setReceiverEmail(String v) { this.receiverEmail = v; }
    public void setRoomId(String v) { this.roomId = v; }
    public void setMessage(String v) { this.message = v; }
    public void setRead(boolean v) { this.read = v; }
    public void setSentAt(LocalDateTime v) { this.sentAt = v; }
}

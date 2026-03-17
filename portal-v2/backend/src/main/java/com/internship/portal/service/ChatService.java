package com.internship.portal.service;

import com.internship.portal.model.ChatMessage;
import com.internship.portal.model.User;
import com.internship.portal.repository.ChatMessageRepository;
import com.internship.portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ChatService {

    @Autowired private ChatMessageRepository chatRepo;
    @Autowired private UserRepository        userRepository;

    // Generate consistent room ID from two emails
    public String getRoomId(String email1, String email2) {
        List<String> sorted = Arrays.asList(email1, email2);
        Collections.sort(sorted);
        return sorted.get(0) + "__" + sorted.get(1);
    }

    public Map<String, Object> sendMessage(String senderEmail, String senderName,
                                           String receiverEmail, String message) {
        Map<String, Object> res = new HashMap<>();
        String roomId = getRoomId(senderEmail, receiverEmail);
        ChatMessage msg = ChatMessage.create(senderEmail, senderName, receiverEmail, roomId, message);
        chatRepo.save(msg);
        res.put("success", true);
        res.put("message", msg);
        return res;
    }

    public List<ChatMessage> getMessages(String email1, String email2) {
        String roomId = getRoomId(email1, email2);
        List<ChatMessage> messages = chatRepo.findByRoomIdOrderBySentAtAsc(roomId);
        // Mark as read
        messages.stream()
                .filter(m -> m.getReceiverEmail().equals(email1) && !m.isRead())
                .forEach(m -> { m.setRead(true); chatRepo.save(m); });
        return messages;
    }

    public long getUnreadCount(String email) {
        return chatRepo.countUnreadByReceiver(email);
    }

    // Get all chat contacts for a user
    public List<Map<String, Object>> getContacts(String email) {
        List<String> rooms = chatRepo.findRoomsByEmail(email);
        List<Map<String, Object>> contacts = new ArrayList<>();

        for (String room : rooms) {
            String[] emails = room.split("__");
            String otherEmail = emails[0].equals(email) ? emails[1] : emails[0];

            List<ChatMessage> msgs = chatRepo.findByRoomIdOrderBySentAtAsc(room);
            if (msgs.isEmpty()) continue;

            ChatMessage last = msgs.get(msgs.size() - 1);
            long unread = msgs.stream()
                    .filter(m -> m.getReceiverEmail().equals(email) && !m.isRead())
                    .count();

            Map<String, Object> contact = new HashMap<>();
            contact.put("email",       otherEmail);
            contact.put("lastMessage", last.getMessage());
            contact.put("lastTime",    last.getSentAt());
            contact.put("unread",      unread);
            contact.put("roomId",      room);

            // Get name
            userRepository.findByEmail(otherEmail).ifPresent(u -> contact.put("name", u.getName()));
            contacts.add(contact);
        }

        contacts.sort((a, b) -> {
            java.time.LocalDateTime ta = (java.time.LocalDateTime) a.get("lastTime");
            java.time.LocalDateTime tb = (java.time.LocalDateTime) b.get("lastTime");
            return tb.compareTo(ta);
        });
        return contacts;
    }
}

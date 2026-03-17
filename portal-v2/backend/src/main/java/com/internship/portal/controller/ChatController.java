package com.internship.portal.controller;

import com.internship.portal.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:3000")
public class ChatController {

    @Autowired private ChatService chatService;

    @PostMapping("/send")
    public ResponseEntity<?> send(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(chatService.sendMessage(
                body.get("senderEmail"),
                body.get("senderName"),
                body.get("receiverEmail"),
                body.get("message")));
    }

    @GetMapping("/messages")
    public ResponseEntity<?> getMessages(@RequestParam String email1,
                                         @RequestParam String email2) {
        return ResponseEntity.ok(chatService.getMessages(email1, email2));
    }

    @GetMapping("/contacts/{email}")
    public ResponseEntity<?> getContacts(@PathVariable String email) {
        return ResponseEntity.ok(chatService.getContacts(email));
    }

    @GetMapping("/unread/{email}")
    public ResponseEntity<?> getUnread(@PathVariable String email) {
        return ResponseEntity.ok(Map.of("count", chatService.getUnreadCount(email)));
    }
}

package com.internship.portal.controller;

import com.internship.portal.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired private NotificationService notificationService;

    @GetMapping("/{email}")
    public ResponseEntity<?> getNotifications(@PathVariable String email) {
        return ResponseEntity.ok(notificationService.getByEmail(email));
    }

    @GetMapping("/unread/{email}")
    public ResponseEntity<?> getUnread(@PathVariable String email) {
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(email)));
    }

    @PutMapping("/mark-read/{email}")
    public ResponseEntity<?> markRead(@PathVariable String email) {
        return ResponseEntity.ok(notificationService.markAllRead(email));
    }
}

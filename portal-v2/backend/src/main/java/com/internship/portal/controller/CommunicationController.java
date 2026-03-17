package com.internship.portal.controller;

import com.internship.portal.model.Announcement;
import com.internship.portal.service.AnnouncementService;
import com.internship.portal.service.QnAService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class CommunicationController {

    @Autowired private QnAService          qnaService;
    @Autowired private AnnouncementService announcementService;

    // Q&A
    @PostMapping("/api/qna/ask")
    public ResponseEntity<?> ask(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(qnaService.askQuestion(body));
    }

    @PutMapping("/api/qna/answer/{id}")
    public ResponseEntity<?> answer(@PathVariable Long id,
                                    @RequestBody Map<String, String> body,
                                    Authentication auth) {
        String email = auth != null ? (String) auth.getPrincipal() : "admin@portal.com";
        return ResponseEntity.ok(qnaService.answerQuestion(
                id, body.get("answer"), email, body.get("adminName")));
    }

    @GetMapping("/api/qna/internship/{id}")
    public ResponseEntity<?> getByInternship(@PathVariable Long id) {
        return ResponseEntity.ok(qnaService.getByInternship(id));
    }

    @GetMapping("/api/qna/all")
    public ResponseEntity<?> getAllQna() {
        return ResponseEntity.ok(qnaService.getAll());
    }

    // Announcements
    @PostMapping("/api/announcements")
    public ResponseEntity<?> post(@RequestBody Announcement announcement, Authentication auth) {
        String email = auth != null ? (String) auth.getPrincipal() : "admin@portal.com";
        String name  = announcement.getPostedByName() != null ? announcement.getPostedByName() : "Admin";
        return ResponseEntity.ok(announcementService.post(announcement, email, name));
    }

    @GetMapping("/api/announcements")
    public ResponseEntity<?> getActive() {
        return ResponseEntity.ok(announcementService.getActive());
    }

    @GetMapping("/api/announcements/all")
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(announcementService.getAll());
    }

    @DeleteMapping("/api/announcements/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return ResponseEntity.ok(announcementService.delete(id));
    }

    @PutMapping("/api/announcements/pin/{id}")
    public ResponseEntity<?> pin(@PathVariable Long id) {
        return ResponseEntity.ok(announcementService.togglePin(id));
    }
}

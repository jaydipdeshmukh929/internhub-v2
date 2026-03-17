package com.internship.portal.controller;

import com.internship.portal.service.AIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:3000")
public class AIController {

    @Autowired private AIService aiService;

    @PostMapping("/cover-letter")
    public ResponseEntity<?> coverLetter(@RequestBody Map<String, Object> body, Authentication auth) {
        String email = auth != null ? (String) auth.getPrincipal() : (String) body.get("email");
        Long id = body.get("internshipId") != null ? Long.valueOf(body.get("internshipId").toString()) : null;
        String tone = (String) body.getOrDefault("tone", "professional");
        return ResponseEntity.ok(aiService.generateCoverLetter(email, id, tone));
    }

    @GetMapping("/interview-prep")
    public ResponseEntity<?> interviewPrep(@RequestParam(required = false) Long internshipId, Authentication auth) {
        String email = auth != null ? (String) auth.getPrincipal() : null;
        return ResponseEntity.ok(aiService.getInterviewPrep(internshipId, email));
    }

    @GetMapping("/job-match")
    public ResponseEntity<?> jobMatch(@RequestParam Long internshipId, Authentication auth) {
        String email = auth != null ? (String) auth.getPrincipal() : "";
        return ResponseEntity.ok(aiService.getJobMatchScore(email, internshipId));
    }

    @PostMapping("/parse-resume")
    public ResponseEntity<?> parseResume(@RequestParam MultipartFile file, Authentication auth) {
        String email = auth != null ? (String) auth.getPrincipal() : "";
        return ResponseEntity.ok(aiService.parseResume(file, email));
    }

    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(aiService.chatbotReply(body.getOrDefault("message", "")));
    }
}

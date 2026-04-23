package com.internship.portal.controller;

import com.internship.portal.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/student")
@CrossOrigin(origins = "*")
public class StudentFeaturesController {

    @Autowired private ResumeScoreService    resumeScoreService;
    @Autowired private RecommendationService recommendationService;
    @Autowired private BadgeService          badgeService;
    @Autowired private ReferralService       referralService;
    @Autowired private CertificateService    certificateService;
    @Autowired private UserService           userService;

    // Resume Score
    @PostMapping("/resume-score")
    public ResponseEntity<?> scoreResume(
            @RequestParam String email,
            @RequestParam MultipartFile file) {
        return ResponseEntity.ok(resumeScoreService.analyzeResume(email, file));
    }

    // Recommendations
    @GetMapping("/recommendations/{email}")
    public ResponseEntity<?> getRecommendations(@PathVariable String email) {
        return ResponseEntity.ok(recommendationService.getRecommendations(email));
    }

    // Badges
    @GetMapping("/badges/{email}")
    public ResponseEntity<?> getBadges(@PathVariable String email) {
        badgeService.checkAndAward(email);
        return ResponseEntity.ok(badgeService.getBadges(email));
    }

    // Referral info
    @GetMapping("/referral/{email}")
    public ResponseEntity<?> getReferral(@PathVariable String email) {
        return ResponseEntity.ok(referralService.getReferralInfo(email));
    }

    // Apply referral code
    @PostMapping("/referral/apply")
    public ResponseEntity<?> applyReferral(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(referralService.applyReferral(
                body.get("email"),
                body.get("referralCode")));
    }

    // Upload certificate
    @PostMapping("/certificate/upload")
    public ResponseEntity<?> uploadCertificate(
            @RequestParam String email,
            @RequestParam String studentName,
            @RequestParam String companyName,
            @RequestParam String role,
            @RequestParam(required = false) String completionDate,
            @RequestParam MultipartFile file) {
        return ResponseEntity.ok(
                certificateService.upload(email, studentName, companyName, role, completionDate, file));
    }

    // Get certificates
    @GetMapping("/certificates/{email}")
    public ResponseEntity<?> getCertificates(@PathVariable String email) {
        return ResponseEntity.ok(certificateService.getMyCertificates(email));
    }

    // Update portfolio links
    @PutMapping("/portfolio")
    public ResponseEntity<?> updatePortfolio(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(userService.updateProfile(body));
    }
}

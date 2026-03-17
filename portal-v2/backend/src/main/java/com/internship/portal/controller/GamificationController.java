package com.internship.portal.controller;

import com.internship.portal.service.GamificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/gamification")
@CrossOrigin(origins = "http://localhost:3000")
public class GamificationController {

    @Autowired private GamificationService gamificationService;

    @GetMapping("/profile/{email}")
    public ResponseEntity<?> getProfile(@PathVariable String email) {
        return ResponseEntity.ok(gamificationService.getProfile(email));
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<?> getLeaderboard() {
        return ResponseEntity.ok(gamificationService.getLeaderboard());
    }
}

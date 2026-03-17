package com.internship.portal.controller;

import com.internship.portal.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "http://localhost:3000")
public class AnalyticsController {

    @Autowired private AnalyticsService analyticsService;

    @GetMapping("/student/{email}")
    public ResponseEntity<?> studentAnalytics(@PathVariable String email) {
        return ResponseEntity.ok(analyticsService.getStudentAnalytics(email));
    }

    @GetMapping("/admin")
    public ResponseEntity<?> adminAnalytics() {
        return ResponseEntity.ok(analyticsService.getAdminAnalytics());
    }
}

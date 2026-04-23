package com.internship.portal.controller;
import com.internship.portal.service.AdvancedAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/analytics/advanced") @CrossOrigin(origins="*")
public class AdvancedAnalyticsController {
    @Autowired private AdvancedAnalyticsService service;
    @GetMapping("/funnel")   public ResponseEntity<?> funnel()   { return ResponseEntity.ok(service.getConversionFunnel()); }
    @GetMapping("/time-hire")public ResponseEntity<?> timeHire() { return ResponseEntity.ok(service.getTimeToHire()); }
    @GetMapping("/cohort")   public ResponseEntity<?> cohort()   { return ResponseEntity.ok(service.getCohortAnalysis()); }
}

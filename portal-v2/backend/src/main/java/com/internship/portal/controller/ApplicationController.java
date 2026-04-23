package com.internship.portal.controller;

import com.internship.portal.service.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "*")
public class ApplicationController {

    @Autowired private ApplicationService applicationService;

    @PostMapping("/apply")
    public ResponseEntity<?> apply(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(applicationService.apply(body));
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(applicationService.getAllApplications());
    }

    @GetMapping("/student/{email}")
    public ResponseEntity<?> getByStudent(@PathVariable String email) {
        return ResponseEntity.ok(applicationService.getByStudentEmail(email));
    }

    @GetMapping("/internship/{id}")
    public ResponseEntity<?> getByInternship(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.getByInternship(id));
    }

    @PutMapping("/status/{id}")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(applicationService.updateStatus(id, body));
    }

    @PostMapping("/interview/{id}")
    public ResponseEntity<?> scheduleInterview(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(applicationService.scheduleInterview(id, body));
    }

    @PutMapping("/withdraw/{id}")
    public ResponseEntity<?> withdraw(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(applicationService.withdraw(id, body.get("email")));
    }

    @GetMapping("/analytics")
    public ResponseEntity<?> analytics() {
        return ResponseEntity.ok(applicationService.getAnalytics());
    }
}

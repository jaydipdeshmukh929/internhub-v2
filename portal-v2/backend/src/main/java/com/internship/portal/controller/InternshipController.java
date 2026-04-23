package com.internship.portal.controller;

import com.internship.portal.model.Internship;
import com.internship.portal.service.AnalyticsService;
import com.internship.portal.service.InternshipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/internships")
@CrossOrigin(origins = "*")
public class InternshipController {

    @Autowired private InternshipService internshipService;
    @Autowired private AnalyticsService  analyticsService;

    @GetMapping("/all")
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(internshipService.getAll());
    }

    @GetMapping("/latest")
    public ResponseEntity<?> getLatest() {
        return ResponseEntity.ok(internshipService.getLatest());
    }

    @GetMapping("/trending")
    public ResponseEntity<?> getTrending() {
        return ResponseEntity.ok(internshipService.getTrending());
    }

    @GetMapping("/search")
    public ResponseEntity<?> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double minStipend,
            @RequestParam(required = false) Double maxStipend,
            @RequestParam(required = false) Boolean remote,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String sortBy) {
        return ResponseEntity.ok(internshipService.advancedSearch(
                keyword, location, category, minStipend, maxStipend, remote, type, sortBy));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return internshipService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/similar/{id}")
    public ResponseEntity<?> getSimilar(@PathVariable Long id) {
        return ResponseEntity.ok(internshipService.getSimilar(id));
    }

    @GetMapping("/company-analytics")
    public ResponseEntity<?> getCompanyAnalytics() {
        return ResponseEntity.ok(internshipService.getCompanyAnalytics());
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody Internship internship) {
        return ResponseEntity.ok(internshipService.add(internship));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Internship internship) {
        return ResponseEntity.ok(internshipService.update(id, internship));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        internshipService.delete(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/bookmark")
    public ResponseEntity<?> toggleBookmark(@RequestBody Map<String, Object> body) {
        String email = (String) body.get("email");
        Long id = Long.valueOf(body.get("internshipId").toString());
        return ResponseEntity.ok(internshipService.toggleBookmark(email, id));
    }

    @GetMapping("/saved/{email}")
    public ResponseEntity<?> getSaved(@PathVariable String email) {
        return ResponseEntity.ok(internshipService.getSavedInternships(email));
    }
}

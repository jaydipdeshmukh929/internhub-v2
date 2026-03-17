package com.internship.portal.controller;

import com.internship.portal.service.CompanyProfileService;
import com.internship.portal.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/companies")
@CrossOrigin(origins = "http://localhost:3000")
public class CompanyController {

    @Autowired private CompanyProfileService companyProfileService;
    @Autowired private ReviewService reviewService;

    @GetMapping("/all")
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(companyProfileService.getAll());
    }

    @GetMapping("/{name}")
    public ResponseEntity<?> getCompany(@PathVariable String name) {
        Map<String, Object> res = new HashMap<>();
        companyProfileService.getByName(name).ifPresentOrElse(
                cp -> {
                    res.put("profile", cp);
                    res.put("reviews", reviewService.getCompanyStats(name));
                },
                () -> res.put("profile", null)
        );
        return ResponseEntity.ok(res);
    }
}

package com.internship.portal.controller;

import com.internship.portal.model.Review;
import com.internship.portal.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {

    @Autowired private ReviewService reviewService;

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody Review review) {
        return ResponseEntity.ok(reviewService.addReview(review));
    }

    @GetMapping("/company/{companyName}")
    public ResponseEntity<?> getByCompany(@PathVariable String companyName) {
        return ResponseEntity.ok(reviewService.getCompanyStats(companyName));
    }
}

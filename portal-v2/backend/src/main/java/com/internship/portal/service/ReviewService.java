package com.internship.portal.service;

import com.internship.portal.model.Review;
import com.internship.portal.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ReviewService {

    @Autowired private ReviewRepository reviewRepository;

    public Map<String, Object> addReview(Review review) {
        Map<String, Object> res = new HashMap<>();
        if (reviewRepository.existsByStudentEmailAndCompanyName(
                review.getStudentEmail(), review.getCompanyName())) {
            res.put("success", false);
            res.put("message", "You have already reviewed this company");
            return res;
        }
        reviewRepository.save(review);
        res.put("success", true);
        res.put("message", "Review submitted");
        return res;
    }

    public List<Review> getByCompany(String companyName) {
        return reviewRepository.findByCompanyName(companyName);
    }

    public Map<String, Object> getCompanyStats(String companyName) {
        Map<String, Object> res = new HashMap<>();
        Double avg = reviewRepository.avgRatingByCompany(companyName);
        List<Review> reviews = reviewRepository.findByCompanyName(companyName);
        res.put("averageRating", avg != null ? Math.round(avg * 10.0) / 10.0 : 0);
        res.put("totalReviews", reviews.size());
        res.put("reviews", reviews);
        return res;
    }
}

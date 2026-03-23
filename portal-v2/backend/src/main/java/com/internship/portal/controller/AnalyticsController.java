//package com.internship.portal.controller;
//
//import com.internship.portal.service.AnalyticsService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.LinkedHashMap;
//import java.util.Map;
//
//@RestController
//@RequestMapping("/api/analytics")
//@CrossOrigin(origins = "http://localhost:3000")
//public class AnalyticsController {
//
//    @Autowired private AnalyticsService analyticsService;
//
//    @GetMapping("/student/{email}")
//    public ResponseEntity<?> studentAnalytics(@PathVariable String email) {
//        return ResponseEntity.ok(analyticsService.getStudentAnalytics(email));
//    }
//
//    @GetMapping("/admin")
//    public ResponseEntity<?> adminAnalytics() {
//        try {
//            return ResponseEntity.ok(analyticsService.getAdminAnalytics());
//        } catch (Exception e) {
//            // Return safe empty data so dashboard never crashes
//            Map<String, Object> empty = new LinkedHashMap<>();
//            empty.put("totalUsers",        0);
//            empty.put("totalStudents",     0);
//            empty.put("totalInternships",  0);
//            empty.put("totalApplications", 0);
//            empty.put("accepted",          0);
//            empty.put("rejected",          0);
//            empty.put("shortlisted",       0);
//            empty.put("interview",         0);
//            empty.put("applied",           0);
//            empty.put("applicationsPerDay", new LinkedHashMap<>());
//            empty.put("monthlyHeatmap",     new LinkedHashMap<>());
//            empty.put("companyWise",        new LinkedHashMap<>());
//            empty.put("categoryWise",       new LinkedHashMap<>());
//            empty.put("error", e.getMessage());
//            return ResponseEntity.ok(empty);
//        }
//    }
//}










































package com.internship.portal.controller;

import com.internship.portal.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

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
        try {
            return ResponseEntity.ok(analyticsService.getAdminAnalytics());
        } catch (Exception e) {
            // Return safe empty data so dashboard never crashes
            Map<String, Object> empty = new LinkedHashMap<>();
            empty.put("totalUsers",        0);
            empty.put("totalStudents",     0);
            empty.put("totalInternships",  0);
            empty.put("totalApplications", 0);
            empty.put("accepted",          0);
            empty.put("rejected",          0);
            empty.put("shortlisted",       0);
            empty.put("interview",         0);
            empty.put("applied",           0);
            empty.put("applicationsPerDay", new LinkedHashMap<>());
            empty.put("monthlyHeatmap",     new LinkedHashMap<>());
            empty.put("companyWise",        new LinkedHashMap<>());
            empty.put("categoryWise",       new LinkedHashMap<>());
            empty.put("error", e.getMessage());
            return ResponseEntity.ok(empty);
        }
    }
}

package com.internship.portal.service;

import com.internship.portal.model.Application;
import com.internship.portal.model.User;
import com.internship.portal.repository.ApplicationRepository;
import com.internship.portal.repository.InternshipRepository;
import com.internship.portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired private ApplicationRepository applicationRepository;
    @Autowired private InternshipRepository  internshipRepository;
    @Autowired private UserRepository        userRepository;

    // ── Student analytics ─────────────────────────────
    public Map<String, Object> getStudentAnalytics(String email) {
        Map<String, Object> res = new HashMap<>();
        List<Application> all = applicationRepository.findByStudentEmail(email);

        long total       = all.size();
        long accepted    = all.stream().filter(a -> a.getStatus() == Application.Status.ACCEPTED).count();
        long rejected    = all.stream().filter(a -> a.getStatus() == Application.Status.REJECTED).count();
        long pending     = all.stream().filter(a -> a.getStatus() == Application.Status.APPLIED).count();
        long shortlisted = all.stream().filter(a ->
                a.getStatus() == Application.Status.SHORTLISTED ||
                        a.getStatus() == Application.Status.INTERVIEW_SCHEDULED).count();
        long withdrawn   = all.stream().filter(a -> a.getStatus() == Application.Status.WITHDRAWN).count();

        double acceptanceRate = total > 0 ? Math.round(accepted * 100.0 / total * 10) / 10.0 : 0;
        double responseRate   = total > 0 ? Math.round((total - pending) * 100.0 / total * 10) / 10.0 : 0;

        res.put("total",          total);
        res.put("accepted",       accepted);
        res.put("rejected",       rejected);
        res.put("pending",        pending);
        res.put("shortlisted",    shortlisted);
        res.put("withdrawn",      withdrawn);
        res.put("acceptanceRate", acceptanceRate);
        res.put("responseRate",   responseRate);

        // Applications by company (top 5)
        Map<String, Long> byCompany = all.stream()
                .collect(Collectors.groupingBy(Application::getCompanyName, Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue,
                        (a, b) -> a, LinkedHashMap::new));
        res.put("byCompany", byCompany);

        // Monthly heatmap — count from appliedAt field in Java
        String[] months = {"Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"};
        long[] counts = new long[12];
        all.forEach(a -> { if (a.getAppliedAt() != null) counts[a.getAppliedAt().getMonthValue() - 1]++; });
        Map<String, Long> monthly = new LinkedHashMap<>();
        for (int i = 0; i < 12; i++) monthly.put(months[i], counts[i]);
        res.put("monthlyHeatmap", monthly);

        return res;
    }

    // ── Admin analytics ───────────────────────────────
    public Map<String, Object> getAdminAnalytics() {
        Map<String, Object> res = new HashMap<>();
        try {
            List<Application> allApps = applicationRepository.findAll();
            List<User> allUsers       = userRepository.findAll();

            // Summary counts
            res.put("totalUsers",        allUsers.size());
            res.put("totalStudents",     allUsers.stream().filter(u -> u.getRole() == User.Role.STUDENT).count());
            res.put("totalInternships",  internshipRepository.count());
            res.put("totalApplications", allApps.size());
            res.put("accepted",          allApps.stream().filter(a -> a.getStatus() == Application.Status.ACCEPTED).count());
            res.put("rejected",          allApps.stream().filter(a -> a.getStatus() == Application.Status.REJECTED).count());
            res.put("shortlisted",       allApps.stream().filter(a -> a.getStatus() == Application.Status.SHORTLISTED).count());
            res.put("interview",         allApps.stream().filter(a -> a.getStatus() == Application.Status.INTERVIEW_SCHEDULED).count());
            res.put("applied",           allApps.stream().filter(a -> a.getStatus() == Application.Status.APPLIED).count());

            // Applications per day — last 14 days (computed in Java, no DB function)
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM dd");
            Map<String, Long> dailyMap = allApps.stream()
                    .filter(a -> a.getAppliedAt() != null &&
                            a.getAppliedAt().isAfter(java.time.LocalDateTime.now().minusDays(14)))
                    .collect(Collectors.groupingBy(
                            a -> a.getAppliedAt().toLocalDate().format(fmt),
                            Collectors.counting()))
                    .entrySet().stream()
                    .sorted(Map.Entry.comparingByKey())
                    .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue,
                            (a, b) -> a, LinkedHashMap::new));
            res.put("applicationsPerDay", dailyMap);

            // Monthly heatmap — computed in Java
            String[] months = {"Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"};
            long[] mCounts = new long[12];
            allApps.forEach(a -> { if (a.getAppliedAt() != null) mCounts[a.getAppliedAt().getMonthValue() - 1]++; });
            Map<String, Long> monthlyMap = new LinkedHashMap<>();
            for (int i = 0; i < 12; i++) monthlyMap.put(months[i], mCounts[i]);
            res.put("monthlyHeatmap", monthlyMap);

            // Company-wise applications (top 10) — computed in Java
            Map<String, Long> companyMap = allApps.stream()
                    .filter(a -> a.getCompanyName() != null)
                    .collect(Collectors.groupingBy(Application::getCompanyName, Collectors.counting()))
                    .entrySet().stream()
                    .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                    .limit(10)
                    .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue,
                            (a, b) -> a, LinkedHashMap::new));
            res.put("companyWise", companyMap);

            // Category-wise internships — computed in Java
            Map<String, Long> catMap = internshipRepository.findAll().stream()
                    .filter(i -> i.getCategory() != null)
                    .collect(Collectors.groupingBy(
                            com.internship.portal.model.Internship::getCategory,
                            Collectors.counting()))
                    .entrySet().stream()
                    .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                    .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue,
                            (a, b) -> a, LinkedHashMap::new));
            res.put("categoryWise", catMap);

        } catch (Exception e) {
            // Return safe empty data so dashboard never crashes
            res.put("error", e.getMessage());
            res.put("totalUsers", 0); res.put("totalStudents", 0);
            res.put("totalInternships", 0); res.put("totalApplications", 0);
            res.put("accepted", 0); res.put("rejected", 0);
            res.put("shortlisted", 0); res.put("interview", 0); res.put("applied", 0);
            res.put("applicationsPerDay", new LinkedHashMap<>());
            res.put("monthlyHeatmap", new LinkedHashMap<>());
            res.put("companyWise", new LinkedHashMap<>());
            res.put("categoryWise", new LinkedHashMap<>());
        }
        return res;
    }
}

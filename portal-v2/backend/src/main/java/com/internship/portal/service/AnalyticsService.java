package com.internship.portal.service;

import com.internship.portal.model.Application;
import com.internship.portal.repository.ApplicationRepository;
import com.internship.portal.repository.InternshipRepository;
import com.internship.portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AnalyticsService {

    @Autowired private ApplicationRepository applicationRepository;
    @Autowired private InternshipRepository  internshipRepository;
    @Autowired private UserRepository        userRepository;

    // Student analytics
    public Map<String, Object> getStudentAnalytics(String email) {
        Map<String, Object> res = new HashMap<>();
        List<Application> all = applicationRepository.findByStudentEmail(email);

        long total      = all.size();
        long accepted   = all.stream().filter(a -> a.getStatus() == Application.Status.ACCEPTED).count();
        long rejected   = all.stream().filter(a -> a.getStatus() == Application.Status.REJECTED).count();
        long pending    = all.stream().filter(a -> a.getStatus() == Application.Status.APPLIED).count();
        long shortlisted= all.stream().filter(a -> a.getStatus() == Application.Status.SHORTLISTED ||
                a.getStatus() == Application.Status.INTERVIEW_SCHEDULED).count();
        long withdrawn  = all.stream().filter(a -> a.getStatus() == Application.Status.WITHDRAWN).count();

        double acceptanceRate = total > 0 ? Math.round((accepted * 100.0 / total) * 10.0) / 10.0 : 0;
        double responseRate   = total > 0 ? Math.round(((total - pending) * 100.0 / total) * 10.0) / 10.0 : 0;

        res.put("total",          total);
        res.put("accepted",       accepted);
        res.put("rejected",       rejected);
        res.put("pending",        pending);
        res.put("shortlisted",    shortlisted);
        res.put("withdrawn",      withdrawn);
        res.put("acceptanceRate", acceptanceRate);
        res.put("responseRate",   responseRate);

        // Applications by company
        Map<String, Long> byCompany = new LinkedHashMap<>();
        all.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        Application::getCompanyName, java.util.stream.Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .forEach(e -> byCompany.put(e.getKey(), e.getValue()));
        res.put("byCompany", byCompany);

        // Monthly application heatmap (student's own)
        Map<String, Long> monthly = new LinkedHashMap<>();
        String[] months = {"Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"};
        long[] counts = new long[12];
        all.forEach(a -> {
            if (a.getAppliedAt() != null) {
                counts[a.getAppliedAt().getMonthValue() - 1]++;
            }
        });
        for (int i = 0; i < 12; i++) monthly.put(months[i], counts[i]);
        res.put("monthlyHeatmap", monthly);

        return res;
    }

    // Admin analytics
    public Map<String, Object> getAdminAnalytics() {
        Map<String, Object> res = new HashMap<>();

        // Summary counts
        res.put("totalUsers",        userRepository.count());
        res.put("totalStudents",     userRepository.countByRole(com.internship.portal.model.User.Role.STUDENT));
        res.put("totalInternships",  internshipRepository.count());
        res.put("totalApplications", applicationRepository.count());
        res.put("accepted",          applicationRepository.countByStatus(Application.Status.ACCEPTED));
        res.put("rejected",          applicationRepository.countByStatus(Application.Status.REJECTED));
        res.put("shortlisted",       applicationRepository.countByStatus(Application.Status.SHORTLISTED));
        res.put("interview",         applicationRepository.countByStatus(Application.Status.INTERVIEW_SCHEDULED));
        res.put("applied",           applicationRepository.countByStatus(Application.Status.APPLIED));

        // Applications per day (last 14 days)
        List<Object[]> perDay = applicationRepository.applicationsPerDay();
        Map<String, Long> dailyMap = new LinkedHashMap<>();
        perDay.stream().limit(14).forEach(row -> dailyMap.put(row[0].toString(), (Long) row[1]));
        res.put("applicationsPerDay", dailyMap);

        // Applications per month (global heatmap)
        List<Object[]> perMonth = applicationRepository.applicationsPerMonth();
        Map<String, Long> monthlyMap = new LinkedHashMap<>();
        String[] months = {"Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"};
        long[] mCounts = new long[12];
        perMonth.forEach(row -> {
            int month = ((Number) row[0]).intValue();
            long count = ((Number) row[2]).longValue();
            mCounts[month - 1] += count;
        });
        for (int i = 0; i < 12; i++) monthlyMap.put(months[i], mCounts[i]);
        res.put("monthlyHeatmap", monthlyMap);

        // Company-wise applications (top 10)
        List<Object[]> byCompany = applicationRepository.countByCompany();
        Map<String, Long> companyMap = new LinkedHashMap<>();
        byCompany.stream().limit(10).forEach(row -> companyMap.put((String) row[0], (Long) row[1]));
        res.put("companyWise", companyMap);

        // Category-wise internships
        Map<String, Long> catMap = new LinkedHashMap<>();
        internshipRepository.findAll().stream()
                .filter(i -> i.getCategory() != null)
                .collect(java.util.stream.Collectors.groupingBy(
                        com.internship.portal.model.Internship::getCategory,
                        java.util.stream.Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .forEach(e -> catMap.put(e.getKey(), e.getValue()));
        res.put("categoryWise", catMap);

        return res;
    }
}
